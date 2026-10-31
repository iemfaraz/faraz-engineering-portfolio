import {useState} from 'react';
import {useLiveContent} from './LiveContent';
import {request} from './github-store';
import {PUBLIC_ORIGIN} from './github/model';
import {toast} from 'sonner';
export default function GithubFiles(){const {snapshot}=useLiveContent();const [busy,setBusy]=useState(false);
 async function backup(){try{const data=await request('backup');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='portfolio-data.json';a.click();URL.revokeObjectURL(url);}catch(e){toast.error(e.message);}}
 async function remove(file){if(!confirm('Remove this unused file from GitHub? Earlier commits retain its history.'))return;setBusy(true);try{await request('files/'+file.id,{method:'DELETE'});toast.success('File removed from the current portfolio.');}catch(e){toast.error(e.message);}finally{setBusy(false);}}
 return <div className="max-w-4xl"><h1 className="display text-4xl">Project files</h1><p className="mt-4 text-muted-foreground">Your source, content and uploads are stored in your GitHub repository.</p><div className="mt-8 flex flex-wrap gap-3"><a className="btn-line" href="https://github.com/iemfaraz/faraz-engineering-portfolio/archive/refs/heads/main.zip">Download full project ZIP</a><button className="btn-solid" onClick={backup}>Export content JSON</button></div><div className="mt-8 divide-y divide-border border border-border">{(snapshot?.files||[]).map(file=><div className="flex flex-wrap items-center justify-between gap-3 p-4" key={file.id}><a href={PUBLIC_ORIGIN+file.path} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-primary">{file.name} · {(file.size/1024/1024).toFixed(1)} MB ↗</a><button className="text-sm text-destructive" disabled={busy} onClick={()=>remove(file)}>Remove unused file</button></div>)}</div></div>;
}
