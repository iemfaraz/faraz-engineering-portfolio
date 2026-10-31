import {redirect} from 'next/navigation';
export default async function Page({params}){const {tab}=await params;const tabs=['projects','covers','videos','drawings','cv','sections','files','recommendations'];redirect('/admin?tab='+(tabs.includes(tab)?tab:'intro'));}
