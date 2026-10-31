import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handle,ADMIN_EMAIL} from '../backend/handler.js';
let env;
beforeEach(()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_closed_expediter.sql',import.meta.url),'utf8'));
 const prepare=(sql)=>({bind(...args){this.args=args;return this;},first(){return db.prepare(sql).get(...(this.args||[]))||null;},all(){return {results:db.prepare(sql).all(...(this.args||[]))};},run(){return {meta:db.prepare(sql).run(...(this.args||[]))};}});
 const objects=new Map();env={DB:{prepare,batch:async statements=>statements.map(s=>s.run())},BUCKET:{put:async(k,b)=>objects.set(k,b),get:async k=>objects.has(k)?{body:objects.get(k)}:null,delete:async k=>objects.delete(k)}};
});
const owner={'oai-authenticated-user-id':'owner','oai-authenticated-user-email':ADMIN_EMAIL};
const call=(path,method='GET',data,headers={})=>handle(new Request('https://portfolio.test/api/'+path,{method,headers:{...(data?{'content-type':'application/json'}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})}),env);
const project={title_en:'Test project',slug:'test-project'};
test('anonymous and other identities cannot mutate',async()=>{
 assert.equal((await call('records/Project','POST',project)).status,401);
 assert.equal((await call('records/Project','POST',project,{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.com'})).status,403);
 assert.equal((await call('uploads','POST',{},owner)).status,415);
});
test('owner CRUD persists and duplicate slugs are rejected',async()=>{
 const created=await call('records/Project','POST',project,owner);assert.equal(created.status,201);const row=await created.json();
 assert.equal((await call('records/Project','POST',project,owner)).status,409);
 assert.equal((await call('records/Project/'+row.id,'PATCH',{title_en:'Updated'},owner)).status,200);
 assert.equal((await (await call('records/Project')).json()).items[0].title_en,'Updated');
 assert.equal((await call('records/Project/'+row.id,'DELETE',null,owner)).status,200);
 assert.equal((await (await call('records/Project')).json()).items.length,0);
});
test('recommendations require moderation and reject status injection',async()=>{
 const data={name:'Engineer',message:'A reliable colleague on site.'};
 assert.equal((await call('recommendations','POST',{...data,status:'approved'})).status,400);
 assert.equal((await call('recommendations','POST',data)).status,202);
 assert.equal((await (await call('records/Recommendation')).json()).items.length,0);
 const pending=(await (await call('records/Recommendation','GET',null,owner)).json()).items[0];
 assert.equal((await call('records/Recommendation/'+pending.id)).status,404);
 assert.equal((await call('records/Recommendation/'+pending.id,'PATCH',{status:'approved'},owner)).status,200);
 assert.equal((await (await call('records/Recommendation')).json()).items.length,1);
});
test('validation blocks unsafe links, oversized bodies, CSRF, and prototype paths',async()=>{
 assert.equal((await call('records/MediaItem','POST',{kind:'cv',url:'javascript:alert(1)'},owner)).status,400);
 assert.equal((await call('records/TextOverride','POST',{lang:'en',path:'__proto__.x',value:'x'},owner)).status,400);
 assert.equal((await call('records/Project','POST',project,{...owner,origin:'https://evil.test'})).status,403);
 assert.equal((await call('records/Project','POST',{...project,title_en:'x'.repeat(110000)},owner)).status,413);
});
test('rate limit and honeypot do not publish spam',async()=>{
 const data={name:'Engineer',message:'Professional and reliable.'};
 for(let i=0;i<5;i++)assert.equal((await call('recommendations','POST',data)).status,202);
 assert.equal((await call('recommendations','POST',data)).status,429);
 assert.equal((await call('recommendations','POST',{...data,website:'spam'})).status,202);
});
test('initialization seeds once and deleted reference projects stay deleted',async()=>{
 assert.equal((await call('initialize','POST',null,owner)).status,200);
 const first=(await (await call('records/Project')).json()).items;assert.ok(first.length>0);
 await call('records/Project/'+first[0].id,'DELETE',null,owner);
 await call('initialize','POST',null,owner);
 assert.equal((await (await call('records/Project')).json()).items.length,first.length-1);
});
test('uploaded files persist and cannot be removed while attached',async()=>{
 const upload=await handle(new Request('https://portfolio.test/api/uploads',{method:'POST',headers:{...owner,'x-file-name':'cv.pdf'},body:'%PDF-1.7\nexample'}),env);
 assert.equal(upload.status,201);const file=await upload.json();
 assert.equal((await call('files/'+file.id)).status,200);
 const record=await (await call('records/MediaItem','POST',{kind:'cv',url:file.url},owner)).json();
 assert.equal((await call('files/'+file.id,'DELETE',null,owner)).status,409);
 await call('records/MediaItem/'+record.id,'DELETE',null,owner);
 assert.equal((await call('files/'+file.id,'DELETE',null,owner)).status,200);
 assert.equal((await call('files/'+file.id)).status,404);
});
test('public content feed exposes media type correctly and hides unapproved recommendations',async()=>{
 await call('records/MediaItem','POST',{kind:'cv_ar',title:'Arabic CV',url:'https://example.com/cv.pdf'},owner);
 await call('recommendations','POST',{name:'Engineer',message:'A reliable engineering colleague.'});
 const feed=await (await call('portfolio')).json();assert.ok(feed.records.some(r=>r.entity==='MediaItem'&&r.kind==='cv_ar'));assert.equal(feed.records.filter(r=>r.entity==='Recommendation').length,0);
 const cors=await call('portfolio','GET',null,{origin:'https://iemfaraz.github.io'});assert.equal(cors.headers.get('Access-Control-Allow-Origin'),'https://iemfaraz.github.io');
 const other=await call('portfolio','GET',null,{origin:'https://evil.test'});assert.equal(other.headers.get('Access-Control-Allow-Origin'),null);
 assert.equal((await call('records/Project','POST',project,{...owner,origin:'https://iemfaraz.github.io'})).status,403);
});
