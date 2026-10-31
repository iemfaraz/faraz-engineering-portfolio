import {useMedia} from './MediaProvider';
import ArabicCvSheet from '@/components/portfolio/ArabicCvSheet';
import {useRef} from 'react';
export default function CvText(){const {cvAr}=useMedia();const ref=useRef(null);let data;try{data=JSON.parse(cvAr?.content||'null');}catch{}return <main className="shell py-10"><div className="mb-8 flex justify-between gap-4"><a href="#top" className="btn-line">Back to portfolio</a>{data&&<button className="btn-solid" onClick={()=>window.print()}>Print / Save PDF</button>}</div>{data?<ArabicCvSheet data={data} sheetRef={ref}/>:<p>The Arabic CV is not available yet.</p>}</main>;}
