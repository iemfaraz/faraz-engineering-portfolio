import {test,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handle} from '../backend/handler.js';
let db,env,proof,authorization,snapshot,fetchOriginal;
const id='12345678-1234-4234-8234-123456789abc';
const data={name:'Test Engineer',email:'private@example.com',phone:'+971 555 123 456',job_title:'Engineer',company:'Example',relation:'Colleague',profile_url:'https://example.com/profile',project_context:'Confidential assignment',message:'A reliable and professional colleague.',consent:true};
beforeEach(async()=>{
 db=new DatabaseSync(':memory:');for(const file of ['0000_closed_expediter.sql','0001_sour_warpath.sql'])db.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 env={DB:{prepare:sql=>({bind(...args){this.args=args;return this;},first(){return db.prepare(sql).get(...(this.args||[]))||null;},all(){return {results:db.prepare(sql).all(...(this.args||[]))};},run(){return {meta:db.prepare(sql).run(...(this.args||[]))};}})}};
 const secret='a'.repeat(64),now=Date.now();proof={version:1,scope:'recommendation-review',created_at:now,expires_at:now+600000,secret_hash:Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret))).toString('hex')};authorization=`Bearer ${now}-${id}.${secret}`;snapshot={records:[]};fetchOriginal=globalThis.fetch;
 globalThis.fetch=async url=>{assert.ok(url.startsWith('https://raw.githubusercontent.com/iemfaraz/faraz-engineering-portfolio/main/'));assert.ok(url.includes('?review_check='));return Response.json(url.includes('.recommendation-access/')?proof:snapshot);};
});
afterEach(()=>{globalThis.fetch=fetchOriginal;db.close();});
const call=(path='',method='GET',body,auth=false,origin='https://iemfaraz.github.io')=>handle(new Request('https://portfolio.test/api/recommendation-inbox'+path,{method,headers:{origin,...(body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:authorization}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
test('anonymous intake stores private details, denies status injection and never returns contacts',async()=>{
 const response=await call('','POST',data);assert.equal(response.status,201);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://iemfaraz.github.io');assert.deepEqual(await response.json(),{ok:true,status:'pending'});
 const row=db.prepare('SELECT * FROM recommendation_submissions').get();assert.equal(row.status,'pending');assert.equal(JSON.parse(row.data).email,data.email);
 assert.equal((await call()).status,401);assert.equal((await call('/'+row.id,'PATCH',{status:'approved'})).status,401);
 assert.equal((await call('','POST',{...data,status:'approved'})).status,400);assert.equal((await call('','POST',{...data,consent:false})).status,400);
 const feed=await handle(new Request('https://portfolio.test/api/portfolio'),env);assert.ok(!JSON.stringify(await feed.json()).includes(data.email));
});
test('GitHub repo proof protects inbox and expiry, origins, and wrong secrets fail closed',async()=>{
 await call('','POST',data);let response=await call('','GET',null,true);assert.equal(response.status,200);assert.equal((await response.json()).items[0].email,data.email);
 proof.secret_hash='0'.repeat(64);assert.equal((await call('','GET',null,true)).status,401);
 proof.expires_at=Date.now()-1;assert.equal((await call('','GET',null,true)).status,401);
 assert.equal((await call('','GET',null,true,'https://evil.test')).status,403);
 response=await call('','OPTIONS');assert.equal(response.status,204);assert.ok(response.headers.get('Access-Control-Allow-Headers').includes('Authorization'));
});
test('approval requires explicit GitHub publication and rejection requires unpublishing',async()=>{
 await call('','POST',data);const row=db.prepare('SELECT * FROM recommendation_submissions').get();
 assert.equal((await call('/'+row.id,'PATCH',{status:'approved'},true)).status,409);
 snapshot.records=[{entity:'Recommendation',id:'reviewed-'+row.id,status:'approved',name:data.name,message:data.message,job_title:data.job_title,company:data.company,relation:data.relation}];
 assert.equal((await call('/'+row.id,'PATCH',{status:'approved',notes:'Reviewed privately.'},true)).status,200);
 assert.equal((await call('/'+row.id,'PATCH',{status:'rejected'},true)).status,409);
 assert.equal((await call('/'+row.id,'DELETE',null,true)).status,409);
 snapshot.records=[];assert.equal((await call('/'+row.id,'PATCH',{status:'rejected'},true)).status,200);
 assert.equal((await call('/'+row.id,'DELETE',null,true)).status,200);assert.equal(db.prepare('SELECT COUNT(*) AS count FROM recommendation_submissions').get().count,0);
});
test('rate limits and bounded payloads protect public intake',async()=>{
 for(let n=0;n<5;n++)assert.equal((await call('','POST',data)).status,201);assert.equal((await call('','POST',data)).status,429);
 assert.equal((await call('','POST',{...data,website:'spam'})).status,202);
 assert.equal((await call('','POST',{...data,message:'x'.repeat(14000)})).status,413);
});
