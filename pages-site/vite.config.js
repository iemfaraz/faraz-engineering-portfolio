import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../independent/',import.meta.url));
const local=name=>fileURLToPath(new URL('./src/'+name,import.meta.url));
const base='/faraz-engineering-portfolio/';
export default defineConfig({base,server:{allowedHosts:['terminal.local']},publicDir:root+'public',plugins:[
 {name:'portfolio-asset-base',enforce:'pre',transform(code,id){if(/\.(jsx|js)$/.test(id)&&!id.includes('node_modules'))return code.replaceAll('"/assets/','"'+base+'assets/').replaceAll("'/assets/","'"+base+'assets/');}},react()],
 resolve:{dedupe:['react','react-dom'],alias:[
 {find:'@/components/portfolio/LanguageProvider',replacement:local('LanguageProvider.jsx')},
 {find:'@/components/portfolio/MediaProvider',replacement:local('MediaProvider.jsx')},
 {find:'@/components/portfolio/ProjectsProvider',replacement:local('ProjectsProvider.jsx')},
 {find:'@/components/portfolio/Nav',replacement:local('Nav.jsx')},
 {find:'@/components/portfolio/RecommendationForm',replacement:local('RecommendationForm.jsx')},
 {find:'@/lib/AuthContext',replacement:local('AuthContext.js')},
 {find:'@/lib/router-compat',replacement:local('router.jsx')},
 {find:'@',replacement:root},
 {find:'lucide-react',replacement:require.resolve('lucide-react').replace('dist/cjs/lucide-react.js','dist/esm/lucide-react.mjs')},
 ...['clsx','tailwind-merge'].map(name=>({find:name,replacement:fileURLToPath(import.meta.resolve(name))})),
 ]},
});
