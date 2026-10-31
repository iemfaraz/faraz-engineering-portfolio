import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateSnapshot,applyOperations,PUBLIC_ORIGIN} from '../src/github/model.js';
const snapshot=JSON.parse(fs.readFileSync('../portfolio-data.json','utf8'));
test('migrated projects and all uploads validate',()=>{assert.equal(validateSnapshot(snapshot).records.length,22);assert.equal(snapshot.files.length,12);assert.ok(snapshot.records.every(r=>!r.url?.includes('/api/files/')));});
test('reject unsafe links, duplicate project slugs and attached file removal',()=>{
 const project=snapshot.records.find(r=>r.entity==='Project');
 assert.throws(()=>applyOperations(snapshot,[{type:'create',kind:'Project',id:'new',data:{slug:project.slug,title_en:'Duplicate'}}]));
 assert.throws(()=>applyOperations(snapshot,[{type:'create',kind:'MediaItem',id:'new',data:{kind:'cv',url:'javascript:alert(1)'}}]));
 assert.throws(()=>applyOperations(snapshot,[{type:'removeFile',id:snapshot.files[0].id}]));
});
test('reject private pending recommendations',()=>assert.throws(()=>applyOperations(snapshot,[{type:'create',kind:'Recommendation',id:'new',data:{name:'Example',message:'A recommendation for testing only',status:'pending'}}])));
test('GitHub saves batch atomically, never force refs, and disconnect clears access',async()=>{
 globalThis.window=new EventTarget();globalThis.CustomEvent=class extends Event{constructor(type,options){super(type);this.detail=options.detail;}};
 const store=await import('../src/github-store.js');const calls=[];
 globalThis.fetch=async(url,options)=>{calls.push({url,options});assert.ok(url.startsWith('https://api.github.com/'));assert.equal(options.credentials,'omit');assert.equal(options.headers.Authorization,'Bearer test-only-token');const path=new URL(url).pathname;
 let data=path==='/user'?{login:'test-user'}:path.endsWith('/git/ref/heads/main')?{object:{sha:'head'}}:path.endsWith('/git/commits/head')?{tree:{sha:'tree'}}:path.endsWith('/contents/portfolio-data.json')?{encoding:'base64',content:Buffer.from(JSON.stringify(snapshot)).toString('base64')}:path.endsWith('/git/trees')?{sha:'new-tree'}:path.endsWith('/git/commits')?{sha:'new-commit'}:path.endsWith('/git/refs/heads/main')?{object:{sha:'new-commit'}}:{permissions:{push:true}};
 return {status:200,ok:true,json:async()=>data};};
 await store.connectGithub('test-only-token');
 await Promise.all(['en','ar'].map(lang=>store.portfolioApi.entities.TextOverride.create({path:'hero.title',lang,value:'Test'})));
 const trees=calls.filter(c=>c.options.method==='POST'&&c.url.endsWith('/git/trees'));assert.equal(trees.length,1);
 const entries=JSON.parse(trees[0].options.body).tree;assert.equal(JSON.parse(entries[0].content).records.length,24);
 const patch=calls.find(c=>c.options.method==='PATCH');assert.equal(JSON.parse(patch.options.body).force,false);
 store.disconnectGithub();assert.equal(store.githubSession().connected,false);const before=calls.length;await assert.rejects(store.refreshGithub().then(()=>store.portfolioApi.entities.Project.delete('missing')));assert.equal(calls.length,before);
});
