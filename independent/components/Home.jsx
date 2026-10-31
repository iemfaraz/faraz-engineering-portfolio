'use client';
import {useEffect,useState} from 'react';
import Nav from './portfolio/Nav';
import Hero from './portfolio/Hero';
import Stats from './portfolio/Stats';
import Profile from './portfolio/Profile';
import Intent from './portfolio/Intent';
import Expertise from './portfolio/Expertise';
import Projects from './portfolio/Projects';
import Sheets from './portfolio/Sheets';
import Experience from './portfolio/Experience';
import Films from './portfolio/Films';
import Recommendations from './portfolio/Recommendations';
import Toolkit from './portfolio/Toolkit';
import LinkedIn from './portfolio/LinkedIn';
import Contact from './portfolio/Contact';
import Crosshair from './portfolio/Crosshair';
import {portfolioApi,request} from '@/lib/portfolio-api';
export default function Home(){
 const [items,setItems]=useState([]);
 useEffect(()=>{portfolioApi.entities.Recommendation.list().then(r=>setItems(r.items.filter(i=>i.status==='approved'))).catch(()=>{});},[]);
 return <><Nav/><main><Hero/><Stats/><Profile/><Intent/><Expertise/><Projects/><Sheets/><Experience/><Films/><Recommendations items={items} onSubmit={data=>request('recommendations',{method:'POST',body:JSON.stringify(data)})}/><Toolkit/><LinkedIn/><Contact/></main><Crosshair/></>;
}
