export function Link({to,params={},children,activeProps,activeOptions,...props}){
 let path=to;for(const [k,v] of Object.entries(params))path=path.replace('$'+k,encodeURIComponent(v));
 return <a href={path==='/'?'#top':'#'+path} {...props}>{children}</a>;
}
