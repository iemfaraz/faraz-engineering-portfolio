// Localized display values never replace canonical English dashboard records.
export function localizedRecord(snapshot,row,lang){
 if(lang!=='ar')return row;
 const group={Project:'projects',MediaItem:'media',Recommendation:'recommendations'}[row.entity];
 const translated=snapshot?.localization?.ar?.[group]?.[row.id];
 if(!translated)return row;
 const fields={Project:['tags','engagement','office','period','disciplines','standards'],MediaItem:['title','note'],Recommendation:['name','job_title','company','relation','message']}[row.entity];
 return {...row,...Object.fromEntries(fields.filter(key=>typeof translated[key]==='string').map(key=>[key,translated[key]]))};
}
export function dictionaryWithFallback(english,arabic){
 if(typeof english==='string')return typeof arabic==='string'?arabic:english;
 if(Array.isArray(english))return english.map((value,i)=>dictionaryWithFallback(value,arabic?.[i]));
 if(english&&typeof english==='object')return Object.fromEntries(Object.entries(english).map(([key,value])=>[key,dictionaryWithFallback(value,arabic?.[key])]));
 return arabic??english;
}
