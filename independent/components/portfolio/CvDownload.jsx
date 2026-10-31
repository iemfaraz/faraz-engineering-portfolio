import {Download} from 'lucide-react';
import {useLang} from './LanguageProvider';
import {useMedia} from './MediaProvider';
import {DEFAULT_CV_URL} from '@/hooks/use-cv-url';
export default function CvDownload({variant='solid',className=''}){
 const {c}=useLang();const {cv,cvAr}=useMedia();
 return <details className={'relative '+className}><summary className={(variant==='line'?'btn-line':'btn-solid')+' cursor-pointer list-none'}><Download size={14}/>{c.ui.cv}</summary><div className="absolute end-0 top-full z-[70] mt-2 min-w-56 border border-border bg-card p-3 text-foreground shadow-lg"><a className="block px-3 py-2 text-sm hover:text-primary" href={cv?.url||DEFAULT_CV_URL} download>{c.ui.cvEnglish}</a>{(cvAr?.content||cvAr?.url)&&<a className="block px-3 py-2 text-sm hover:text-primary" href={cvAr?.url||(typeof window!=="undefined"&&window.location.hostname.endsWith("github.io")?"#/cv/ar":"/cv/ar")}>{c.ui.cvArabic}</a>}</div></details>;
}
