import {schemas} from '../reference/backend/validation.js';
import {recordData} from './github/model.js';
export const PROJECT_EDIT_FIELDS=['title_en','summary_en','scope_en','tags','engagement','office','period','disciplines','standards','order','cat'];
export const MEDIA_EDIT_FIELDS=['title','note','url'];
export const APPEARANCE_VALUES={accent:['blue','emerald','gold','violet'],hero_size:['compact','standard','large']};
export const REQUEST_ID=/^\d{13}-[a-f0-9-]{36}$/;
export function validateContext(context){
 if(!context||!['section','project','media','appearance'].includes(context.scope)||!Array.isArray(context.entries)||!context.entries.length||context.entries.length>150)throw Error('Choose a smaller portfolio section or one project.');
 if(JSON.stringify(context).length>22000)throw Error('Choose a smaller section for this request.');
 for(const e of context.entries){
  if(typeof e.id!=='string'||typeof e.field!=='string'||typeof e.value!=='string'||e.id.split('.').some(k=>['__proto__','constructor','prototype'].includes(k)))throw Error('Invalid assistant context.');
  if(context.scope==='section'&&e.field!=='value')throw Error('Invalid text field.');
  if(context.scope==='project'&&!PROJECT_EDIT_FIELDS.includes(e.field))throw Error('Unsupported project field.');
  if(context.scope==='media'&&!MEDIA_EDIT_FIELDS.includes(e.field))throw Error('Unsupported media field.');
  if(context.scope==='appearance'&&(!APPEARANCE_VALUES[e.field]||e.id!=='site'))throw Error('Unsupported appearance setting.');
 }
 return context;
}
function currentValue(snapshot,context,entry){
 if(context.scope==='section')return snapshot.records.find(r=>r.entity==='TextOverride'&&r.lang==='en'&&r.path===entry.id)?.value??entry.fallback??'';
 if(context.scope==='appearance')return snapshot.appearance?.[entry.field]??(entry.field==='accent'?'blue':'standard');
 const kind=context.scope==='project'?'Project':'MediaItem';
 const row=snapshot.records.find(r=>r.entity===kind&&r.id===entry.id);
 if(!row)throw Error('This item has been removed. Generate a new preview.');
 return String(row[entry.field]??'');
}
export function assertContextCurrent(snapshot,context){
 validateContext(context);
 for(const e of context.entries)if(currentValue(snapshot,context,e)!==e.value)throw Error('This section changed after the preview was prepared. Generate a new preview before applying it.');
}
export function planOperations(snapshot,plan,context){
 assertContextCurrent(snapshot,context);
 if(!plan||typeof plan.summary!=='string'||plan.summary.length>600||!Array.isArray(plan.changes)||!plan.changes.length||plan.changes.length>20)throw Error('Enter a valid change plan with a summary and 1–20 changes.');
 const edits=[],operations=[],seen=new Set(),updates=new Map();
 for(const change of plan.changes){
  if(!change||Object.keys(change).some(k=>!['target','id','field','value'].includes(k))||typeof change.value!=='string'||change.value.length>10000)throw Error('Invalid change. Values must be plain text up to 10,000 characters.');
  const entry=context.entries.find(e=>e.id===change.id&&e.field===change.field);
  if(change.target!==context.scope||!entry)throw Error('The plan targets an item outside the selected section.');
  const key=change.id+':'+change.field;if(seen.has(key))throw Error('The plan edits the same field twice.');seen.add(key);
  const value=change.value.trim();if(value===entry.value)continue;
  edits.push({...change,value,before:entry.value});
  if(context.scope==='section'){
   const existing=snapshot.records.find(r=>r.entity==='TextOverride'&&r.lang==='en'&&r.path===entry.id);
   if(!value||value===entry.fallback){if(existing)operations.push({type:'delete',kind:'TextOverride',id:existing.id});}
   else{const data=schemas.TextOverride.parse({path:entry.id,lang:'en',value});operations.push(existing?{type:'update',kind:'TextOverride',id:existing.id,data}:{type:'create',kind:'TextOverride',id:crypto.randomUUID(),data});}
  }else if(context.scope==='appearance'){
   if(!APPEARANCE_VALUES[entry.field].includes(value))throw Error('Choose a supported appearance value.');
   operations.push({type:'appearance',data:{[entry.field]:value}});
  }else{
   const kind=context.scope==='project'?'Project':'MediaItem';
   const data=updates.get(entry.id)||{kind,data:{}};data.data[entry.field]=entry.field==='order'?Number(value):value;updates.set(entry.id,data);
  }
 }
 for(const [id,update] of updates){const row=snapshot.records.find(r=>r.id===id&&r.entity===update.kind);schemas[update.kind].parse({...recordData(row),...update.data});operations.push({type:'update',kind:update.kind,id,data:update.data});}
 if(!operations.length)throw Error('The plan does not change the selected content. Try a more specific instruction.');
 return {operations,edits,summary:plan.summary};
}
