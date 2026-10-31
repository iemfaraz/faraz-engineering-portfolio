export async function request(path,options={}) {
 const response=await fetch('/api/'+path,{credentials:'same-origin',...options,headers:{...(options.body && !(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...options.headers}});
 const result=await response.json().catch(()=>({error:'The server returned an unreadable response.'}));
 if(!response.ok) throw Object.assign(new Error(result.error || 'Request failed'),{status:response.status});
 return result;
}
const entity=(name)=>({
 list:({limit=200,cursor}={})=>request(`records/${name}?limit=${limit}${cursor?'&cursor='+encodeURIComponent(cursor):''}`),
 create:(value)=>request(`records/${name}`,{method:'POST',body:JSON.stringify(value)}),
 update:(id,value)=>request(`records/${name}/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(value)}),
 delete:(id)=>request(`records/${name}/${encodeURIComponent(id)}`,{method:'DELETE'}),
});
export const portfolioApi={entities:Object.fromEntries(['Project','MediaItem','TextOverride','CvVersion','Recommendation'].map(name=>[name,entity(name)]))};

portfolioApi.integrations={Core:{UploadPublicFile:async({file})=>{
 if(file.size>25*1024*1024)throw new Error('Choose a file smaller than 25 MB.');
 const r=await request('uploads',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':file.name.replace(/[^a-zA-Z0-9._-]/g,'_')},body:file});return {file_url:r.url};
}}};
