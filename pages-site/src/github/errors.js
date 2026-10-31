export function githubError(response,data,operation){
 const message=String(data?.message||'GitHub request failed.');
 const required=response.headers?.get?.('x-accepted-github-permissions');
 const requestId=response.headers?.get?.('x-github-request-id');
 let reason;
 if(response.status===401)reason='Your GitHub token is invalid, expired or revoked. Create a new repository-scoped token and reconnect.';
 else if(response.status===429||(response.status===403&&(/rate limit|abuse|temporarily blocked/i.test(message)||response.headers?.get?.('x-ratelimit-remaining')==='0')))reason='GitHub has temporarily rate-limited requests. Wait a few minutes, then reconnect or retry. Your edit was not published.';
 else if(response.status===403)reason='GitHub blocked this request. Edit your fine-grained token: Resource owner = iemfaraz; Only select repositories = faraz-engineering-portfolio; Repository permissions → Contents = Read and write. Save those token settings, then Disconnect and reconnect the dashboard. If GitHub requires approval for the token, approval must complete first.';
 else if(response.status===409||response.status===422)reason='GitHub rejected the save. Refresh and check for newer content or branch rules before retrying. The dashboard never force-pushes.';
 else if(response.status===404)reason='GitHub could not access this repository or file. Check that your token selects iemfaraz/faraz-engineering-portfolio.';
 else reason=message;
 return Object.assign(new Error(reason+' GitHub: '+message+' ['+operation+']'+(required?' Required: '+required+'.':'')+(requestId?' Request: '+requestId+'.':'')),{status:response.status});
}
