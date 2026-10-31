import {useEffect,useState} from 'react';
import {portfolioApi as api} from '@/lib/portfolio-api';
import {toast} from 'sonner';
export default function RecommendationsManager(){
 const [items,setItems]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){try{setItems((await api.entities.Recommendation.list({limit:200})).items);}catch(e){setError(e.message);}}
 useEffect(()=>{load();},[]);
 async function update(item,status){setBusy(true);try{await api.entities.Recommendation.update(item.id,{status});await load();toast.success(status==='approved'?'Recommendation published':'Recommendation hidden');}catch(e){toast.error(e.message);}finally{setBusy(false);}}
 async function remove(item){if(!confirm('Delete this recommendation?'))return;setBusy(true);try{await api.entities.Recommendation.delete(item.id);await load();}catch(e){toast.error(e.message);}finally{setBusy(false);}}
 return <div className="max-w-4xl"><h1 className="display text-4xl">Recommendations</h1><p className="mt-4 text-muted-foreground">Approve recommendations before they appear on your portfolio.</p>{error&&<p role="alert" className="mt-5 text-destructive">{error}</p>}<div className="mt-8 space-y-4">{!items.length&&<p className="border border-dashed border-border p-8">No recommendations received yet.</p>}{items.map(item=><article key={item.id} className="border border-border bg-card p-5"><p className="micro">{item.status}</p><h2 className="mt-2 font-semibold">{item.name}</h2><p className="text-sm text-muted-foreground">{item.job_title} · {item.company}</p><blockquote className="my-5">{item.message}</blockquote><div className="flex flex-wrap gap-3"><button className="btn-solid !py-2" disabled={busy} onClick={()=>update(item,'approved')}>Approve</button><button className="btn-line !py-2" disabled={busy} onClick={()=>update(item,'rejected')}>Hide</button><button className="text-sm text-destructive" disabled={busy} onClick={()=>remove(item)}>Delete</button></div></article>)}</div></div>;
}
