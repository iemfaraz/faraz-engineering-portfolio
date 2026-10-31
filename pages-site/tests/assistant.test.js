import test from 'node:test';
import assert from 'node:assert/strict';
import {planOperations,assertContextCurrent} from '../src/assistant-plan.js';
import {applyOperations} from '../src/github/model.js';
const snapshot={version:1,initialized:true,records:[],files:[]};
const context={scope:'section',label:'Hero',entries:[{id:'hero.lead',field:'value',value:'Original',fallback:'Original'}]};
const plan={summary:'Update introduction',changes:[{target:'section',id:'hero.lead',field:'value',value:'Electrical engineer in Riyadh.'}]};
test('reviewed section edit creates a valid English override and queues Arabic',()=>{
 const result=planOperations(snapshot,plan,context);const next=applyOperations(snapshot,result.operations);
 assert.equal(snapshot.records.length,0);assert.equal(next.records[0].path,'hero.lead');assert.equal(next.records[0].lang,'en');assert.equal(next.translation.status,'queued');
});
test('reject edits outside selected scope, executable URLs and stale previews',()=>{
 assert.throws(()=>planOperations(snapshot,{...plan,changes:[{...plan.changes[0],id:'profile.p1'}]},context),/outside/);
 const changed={...snapshot,records:[{entity:'TextOverride',id:'x',path:'hero.lead',lang:'en',value:'Newer wording'}]};
 assert.throws(()=>assertContextCurrent(changed,context),/changed after/);
 const media={...snapshot,records:[{id:'m',entity:'MediaItem',kind:'project_video',title:'Video',url:'https://example.com/video.mp4',order:0}]};
 assert.throws(()=>planOperations(media,{summary:'Link',changes:[{target:'media',id:'m',field:'url',value:'javascript:alert(1)'}]},{scope:'media',entries:[{id:'m',field:'url',value:'https://example.com/video.mp4'}]}));
});
test('Arabic-only publication does not invalidate English preview',()=>{
 assert.doesNotThrow(()=>assertContextCurrent({...snapshot,localization:{ar:{}}},context));
});
test('appearance edits accept only supported settings and keep content unchanged',()=>{
 const ctx={scope:'appearance',entries:[{id:'site',field:'accent',value:'blue'}]};
 const result=planOperations(snapshot,{summary:'Gold accent',changes:[{target:'appearance',id:'site',field:'accent',value:'gold'}]},ctx);
 const next=applyOperations(snapshot,result.operations);assert.equal(next.appearance.accent,'gold');assert.deepEqual(next.records,[]);
 assert.throws(()=>planOperations(snapshot,{summary:'Bad style',changes:[{target:'appearance',id:'site',field:'accent',value:'url(evil)'}]},ctx));
});
test('duplicate text paths are rejected rather than creating ambiguous overrides',()=>{
 const source={...snapshot,records:[{entity:'TextOverride',id:'x',path:'hero.lead',lang:'en',value:'Existing'}]};
 assert.throws(()=>applyOperations(source,[{type:'create',kind:'TextOverride',id:'y',data:{path:'hero.lead',lang:'en',value:'Duplicate'}}]),/changed/);
});
test('prompt requests write proposals only; reviewed application is atomic and rechecks current content',async()=>{
 globalThis.window=new EventTarget();globalThis.CustomEvent=class extends Event{constructor(type,options){super(type);this.detail=options.detail;}};
 const store=await import('../src/github-store.js');const calls=[];let live=structuredClone(snapshot);
 globalThis.fetch=async(url,options)=>{calls.push({url,options});const path=new URL(url).pathname;
  const data=path==='/user'?{login:'test'}:path.endsWith('/git/ref/heads/main')?{object:{sha:'head'}}:path.endsWith('/git/commits/head')?{tree:{sha:'tree'}}:path.endsWith('/contents/portfolio-data.json')?{encoding:'base64',content:Buffer.from(JSON.stringify(live)).toString('base64')}:path.endsWith('/git/blobs')?{sha:'probe'}:path.endsWith('/git/trees')?{sha:'new-tree'}:path.endsWith('/git/commits')?{sha:'new-commit'}:{permissions:{push:true}};
  return {status:200,ok:true,json:async()=>data};};
 await store.connectGithub('test-token');
 const request=await store.submitAssistantRequest('Make the introduction concise.',context);
 const requestTree=JSON.parse(calls.find(c=>c.url.endsWith('/git/trees')).options.body).tree;
 assert.equal(requestTree.length,1);assert.ok(requestTree[0].path.startsWith('ai/requests/'));
 assert.ok(!requestTree[0].content.includes('test-token'));
 const appearanceContext={scope:'appearance',entries:[{id:'site',field:'accent',value:'blue'}]};
 const appearancePlan={summary:'Gold accent',changes:[{target:'appearance',id:'site',field:'accent',value:'gold'}]};
 await store.applyAssistantPlan(appearancePlan,appearanceContext,snapshot,request.id);
 const trees=calls.filter(c=>c.url.endsWith('/git/trees'));const saved=JSON.parse(trees[1].options.body).tree;
 assert.ok(saved.some(e=>e.path==='ai/applied/'+request.id+'.json'));
 assert.equal(JSON.parse(saved.find(e=>e.path==='portfolio-data.json').content).appearance.accent,'gold');
 live={...snapshot,appearance:{accent:'violet'}};
 await assert.rejects(store.applyAssistantPlan(appearancePlan,appearanceContext,snapshot,request.id),/changed after/);
 assert.equal(calls.filter(c=>c.url.endsWith('/git/trees')).length,2);
 store.disconnectGithub();
});
