import {z} from 'zod';
const short=z.string().trim().max(200).default('');
const long=z.string().trim().max(10000).default('');
const safeUrl=z.string().max(1200).refine(value=>{
 if(/^\/(assets|api\/files)\/[a-zA-Z0-9_./%-]+$/.test(value)&&!value.includes('..'))return true;
 try{return new URL(value).protocol==='https:';}catch{return false;}
},'Use an HTTPS URL or an uploaded file.');
export const schemas={
 Project:z.object({slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),order:z.coerce.number().int().min(0).max(10000).default(0),cat:z.string().max(40).default('gov'),title_en:z.string().trim().min(1).max(200),title_ar:short,summary_en:long,summary_ar:long,tags:short,engagement:short,office:short,period:short,disciplines:long,standards:long,scope_en:long,scope_ar:long}).strict(),
 MediaItem:z.object({kind:z.enum(['intro_video','drawing_cover','drawing','project_cover','project_video','cv','project_file','cv_ar','profile_photo']),title:short,note:z.string().max(2000).optional(),url:safeUrl,slug:z.string().max(120).optional(),order:z.coerce.number().int().min(0).max(10000).default(0)}).strict(),
 TextOverride:z.object({path:z.string().min(1).max(200).refine(s=>!s.split('.').some(p=>['__proto__','constructor','prototype'].includes(p))),lang:z.enum(['en','ar']),value:z.string().max(10000)}).strict(),
 CvVersion:z.object({source_title:short,content:z.string().max(60000).refine(s=>{try{const p=JSON.parse(s);return typeof p.name==='string'&&Array.isArray(p.sections)&&p.sections.every(x=>typeof x.heading==='string'&&Array.isArray(x.lines)&&x.lines.every(l=>typeof l==='string'));}catch{return false;}},'Enter valid CV JSON with name and sections.'),translated_at:z.string().max(80).optional()}).strict(),
 Recommendation:z.object({name:z.string().trim().min(1).max(80),job_title:z.string().max(80).default(''),company:z.string().max(80).default(''),relation:z.string().max(80).default(''),message:z.string().trim().min(10).max(700),status:z.enum(['pending','approved','rejected']).default('pending')}).strict(),
};
export const publicRecommendation=schemas.Recommendation.omit({status:true}).extend({website:z.string().max(200).optional()}).strict();
export function validate(kind,value){return schemas[kind].parse(value);}
export function publicRecord(kind,record){
 const data=JSON.parse(record.data);return {...data,id:record.id,created_date:record.created_at};
}
export function uploadType(bytes){
 if(bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46&&bytes[4]===0x2d)return {mime:'application/pdf',ext:'pdf'};
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return {mime:'image/jpeg',ext:'jpg'};
 if([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return {mime:'image/png',ext:'png'};
 if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return {mime:'image/webp',ext:'webp'};
 if(new TextDecoder().decode(bytes.slice(4,8))==='ftyp')return {mime:'video/mp4',ext:'mp4'};
 if([0x1a,0x45,0xdf,0xa3].every((b,i)=>bytes[i]===b))return {mime:'video/webm',ext:'webm'};
 return null;
}
