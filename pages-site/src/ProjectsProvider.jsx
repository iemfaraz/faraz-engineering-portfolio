import {useLang} from './LanguageProvider';
import {useLiveContent} from './LiveContent';
import {mergeProjects} from '@/lib/project-list';
export function ProjectsProvider({children}){return children;}
export function useProjects(){const {c,lang}=useLang();const {snapshot}=useLiveContent();const records=(snapshot?.records||[]).filter(r=>r.entity==='Project');return {items:snapshot?.initialized?mergeProjects([],records,lang,c.projects.filters):c.projects.items,extra:records};}
