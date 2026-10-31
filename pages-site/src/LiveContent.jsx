import {createContext,useContext,useEffect,useState} from 'react';
export const BACKEND='https://faraz-independent-portfolio.sassydot.chatgpt.site';
const Context=createContext({snapshot:null});
function mediaUrl(value){if(typeof value==='string'&&(value.startsWith('/api/files/')||value.startsWith('/assets/')))return BACKEND+value;return value;}
export function LiveContentProvider({children}){
 const [snapshot,setSnapshot]=useState(null);
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
 fetch(BACKEND+'/api/portfolio',{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal}).then(async response=>{
  if(!response.ok)throw Error('Content unavailable');const data=await response.json();if(!Array.isArray(data.records))throw Error('Invalid content');
  setSnapshot({...data,records:data.records.map(row=>({...row,...(row.url?{url:mediaUrl(row.url)}:{})}))});
 }).catch(()=>{/* Bundled portfolio remains available if live content is unavailable. */}).finally(()=>clearTimeout(timer));
 return()=>{clearTimeout(timer);controller.abort();};},[]);
 return <Context.Provider value={{snapshot}}>{children}</Context.Provider>;
}
export const useLiveContent=()=>useContext(Context);
