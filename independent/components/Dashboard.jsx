'use client';
import {useEffect,useState} from 'react';
import ThemeToggle from './portfolio/ThemeToggle';
import VideoManager from './admin/VideoManager';
import ProjectsManager from './admin/ProjectsManager';
import ProjectCoversManager from './admin/ProjectCoversManager';
import ProjectVideosManager from './admin/ProjectVideosManager';
import DrawingsManager from './admin/DrawingsManager';
import CvManager from './admin/CvManager';
import SectionEditor from './admin/SectionEditor';
import FilesManager from './admin/FilesManager';
import RecommendationsManager from './admin/RecommendationsManager';
const TABS=[['intro','Intro video',VideoManager],['projects','Projects',ProjectsManager],['covers','Project covers',ProjectCoversManager],['videos','Project videos',ProjectVideosManager],['drawings','Drawings',DrawingsManager],['cv','CV & profile photo',CvManager],['sections','Section details',SectionEditor],['files','Project files',FilesManager],['recommendations','Recommendations',RecommendationsManager]];
export default function Dashboard(){
 const [tab,setTab]=useState('intro');
 useEffect(()=>{const name=new URLSearchParams(window.location.search).get('tab');if(TABS.some(t=>t[0]===name))setTab(name);},[]);
 function pick(name){setTab(name);history.replaceState(null,'','/admin?tab='+name);}
 const Component=TABS.find(t=>t[0]===tab)?.[2]||VideoManager;
 return <div className="min-h-screen bg-background"><header className="border-b border-border"><div className="shell flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="micro">Faraz Nawaz / Portfolio owner</p><h1 className="mt-2 font-display text-lg font-bold uppercase tracking-wider">Portfolio dashboard</h1></div><div className="flex items-center gap-3"><ThemeToggle/><a href="https://iemfaraz.github.io/faraz-engineering-portfolio/" target="_blank" rel="noopener noreferrer" className="btn-line !px-3 !py-2 !text-xs">View public site ↗</a><a href="/" className="text-xs text-muted-foreground">Preview</a><a href="/signout-with-chatgpt?return_to=%2F" target="_top" className="text-xs text-muted-foreground">Sign out</a></div></div></header><nav aria-label="Manage portfolio" className="border-b border-border"><div className="no-scrollbar shell flex gap-6 overflow-x-auto py-4">{TABS.map(([key,label])=><button key={key} onClick={()=>pick(key)} aria-current={tab===key?'page':undefined} className={'shrink-0 border-b-2 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] '+(tab===key?'border-primary text-primary':'border-transparent text-muted-foreground hover:text-foreground')}>{label}</button>)}</div></nav><main className="shell py-10 md:py-14"><Component key={tab}/></main></div>;
}
