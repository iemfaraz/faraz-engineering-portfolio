'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {request} from './portfolio-api';
const Context=createContext({user:null,isLoadingAuth:true});
export function AuthProvider({children}) {
 const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);
 useEffect(()=>{request('session').then(r=>setUser(r.user)).catch(()=>setUser(null)).finally(()=>setLoading(false));},[]);
 return <Context.Provider value={{user,isLoadingAuth:loading,logout:()=>{window.location.href='/signout-with-chatgpt?return_to=%2F';}}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
