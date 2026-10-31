import {useEffect,useState} from 'react';
import {request} from '@/lib/portfolio-api';
import {toast} from 'sonner';
export default function FilesManager(){
 const [files,setFiles]=useState([]),[busy,setBusy]=useState(false);
 async function load(){try{setFiles((await request('uploads')).items);}catch(e){toast.error(e.message);}}
 useEffect(()=>{load();},[]);
 async function backup(){try{const data=await request('backup');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Faraz-Portfolio-Data.json';a.click();URL.revokeObjectURL(url);}catch(e){toast.error(e.message);}}
 async function remove(file){if(!confirm('Permanently remove this unused upload?'))return;setBusy(true);try{await request('files/'+file.id,{method:'DELETE'});await load();}catch(e){toast.error(e.message);}finally{setBusy(false);}}
 return <div className="max-w-4xl"><h1 className="display text-4xl">Project files</h1><p className="mt-4 text-muted-foreground">Download your source project, export saved content, and remove unused uploads.</p><div className="mt-8 flex flex-wrap gap-3"><a href="https://github.com/iemfaraz/faraz-engineering-portfolio/archive/refs/heads/main.zip" className="btn-line">Download full source ZIP</a><button onClick={backup} className="btn-solid">Export saved content</button></div><p className="mt-4 text-sm text-muted-foreground">The content export contains file metadata. Download original uploaded files separately.</p><h2 className="mt-10 text-xl font-semibold">Uploaded files</h2><div className="mt-4 divide-y divide-border border border-border">{!files.length&&<p className="p-6 text-muted-foreground">No uploaded files yet.</p>}{files.map(f=><div key={f.id} className="flex items-center justify-between gap-4 p-4"><a href={'/api/files/'+f.id} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-sm text-primary">{f.name} · {(f.size/1024/1024).toFixed(1)} MB ↗</a><button className="shrink-0 text-sm text-destructive" disabled={busy} onClick={()=>remove(f)}>Remove</button></div>)}</div></div>;
}
