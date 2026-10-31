import {env} from 'cloudflare:workers';
import {handle} from '@/backend/handler';
export const dynamic='force-dynamic';
export const GET=request=>handle(request,env);
export const HEAD=request=>handle(request,env);
export const POST=request=>handle(request,env);
export const PATCH=request=>handle(request,env);
export const DELETE=request=>handle(request,env);

export const OPTIONS=request=>handle(request,env);
