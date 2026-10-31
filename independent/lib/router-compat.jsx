import NextLink from 'next/link';
export function Link({to,params={},search,activeOptions,activeProps,children,...props}) {
 let href=to || '/';
 for(const [key,value] of Object.entries(params)) href=href.replace(`$${key}`,encodeURIComponent(value));
 if(search) href+='?'+new URLSearchParams(search);
 return <NextLink href={href} {...props}>{children}</NextLink>;
}
