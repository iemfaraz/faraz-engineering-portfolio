import Recommendations from '@/components/portfolio/Recommendations';
import {useLang} from './LanguageProvider';
import {useLiveContent} from './LiveContent';
import {localizedRecord} from './localization.js';
export default function LocalizedRecommendations({items}){const {lang}=useLang();const {snapshot}=useLiveContent();return <Recommendations items={items.map(row=>localizedRecord(snapshot,row,lang))}/>;}
