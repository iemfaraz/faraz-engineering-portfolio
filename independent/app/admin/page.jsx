import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
import {env} from 'cloudflare:workers';
import {ADMIN_EMAIL} from '@/backend/handler';
import {initialize} from '@/backend/seed';
import Providers from '@/components/Providers';
import Dashboard from '@/components/Dashboard';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await getChatGPTUser();
 if(!user)return <main className="shell py-32"><p className="micro">Portfolio owner</p><h1 className="display mt-6 text-5xl">Manage your portfolio</h1><p className="my-6 text-muted-foreground">Sign in with the ChatGPT account connected to your admin email.</p><a className="btn-solid" target="_top" href={chatGPTSignInPath('/admin')}>Sign in with ChatGPT</a><a className="btn-line ms-3" href="/">View portfolio</a></main>;
 if(user.email.toLowerCase()!==(env.ADMIN_EMAIL||ADMIN_EMAIL).toLowerCase())return <main className="shell py-32"><h1 className="display text-4xl">Owner access only</h1><p className="mt-6">You are signed in as {user.email}. Admin access is assigned to {env.ADMIN_EMAIL||ADMIN_EMAIL}.</p><a href="/" className="btn-line mt-6">View portfolio</a></main>;
 await initialize(env);
 return <Providers><Dashboard/></Providers>;
}
