import {useLang} from './LanguageProvider';
import {useLiveContent} from './LiveContent';
import {mergeProjects} from '@/lib/project-list';
import {localizedRecord} from './localization.js';
export function ProjectsProvider({children}){return children;}
export function useProjects(){const {c,lang}=useLang();const {snapshot}=useLiveContent();const records=(snapshot?.records||[]).filter(r=>r.entity==='Project');return {refreshProjects:async()=>{},items:snapshot?.initialized?mergeProjects([],records.map(row=>localizedRecord(snapshot,row,lang)),lang,c.projects.filters):c.projects.items,extra:records};}
