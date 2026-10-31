import {initialize} from './seed.js';
import {schemas,validate,publicRecommendation,publicRecord,uploadType} from './validation.js';
export const ADMIN_EMAIL='faraznawaz2014@gmail.com';
const MAX_JSON=100000,MAX_UPLOAD=25*1024*1024;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status)=>{throw Object.assign(new Error(message),{status});};
function identity(request,env){
 const email=request.headers.get('oai-authenticated-user-email');
 const id=request.headers.get('oai-authenticated-user-id');
 return id&&email?{id,email,role:email.toLowerCase()===(env.ADMIN_EMAIL||ADMIN_EMAIL).toLowerCase()?'admin':'viewer'}:null;
}
function admin(request,env){const user=identity(request,env);if(!user)fail('Sign in to manage the portfolio.',401);if(user.role!=='admin')fail('Only the portfolio owner can make changes.',403);return user;}
async function bytesLimited(request,max){
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('Request is too large.',413);}chunks.push(value);}
 const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}return body;
}
async function readJson(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))fail('Expected JSON.',415);
 try{return JSON.parse(new TextDecoder().decode(await bytesLimited(request,MAX_JSON)));}catch(e){if(e.status)throw e;fail('Invalid JSON.',400);}
}
async function rateLimit(request,env){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';const bucket=Math.floor(Date.now()/3600000);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${ip}:${bucket}:recommendation`));
 const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const entry=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+3600000).first();
 if(entry.count>5)fail('Too many submissions. Please try again in an hour.',429);
 await env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(Date.now()).run();
}
async function saveRecord(env,kind,data,id){
 const now=new Date().toISOString();
 if(id){await env.DB.prepare('UPDATE records SET data=?,slug=?,updated_at=? WHERE id=? AND kind=?').bind(JSON.stringify(data),kind==='Project'?data.slug:null,now,id,kind).run();}
 else{id=crypto.randomUUID();await env.DB.prepare('INSERT INTO records (id,kind,data,slug,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id,kind,JSON.stringify(data),kind==='Project'?data.slug:null,now,now).run();}
 return {...data,id};
}
export async function handle(request,env){
 try{
 const url=new URL(request.url), parts=url.pathname.split('/').filter(Boolean).slice(1), method=request.method;
 if(!['GET','HEAD'].includes(method)){
  const origin=request.headers.get('origin');if(origin&&origin!==url.origin)fail('Cross-origin writes are not allowed.',403);
 }
 if(parts[0]==='health'){
  if(method!=='GET')fail('Method not allowed.',405);
  await env.DB.prepare('SELECT 1 AS ok').first();return json({ok:true,database:'connected',storage:!!env.BUCKET});
 }
 if(parts[0]==='session'&&method==='GET')return json({user:identity(request,env)});
 if(parts[0]==='files'&&parts[1]&&['GET','HEAD'].includes(method)){
  const id=parts[1];if(!/^[a-f0-9-]{36}\.(pdf|jpg|png|webp|mp4|webm)$/.test(id))fail('File not found.',404);
  const meta=await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(id).first();if(!meta)fail('File not found.',404);
  const file=await env.BUCKET.get(id,{range:request.headers});if(!file)fail('File not found.',404);
  const headers=new Headers({'Content-Type':meta.mime,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Content-Disposition':`inline; filename="${meta.name.replace(/[^a-zA-Z0-9._-]/g,'_')}"`,'Accept-Ranges':'bytes'});
  if(file.httpEtag)headers.set('ETag',file.httpEtag);
  let status=200;
  if(file.range&&'offset' in file.range){headers.set('Content-Range',`bytes ${file.range.offset}-${file.range.offset+file.range.length-1}/${meta.size}`);headers.set('Content-Length',String(file.range.length));status=206;}else headers.set('Content-Length',String(meta.size));
  return new Response(method==='HEAD'?null:file.body,{status,headers});
 }
 if(parts[0]==='initialize'&&method==='POST'){admin(request,env);await initialize(env);return json({ok:true});}
 if(parts[0]==='uploads'&&method==='GET'){admin(request,env);return json({items:(await env.DB.prepare('SELECT * FROM files ORDER BY created_at DESC LIMIT 1000').all()).results});}
 if(parts[0]==='files'&&parts[1]&&method==='DELETE'){
  admin(request,env);const id=parts[1];const attached=await env.DB.prepare("SELECT id FROM records WHERE json_extract(data,'$.url')=? LIMIT 1").bind('/api/files/'+id).first();
  if(attached)fail('This file is attached to content. Remove or replace that attachment first.',409);
  const meta=await env.DB.prepare('SELECT id FROM files WHERE id=?').bind(id).first();if(!meta)fail('File not found.',404);
  await env.BUCKET.delete(id);await env.DB.prepare('DELETE FROM files WHERE id=?').bind(id).run();return json({ok:true});
 }
 if(parts[0]==='uploads'&&method==='POST'){
  admin(request,env);const body=await bytesLimited(request,MAX_UPLOAD);if(!body.length)fail('Choose a file.',400);
  const type=uploadType(body);if(!type)fail('Upload a PDF, JPEG, PNG, WebP, MP4 or WebM file.',415);
  const name=(request.headers.get('x-file-name')||'upload').slice(0,180);const id=crypto.randomUUID()+'.'+type.ext;
  await env.BUCKET.put(id,body,{httpMetadata:{contentType:type.mime}});
  try{await env.DB.prepare('INSERT INTO files (id,name,mime,size,created_at) VALUES (?,?,?,?,?)').bind(id,name,type.mime,body.length,new Date().toISOString()).run();}catch(e){await env.BUCKET.delete(id);throw e;}
  return json({id,name,url:'/api/files/'+id,size:body.length},201);
 }
 if(parts[0]==='recommendations'&&method==='POST'){
  const input=publicRecommendation.parse(await readJson(request));if(input.website)return json({ok:true},202);
  await rateLimit(request,env);const {website,...data}=input;
  await saveRecord(env,'Recommendation',{...data,status:'pending'});return json({ok:true},202);
 }
 if(parts[0]==='backup'&&method==='GET'){
  admin(request,env);const {results}=await env.DB.prepare('SELECT * FROM records ORDER BY created_at').all();
  const files=await env.DB.prepare('SELECT * FROM files ORDER BY created_at').all();
  return json({version:1,exported_at:new Date().toISOString(),records:results.map(r=>({kind:r.kind,...publicRecord(r.kind,r)})),files:files.results});
 }
 if(parts[0]!=='records'||!schemas[parts[1]])fail('Endpoint not found.',404);
 const kind=parts[1],id=parts[2];
 if(method==='GET'){
  const isAdmin=identity(request,env)?.role==='admin';
  if(id){const row=await env.DB.prepare('SELECT * FROM records WHERE kind=? AND id=?').bind(kind,id).first();if(!row||(kind==='Recommendation'&&!isAdmin&&JSON.parse(row.data).status!=='approved'))fail('Record not found.',404);return json(publicRecord(kind,row));}
  const limit=Math.min(200,Math.max(1,Number(url.searchParams.get('limit'))||100));
  const offset=Math.max(0,parseInt(url.searchParams.get('cursor')||'0',10)||0);
  const filter=kind==='Recommendation'&&!isAdmin?" AND json_extract(data,'$.status')='approved'":'';
  const {results}=await env.DB.prepare(`SELECT * FROM records WHERE kind=?${filter} ORDER BY COALESCE(json_extract(data,'$.order'),0),created_at DESC LIMIT ? OFFSET ?`).bind(kind,limit+1,offset).all();
  const initialized=kind==='Project'?!!(await env.DB.prepare("SELECT id FROM records WHERE id='portfolio-initialized'").first()):true;
  const more=results.length>limit;return json({initialized,items:results.slice(0,limit).map(r=>publicRecord(kind,r)),has_more:more,next_cursor:more?String(offset+limit):null});
 }
 admin(request,env);
 if(method==='DELETE'&&id){const r=await env.DB.prepare('DELETE FROM records WHERE id=? AND kind=?').bind(id,kind).run();if(!r.meta.changes)fail('Record not found.',404);return json({ok:true});}
 if(method==='POST'&&!id)return json(await saveRecord(env,kind,validate(kind,await readJson(request))),201);
 if(method==='PATCH'&&id){
  const row=await env.DB.prepare('SELECT * FROM records WHERE id=? AND kind=?').bind(id,kind).first();if(!row)fail('Record not found.',404);
  const patch=await readJson(request);if(!patch||Array.isArray(patch)||typeof patch!=='object')fail('Expected an object.',400);
  return json(await saveRecord(env,kind,validate(kind,{...JSON.parse(row.data),...patch}),id));
 }
 fail('Method not allowed.',405);
 }catch(error){
  if(error.name==='ZodError')return json({error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},400);
  if(/UNIQUE constraint failed/.test(error.message))return json({error:'This project slug already exists.'},409);
  if(error.status)return json({error:error.message},error.status);
  return json({error:'The server could not complete this request. Please try again.'},500);
 }
}
