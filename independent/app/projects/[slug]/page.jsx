import Providers from '@/components/Providers';
import ProjectDetail from '@/components/ProjectDetail';
export default async function Page({params}){const {slug}=await params;return <Providers><ProjectDetail slug={slug}/></Providers>;}
