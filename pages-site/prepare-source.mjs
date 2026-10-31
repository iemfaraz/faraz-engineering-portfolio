import {cpSync,existsSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../independent/',import.meta.url));
const target=fileURLToPath(new URL('./reference/',import.meta.url));
if(!existsSync(source)){if(existsSync(target))process.exit(0);throw Error('The independent portfolio source is missing.');}
for(const dir of ['components/portfolio','components/admin','content','public']){mkdirSync(target+'/'+dir,{recursive:true});cpSync(source+'/'+dir,target+'/'+dir,{recursive:true});}
for(const name of ['components/ProjectDetail.jsx','components/CvPage.jsx','components/portfolio/ArabicCvSheet.jsx','lib/download-pdf.js','components/ui/image.jsx','components/ui/input.jsx','components/ui/textarea.jsx','components/ui/label.jsx','backend/validation.js','hooks/use-cv-url.js','lib/utils.js','lib/content-fields.js','lib/project-list.js','tailwind.config.js']){mkdirSync(target+'/'+name.split('/').slice(0,-1).join('/'),{recursive:true});copyFileSync(source+'/'+name,target+'/'+name);}

for(const name of ["LanguageProvider","MediaProvider","ProjectsProvider","Nav","RecommendationForm"]){const exports=["Nav","RecommendationForm"].includes(name)?"export {default}":"export *";writeFileSync(target+"/components/portfolio/"+name+".jsx",exports+" from \"../../../src/"+name+".jsx\";\n");}

mkdirSync(target+'/public/admin',{recursive:true});
writeFileSync(target+'/public/admin/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../#/admin"><title>Portfolio dashboard</title></head><body><a href="../#/admin">Open portfolio dashboard</a></body></html>');

const repoRoot=fileURLToPath(new URL('../',import.meta.url));
if(existsSync(repoRoot+'portfolio-data.json'))copyFileSync(repoRoot+'portfolio-data.json',target+'/public/portfolio-data.json');
if(existsSync(repoRoot+'uploads'))cpSync(repoRoot+'uploads',target+'/public/uploads',{recursive:true});

// Rewrite bundled fallback assets for repository subpath hosting.
const cvManager=target+'/components/admin/CvManager.jsx';
import {readFileSync} from 'node:fs';
writeFileSync(cvManager,readFileSync(cvManager,'utf8').replaceAll("'/assets/photo.jpg'","'/faraz-engineering-portfolio/assets/photo.jpg'").replaceAll('href="/assets/','href="/faraz-engineering-portfolio/assets/'));
