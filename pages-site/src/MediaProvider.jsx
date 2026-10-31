const base=import.meta.env.BASE_URL;
export function MediaProvider({children}){return children;}
export const useMedia=()=>({introVideo:{url:base+'assets/Faraz_Nawaz_Intro_Video.mp4',title:'Meet Faraz Nawaz'},sheetCover:null,drawings:[],projectCovers:{},projectVideos:{},projectFiles:[],cv:{url:base+'assets/Faraz_Nawaz_CV.pdf'},cvAr:null});
