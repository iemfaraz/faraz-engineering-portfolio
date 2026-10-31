import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {displaySnapshot,validateSnapshot} from './github/model';
const Context=createContext({snapshot:null,refresh:async()=>{}});
export function LiveContentProvider({children}){
 const [snapshot,setSnapshot]=useState(null);
 const refresh=useCallback(async()=>{
  const response=await fetch(import.meta.env.BASE_URL+'portfolio-data.json?v='+Date.now(),{credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error('Portfolio data could not be loaded.');
  const data=validateSnapshot(await response.json());setSnapshot(displaySnapshot(data));return data;
 },[]);
 useEffect(()=>{refresh().catch(()=>{});const update=e=>setSnapshot(e.detail);window.addEventListener('portfolio:updated',update);return()=>window.removeEventListener('portfolio:updated',update);},[refresh]);
 return <Context.Provider value={{snapshot,refresh}}>{children}</Context.Provider>;
}
export const useLiveContent=()=>useContext(Context);
