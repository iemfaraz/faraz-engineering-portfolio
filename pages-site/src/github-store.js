import {REPOSITORY,PUBLIC_ORIGIN,validateSnapshot,applyOperations,displaySnapshot,uploadType} from './github/model.js';
import {githubError} from './github/errors.js';
let accessToken='';let account='';let queued=[];let scheduled=false;let tail=Promise.resolve();const pendingFiles=new Map();
const apiRoot='https://api.github.com/repos/'+REPOSITORY;
function emit(data){window.dispatchEvent(new CustomEvent('portfolio:updated',{detail:displaySnapshot(data)}));}
export function githubSession(){return {connected:!!accessToken,account};}
export function disconnectGithub(){accessToken='';account='';pendingFiles.clear();window.dispatchEvent(new Event('portfolio:auth'));}
async function api(path,{method='GET',body}={}){
 if(!accessToken)throw Error('Connect your repository-scoped GitHub token first.');
 if(!(path==='/user'||path.startsWith('/repos/'+REPOSITORY)))throw Error('Invalid GitHub target.');
 const response=await fetch('https://api.github.com'+path,{method,credentials:'omit',cache:'no-store',headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+accessToken,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=response.status===204?null:await response.json();
 if(!response.ok)throw githubError(response,data,method+' '+path);
 return data;
}
const repo=(path,options)=>api('/repos/'+REPOSITORY+path,options);
function decode64(value){const bytes=Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes);}
async function latest(){
 const ref=await repo('/git/ref/heads/main');const head=ref.object.sha;
 const [commit,file]=await Promise.all([repo('/git/commits/'+head),repo('/contents/portfolio-data.json?ref='+head)]);
 if(file.encoding!=='base64')throw Error('Portfolio data is too large or unreadable.');
 return {head,tree:commit.tree.sha,snapshot:validateSnapshot(JSON.parse(decode64(file.content)))};
}
export async function connectGithub(token){
 if(!token.trim())throw Error('Enter a fine-grained GitHub token.');accessToken=token.trim();
 try{const [user,repository]=await Promise.all([api('/user'),repo('')]);if(!repository.permissions?.push)throw Error('This GitHub account does not have write access to iemfaraz/faraz-engineering-portfolio. Use a token owned by an account with repository write access.');const value=await latest();
  // An unreferenced blob proves Contents:write without editing a file or branch.
  const probe=await repo('/git/blobs',{method:'POST',body:{content:'Portfolio dashboard write-permission check\n',encoding:'utf-8'}});
  if(!probe?.sha)throw Error('GitHub did not confirm write permission. Check token settings and reconnect.');
  account=user.login;emit(value.snapshot);window.dispatchEvent(new Event('portfolio:auth'));return account;}catch(e){disconnectGithub();throw e;}
}
export async function refreshGithub(){if(!accessToken)return;const value=await latest();emit(value.snapshot);return value.snapshot;}
export function requestTranslation(){return enqueue({type:'translate'});}
async function runBatch(batch){
 try{
  const current=await latest();const operations=batch.map(b=>b.operation);const next=applyOperations(current.snapshot,operations);const entries=[];const used=[];
  for(const [url,upload] of pendingFiles){if(!operations.some(op=>op.data?.url===url))continue;
   const blob=await repo('/git/blobs',{method:'POST',body:{content:upload.base64,encoding:'base64'}});
   entries.push({path:upload.meta.path,mode:'100644',type:'blob',sha:blob.sha});next.files.push(upload.meta);used.push(url);
  }
  for(const op of operations.filter(o=>o.type==='removeFile')){const old=current.snapshot.files.find(f=>f.id===op.id);entries.push({path:old.path,mode:'100644',type:'blob',sha:null});}
  entries.push({path:'portfolio-data.json',mode:'100644',type:'blob',content:JSON.stringify(next,null,2)+'\n'});
  const tree=await repo('/git/trees',{method:'POST',body:{base_tree:current.tree,tree:entries}});
  const commit=await repo('/git/commits',{method:'POST',body:{message:'Update portfolio content from GitHub dashboard',tree:tree.sha,parents:[current.head]}});
  try{await repo('/git/refs/heads/main',{method:'PATCH',body:{sha:commit.sha,force:false}});}catch(e){let confirmed=false;try{confirmed=(await repo('/git/ref/heads/main')).object.sha===commit.sha;}catch{}if(!confirmed)throw e;}
  used.forEach(url=>pendingFiles.delete(url));emit(next);
  window.dispatchEvent(new CustomEvent('portfolio:published',{detail:{sha:commit.sha}}));
  for(const b of batch){const result=next.records.find(r=>r.id===b.operation.id);b.resolve(result||{ok:true});}
 }catch(e){for(const b of batch)b.reject(e);}
}
function enqueue(operation){return new Promise((resolve,reject)=>{queued.push({operation,resolve,reject});if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;const batch=queued.splice(0);tail=tail.then(()=>runBatch(batch),()=>runBatch(batch));});}});}
const entity=kind=>({
 list:async({limit=200,cursor}={})=>{const {snapshot}=await latest();const rows=snapshot.records.filter(r=>r.entity===kind).sort((a,b)=>(a.order||0)-(b.order||0));const start=Number(cursor)||0;return {items:displaySnapshot({...snapshot,records:rows.slice(start,start+limit)}).records,has_more:rows.length>start+limit,next_cursor:rows.length>start+limit?String(start+limit):null};},
 create:data=>enqueue({type:'create',kind,id:crypto.randomUUID(),data}),
 update:(id,data)=>enqueue({type:'update',kind,id,data}),
 delete:id=>enqueue({type:'delete',kind,id}),
});
export async function stageUpload(file){
 if(!accessToken)throw Error('Connect GitHub before uploading files.');
 if(file.size>25*1024*1024)throw Error('Choose a file smaller than 25 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());const type=uploadType(bytes);if(!type)throw Error('Choose a PDF, JPEG, PNG, WebP, MP4 or WebM file.');
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const id=crypto.randomUUID()+'.'+type.ext;const path='uploads/'+id;const url=PUBLIC_ORIGIN+path;
 pendingFiles.set(url,{base64:btoa(binary),meta:{id,path,name:file.name.slice(0,180),mime:type.mime,size:file.size,created_at:new Date().toISOString()}});return {file_url:url};
}
export const portfolioApi={entities:Object.fromEntries(['Project','MediaItem','TextOverride','CvVersion','Recommendation'].map(k=>[k,entity(k)])),integrations:{Core:{UploadPublicFile:({file})=>stageUpload(file)}}};
export async function request(path,options={}){
 if(path==='backup')return (await latest()).snapshot;
 if(path==='uploads')return {items:(await latest()).snapshot.files};
 if(path.startsWith('files/')&&options.method==='DELETE')return enqueue({type:'removeFile',id:path.slice(6)});
 throw Error('Unsupported dashboard operation.');
}
