import {useLiveContent} from './LiveContent';
const base=import.meta.env.BASE_URL;
export function MediaProvider({children}){return children;}
export function useMedia(){
 const {snapshot,refresh}=useLiveContent();const media=(snapshot?.records||[]).filter(r=>r.entity==='MediaItem');
 const find=kind=>media.find(r=>r.kind===kind)||null;
 const map=kind=>Object.fromEntries(media.filter(r=>r.kind===kind&&r.slug).map(r=>[r.slug,r]));
 const cv=find('cv')||{url:base+'assets/Faraz_Nawaz_CV.pdf'};
 const translation=snapshot?.translation;
 const cvSource=new URL(cv.url,window.location.origin).href;
 const stale=translation?.cv_source_url&&translation.cv_source_url!==cvSource;
 const arabic=find('cv_ar');
 const version=(snapshot?.records||[]).find(r=>r.entity==='CvVersion');
 const cvAr=arabic&&!(stale&&arabic.id===translation.cv_media_id)?arabic:version&&!(stale&&version.id===translation.cv_version_id)?version:null;
 return {refreshMedia:async()=>{},introVideo:find('intro_video')||(snapshot?.initialized?null:{url:base+'assets/Faraz_Nawaz_Intro_Video.mp4',title:'Meet Faraz Nawaz'}),sheetCover:find('drawing_cover'),drawings:media.filter(r=>r.kind==='drawing'),projectCovers:map('project_cover'),projectVideos:map('project_video'),projectFiles:media.filter(r=>r.kind==='project_file'),profilePhoto:find('profile_photo'),cv,cvAr};
}
