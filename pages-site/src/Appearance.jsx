import {useEffect} from 'react';
import {useLiveContent} from './LiveContent';
export default function Appearance(){const {snapshot}=useLiveContent();const accent=snapshot?.appearance?.accent,hero=snapshot?.appearance?.hero_size;
 useEffect(()=>{const root=document.documentElement;const colors={blue:'220 100% 50%',emerald:'160 84% 32%',gold:'38 92% 42%',violet:'262 83% 58%'};if(colors[accent])root.style.setProperty('--primary',colors[accent]);else root.style.removeProperty('--primary');root.dataset.heroSize=['compact','standard','large'].includes(hero)?hero:'standard';return()=>{root.style.removeProperty('--primary');delete root.dataset.heroSize;};},[accent,hero]);return null;}
