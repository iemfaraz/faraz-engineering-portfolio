import {z} from 'zod';
const REPO='iemfaraz/faraz-engineering-portfolio';
const ORIGIN='https://iemfaraz.github.io';
const short=z.string().trim().max(80).default('');
const submission=z.object({name:z.string().trim().min(1).max(80),email:z.string().trim().email().max(254),phone:z.string().trim().max(40).default(''),job_title:short,company:short,relation:short,profile_url:z.string().trim().max(500).refine(v=>!v||/^https:\/\//i.test(v)&&URL.canParse(v),'Use an HTTPS profile link.').default(''),project_context:z.string().trim().max(500).default(''),message:z.string().trim().min(10).max(700),consent:z.literal(true),website:z.string().max(200).default('')}).strict();
const publicFields=['name','job_title','company','relation','message'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
async function read(request){if(!request.headers.get('content-type')?.startsWith('application/json'))fail('Expected JSON.',415);const reader=request.body?.getReader();let text='',length=0;const decoder=new TextDecoder();if(!reader)fail('Missing request.');for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>12000){await reader.cancel();fail('Request is too large.',413);}text+=decoder.decode(value,{stream:true});}try{return JSON.parse(text+decoder.decode());}catch{fail('Invalid JSON.');}}
export async function githubJson(path){
 // Public branch files need no API token. The raw endpoint avoids the shared
 // unauthenticated REST quota; a fresh query prevents stale moderation checks.
 const response=await fetch(`https://raw.githubusercontent.com/${REPO}/main/${path}?review_check=${Date.now()}`,{headers:{Accept:'application/json','User-Agent':'Faraz-Portfolio-Review','Cache-Control':'no-cache'},cache:'no-store'});
 if(!response.ok)fail(response.status===404?'Review access was not found. Reconnect GitHub and refresh the inbox.':`GitHub verification is temporarily unavailable (HTTP ${response.status}). Please retry.`,response.status===404?401:503);
 try{return await response.json();}catch{fail('GitHub verification failed.',503);}
}
export async function authorizeReview(request){
 const match=/^Bearer (\d{13}-[a-f0-9-]{36})\.([a-f0-9]{64})$/.exec(request.headers.get('authorization')||'');if(!match||!uuid.test(match[1].slice(14)))fail('Connect GitHub to review private recommendations.',401);
 const proof=await githubJson('.recommendation-access/'+match[1]+'.json');const now=Date.now();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(match[2])))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(proof.version!==1||proof.scope!=='recommendation-review'||proof.secret_hash!==hash||!Number.isSafeInteger(proof.created_at)||!Number.isSafeInteger(proof.expires_at)||proof.created_at>now+30000||proof.expires_at<=now||proof.expires_at-proof.created_at>600000||proof.expires_at<=proof.created_at||Number(match[1].slice(0,13))!==proof.created_at)fail('Review access expired. Refresh the inbox to reconnect.',401);
}
async function rateLimit(request,env){const now=Date.now(),bucket=Math.floor(now/3600000);const ip=request.headers.get('cf-connecting-ip')||'unknown';const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`private-recommendation:${ip}:${bucket}`)))).map(x=>x.toString(16).padStart(2,'0')).join('');const r=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(hash,now+3600000).first();if(r.count>5)fail('Too many submissions. Please try again in an hour.',429);await env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now).run();}
function row(r){return {id:r.id,...JSON.parse(r.data),status:r.status,notes:r.notes,created_at:r.created_at,updated_at:r.updated_at,reviewed_at:r.reviewed_at};}
export async function handleRecommendationInbox(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/recommendation-inbox'))return null;
 const origin=request.headers.get('origin');const allowed=origin===ORIGIN||origin===url.origin;const headers=allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, PATCH, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600','Vary':'Origin'}:{};
 let response;
 try{
  if(origin&&!allowed)fail('Origin is not allowed.',403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const parts=url.pathname.split('/').filter(Boolean);if(parts.length>3||parts[1]!=='recommendation-inbox')fail('Not found.',404);const id=parts[2];if(id&&!uuid.test(id))fail('Invalid submission ID.');
  if(request.method==='POST'&&!id){const data=submission.parse(await read(request));if(data.website)return json({ok:true,status:'pending'},202);await rateLimit(request,env);delete data.website;const now=new Date().toISOString(),newId=crypto.randomUUID();await env.DB.prepare('INSERT INTO recommendation_submissions (id,data,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(newId,JSON.stringify(data),'pending','',now,now).run();response=json({ok:true,status:'pending'},201);}
  else{
   await authorizeReview(request);
   if(request.method==='GET'&&!id){const status=url.searchParams.get('status')||'pending';if(!['pending','approved','rejected','all'].includes(status))fail('Invalid status.');const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>100000)fail('Invalid page.');const {results}=await env.DB.prepare('SELECT * FROM recommendation_submissions WHERE (? = \'all\' OR status = ?) ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?').bind(status,status,offset).all();const counts=await env.DB.prepare('SELECT status,COUNT(*) AS count FROM recommendation_submissions GROUP BY status').all();response=json({items:results.slice(0,50).map(row),has_more:results.length>50,next_offset:offset+50,counts:Object.fromEntries(counts.results.map(x=>[x.status,x.count]))});}
   else if(id&&['PATCH','DELETE'].includes(request.method)){
    const current=await env.DB.prepare('SELECT * FROM recommendation_submissions WHERE id=?').bind(id).first();if(!current)fail('Submission not found.',404);
    if(request.method==='DELETE'){const published=await githubJson('portfolio-data.json');if(published.records?.some(r=>r.entity==='Recommendation'&&r.id==='reviewed-'+id))fail('Unpublish this recommendation before deleting its private details.',409);await env.DB.prepare('DELETE FROM recommendation_submissions WHERE id=?').bind(id).run();response=json({ok:true});}
    else{
     const patch=z.object({status:z.enum(['pending','approved','rejected']).optional(),notes:z.string().max(2000).optional()}).strict().parse(await read(request));const status=patch.status||current.status;
     if(patch.status){const snapshot=await githubJson('portfolio-data.json');const published=snapshot.records?.find(r=>r.entity==='Recommendation'&&r.id==='reviewed-'+id);if(status==='approved'){if(!published||published.status!=='approved')fail('Publish the reviewed recommendation to GitHub first.',409);const privateData=JSON.parse(current.data);for(const field of publicFields){const value=published[field]||'';if(typeof value!=='string'||/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)||(privateData.phone&&privateData.phone.replace(/\D/g,'').length>=7&&value.replace(/\D/g,'').includes(privateData.phone.replace(/\D/g,''))))fail('Remove private contact details from the public preview.',409);}}else if(published)fail('Unpublish this recommendation before changing its review status.',409);}
     const now=new Date().toISOString();await env.DB.prepare('UPDATE recommendation_submissions SET status=?,notes=?,updated_at=?,reviewed_at=? WHERE id=?').bind(status,patch.notes??current.notes,now,patch.status?now:current.reviewed_at,id).run();response=json({ok:true,status});
    }
   }else fail('Method not allowed.',405);
  }
 }catch(error){response=error.name==='ZodError'?json({error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},400):json({error:error.status?error.message:'The review service could not complete this request. Please try again.'},error.status||500);}
 const outHeaders=new Headers(response.headers);for(const [key,value] of Object.entries(headers))outHeaders.set(key,value);return new Response(response.body,{status:response.status,headers:outHeaders});
}
