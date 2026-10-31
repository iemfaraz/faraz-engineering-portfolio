import {schemas,uploadType} from '../../reference/backend/validation.js';
export {uploadType};
export const REPOSITORY='iemfaraz/faraz-engineering-portfolio';
export const PUBLIC_ORIGIN='https://iemfaraz.github.io/faraz-engineering-portfolio/';
export function validateSnapshot(value){
 if(!value||value.version!==1||!Array.isArray(value.records)||!Array.isArray(value.files))throw Error('The portfolio data file is invalid.');
 if(value.records.length>5000||value.files.length>2000)throw Error('The portfolio data file is too large.');
 for(const r of value.records){if(!schemas[r.entity]||typeof r.id!=='string')throw Error('Invalid portfolio record.');schemas[r.entity].parse(recordData(r));}
 for(const f of value.files)if(!/^[a-f0-9-]{36}\.(pdf|jpg|png|webp|mp4|webm)$/.test(f.id)||f.path!=='uploads/'+f.id)throw Error('Invalid uploaded file path.');
 return value;
}
export function recordData(record){const {id,entity,created_date,...data}=record;return data;}
export function applyOperations(snapshot,operations){
 const next=structuredClone(snapshot);
 for(const op of operations){
  if(op.type==='appearance'){
   const allowed={accent:['blue','emerald','gold','violet'],hero_size:['compact','standard','large']};
   if(!op.data||Object.keys(op.data).some(k=>!allowed[k]?.includes(op.data[k])))throw Error('Unsupported appearance setting.');
   next.appearance={...next.appearance,...op.data};continue;
  }
  if(op.type==='translate'){next.translation={...next.translation,status:'queued',requested_at:new Date().toISOString()};continue;}
  if(op.type==='removeFile'){
   const file=next.files.find(f=>f.id===op.id);if(!file)throw Error('File not found.');
   if(next.records.some(r=>r.url===PUBLIC_ORIGIN+file.path||r.url?.endsWith('/'+file.path)))throw Error('This file is still attached. Remove or replace its attachment first.');
   next.files=next.files.filter(f=>f.id!==op.id);continue;
  }
  if(!schemas[op.kind])throw Error('Unknown content type.');
  const index=next.records.findIndex(r=>r.entity===op.kind&&r.id===op.id);
  if(op.type==='delete'){if(index<0)throw Error('Item no longer exists. Refresh the dashboard.');next.records.splice(index,1);continue;}
  if(op.type==='update'&&index<0)throw Error('Item no longer exists. Refresh the dashboard.');
  const data=schemas[op.kind].parse(op.type==='update'?{...recordData(next.records[index]),...op.data}:op.data);
  if(op.kind==='TextOverride'&&next.records.some(r=>r.entity==='TextOverride'&&r.lang===data.lang&&r.path===data.path&&r.id!==op.id))throw Error('This text field changed. Refresh before saving.');
  if(op.kind==='Project'&&next.records.some(r=>r.entity==='Project'&&r.slug===data.slug&&r.id!==op.id))throw Error('That project URL slug is already used.');
  if(op.kind==='Recommendation'&&data.status!=='approved')throw Error('Only approved recommendations can be stored in this public repository.');
  const row={...data,id:op.id,entity:op.kind,created_date:index<0?new Date().toISOString():next.records[index].created_date};
  if(index<0)next.records.push(row);else next.records[index]=row;
 }
 const changesEnglish=operations.some(op=>{
  const before=snapshot.records.find(r=>r.id===op.id&&r.entity===op.kind);
  const after=next.records.find(r=>r.id===op.id&&r.entity===op.kind);
  if(op.kind==='Project')return ['title_en','summary_en','scope_en','tags','engagement','office','period','disciplines','standards'].some(key=>before?.[key]!==after?.[key]);
  if(op.kind==='TextOverride')return (before?.lang==='en'||after?.lang==='en')&&before?.value!==after?.value;
  if(op.kind==='Recommendation')return ['name','job_title','company','relation','message'].some(key=>before?.[key]!==after?.[key]);
  return op.kind==='MediaItem'&&(['title','note'].some(key=>before?.[key]!==after?.[key])||((before?.kind==='cv'||after?.kind==='cv')&&before?.url!==after?.url));
 });
 if(changesEnglish)next.translation={...next.translation,status:'queued',requested_at:new Date().toISOString()};
 next.initialized=true;return next;
}
export function resolveMediaUrl(url){
 if(url?.startsWith('/assets/'))return PUBLIC_ORIGIN+url.slice(1);
 if(url?.startsWith('uploads/'))return PUBLIC_ORIGIN+url;
 return url;
}
export function displaySnapshot(snapshot){return {...snapshot,records:snapshot.records.map(r=>({...r,...(r.url?{url:resolveMediaUrl(r.url)}:{})}))};}
