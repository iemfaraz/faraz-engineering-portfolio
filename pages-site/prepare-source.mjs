import {cpSync,existsSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../independent/',import.meta.url));
const target=fileURLToPath(new URL('./reference/',import.meta.url));
if(!existsSync(source)){if(existsSync(target))process.exit(0);throw Error('The independent portfolio source is missing.');}
for(const dir of ['components/portfolio','content','public']){mkdirSync(target+'/'+dir,{recursive:true});cpSync(source+'/'+dir,target+'/'+dir,{recursive:true});}
for(const name of ['components/ProjectDetail.jsx','components/ui/image.jsx','hooks/use-cv-url.js','lib/utils.js','lib/content-fields.js','lib/project-list.js','tailwind.config.js']){mkdirSync(target+'/'+name.split('/').slice(0,-1).join('/'),{recursive:true});copyFileSync(source+'/'+name,target+'/'+name);}

for(const name of ["LanguageProvider","MediaProvider","ProjectsProvider","Nav","RecommendationForm"]){const exports=["Nav","RecommendationForm"].includes(name)?"export {default}":"export *";writeFileSync(target+"/components/portfolio/"+name+".jsx",exports+" from \"../../../src/"+name+".jsx\";\n");}
