import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import {ThemeProvider} from '@/components/portfolio/ThemeProvider';
import {LanguageProvider} from './LanguageProvider';
import Nav from './Nav';
import Hero from '@/components/portfolio/Hero';
import Stats from '@/components/portfolio/Stats';
import Profile from '@/components/portfolio/Profile';
import Intent from '@/components/portfolio/Intent';
import Expertise from '@/components/portfolio/Expertise';
import Projects from '@/components/portfolio/Projects';
import Sheets from '@/components/portfolio/Sheets';
import Experience from '@/components/portfolio/Experience';
import Films from '@/components/portfolio/Films';
import Recommendations from '@/components/portfolio/Recommendations';
import Toolkit from '@/components/portfolio/Toolkit';
import LinkedIn from '@/components/portfolio/LinkedIn';
import Contact from '@/components/portfolio/Contact';
import ProjectDetail from '@/components/ProjectDetail';
function App(){
 const [hash,setHash]=useState(window.location.hash);
 useEffect(()=>{const change=()=>{setHash(window.location.hash);requestAnimationFrame(()=>{if(window.location.hash.startsWith('#/projects/'))window.scrollTo(0,0);else document.getElementById(window.location.hash.slice(1)||'top')?.scrollIntoView();});};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
 const project=hash.match(/^#\/projects\/([^/?#]+)$/);
 return <ThemeProvider><LanguageProvider>{project?<ProjectDetail slug={decodeURIComponent(project[1])}/>:<><Nav/><main><Hero/><Stats/><Profile/><Intent/><Expertise/><Projects/><Sheets/><Experience/><Films/><Recommendations/><Toolkit/><LinkedIn/><Contact/></main></>}</LanguageProvider></ThemeProvider>;
}
createRoot(document.getElementById('root')).render(<App/>);
