import {useLang} from './LanguageProvider';
export function ProjectsProvider({children}){return children;}
export const useProjects=()=>{const {c}=useLang();return {items:c.projects.items,extra:[]};};
