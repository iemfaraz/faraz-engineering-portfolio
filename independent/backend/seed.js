import en from '../content/en.js';
import ar from '../content/ar.js';
export async function initialize(env){
 if(await env.DB.prepare("SELECT id FROM records WHERE id='portfolio-initialized'").first())return;
 const now=new Date().toISOString();
 const entries=en.projects.items.map((p,i)=>{
  const a=ar.projects.items.find(x=>x.slug===p.slug)||{};
  return {id:'reference-'+p.slug,kind:'Project',data:{slug:p.slug,order:i,cat:p.cat,title_en:p.title,title_ar:a.title||'',summary_en:p.summary,summary_ar:a.summary||'',tags:p.tags.join(', '),engagement:p.engagement,office:p.office,period:p.period,disciplines:p.disciplines.join(', '),standards:p.standards.join(', '),scope_en:p.scope.join('\n'),scope_ar:(a.scope||[]).join('\n')}};
 });
 entries.push({id:'reference-intro',kind:'MediaItem',data:{kind:'intro_video',title:'Faraz Nawaz — introduction',url:'/assets/Faraz_Nawaz_Intro_Video.mp4',order:0}});
 entries.push({id:'portfolio-initialized',kind:'System',data:{initialized:true}});
 await env.DB.batch(entries.map(e=>env.DB.prepare('INSERT OR IGNORE INTO records (id,kind,data,slug,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(e.id,e.kind,JSON.stringify(e.data),e.kind==='Project'?e.data.slug:null,now,now)));
}
