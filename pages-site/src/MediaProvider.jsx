import {useLiveContent} from './LiveContent';
const base=import.meta.env.BASE_URL;
export function MediaProvider({children}){return children;}
export function useMedia(){
 const {snapshot}=useLiveContent();const media=(snapshot?.records||[]).filter(r=>r.entity==='MediaItem');
 const find=kind=>media.find(r=>r.kind===kind)||null;
 const map=kind=>Object.fromEntries(media.filter(r=>r.kind===kind&&r.slug).map(r=>[r.slug,r]));
 return {introVideo:find('intro_video')||(snapshot?.initialized?null:{url:base+'assets/Faraz_Nawaz_Intro_Video.mp4',title:'Meet Faraz Nawaz'}),sheetCover:find('drawing_cover'),drawings:media.filter(r=>r.kind==='drawing'),projectCovers:map('project_cover'),projectVideos:map('project_video'),projectFiles:media.filter(r=>r.kind==='project_file'),profilePhoto:find('profile_photo'),cv:find('cv')||{url:base+'assets/Faraz_Nawaz_CV.pdf'},cvAr:find('cv_ar')||(snapshot?.records||[]).find(r=>r.entity==='CvVersion')||null};
}
