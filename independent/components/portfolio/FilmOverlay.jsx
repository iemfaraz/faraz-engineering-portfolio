import {useEffect,useRef} from 'react';
export default function FilmOverlay({open,onClose,src,title,closeLabel}){
 const ref=useRef(null);
 useEffect(()=>{const d=ref.current;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close();},[open]);
 return <dialog ref={ref} onCancel={onClose} className="m-auto w-[95vw] max-w-5xl border border-border bg-background p-4 text-foreground backdrop:bg-black/85"><div className="mb-4 flex items-center justify-between"><h2>{title}</h2><button className="btn-line !px-3 !py-2" onClick={onClose}>{closeLabel||'Close'}</button></div>{open&&<video src={src} controls autoPlay playsInline className="max-h-[75vh] w-full"/>}</dialog>;
}
