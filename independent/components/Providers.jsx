'use client';
import {ThemeProvider} from './portfolio/ThemeProvider';
import {AuthProvider} from '@/lib/AuthContext';
import {LanguageProvider} from './portfolio/LanguageProvider';
import {MediaProvider} from './portfolio/MediaProvider';
import {ProjectsProvider} from './portfolio/ProjectsProvider';
import {Toaster} from 'sonner';
export default function Providers({children}){return <ThemeProvider><AuthProvider><LanguageProvider><MediaProvider><ProjectsProvider>{children}</ProjectsProvider></MediaProvider></LanguageProvider><Toaster richColors/></AuthProvider></ThemeProvider>;}
