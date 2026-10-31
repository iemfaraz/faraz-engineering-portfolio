import {createRecommendationReviewAccess} from './github-store';
const ENDPOINT='https://faraz-independent-portfolio.sassydot.chatgpt.site/api/recommendation-inbox';
async function call(path='',{method='GET',data,privateReview=false}={}){
 const access=privateReview?await createRecommendationReviewAccess():null;
 let response;try{response=await fetch(ENDPOINT+path,{method,credentials:'omit',cache:'no-store',headers:{...(data?{'Content-Type':'application/json'}:{}),...(access?{Authorization:'Bearer '+access}:{})},...(data?{body:JSON.stringify(data)}:{})});}catch{throw Error('The private recommendation service could not be reached. Please retry.');}
 let result;try{result=await response.json();}catch{throw Error('The recommendation service returned an unreadable response. Please retry.');}
 if(!response.ok)throw Error(result.error||'The recommendation request could not be completed.');return result;
}
export const submitRecommendation=data=>call('',{method:'POST',data});
export const listRecommendationInbox=(status='pending',offset=0)=>call('?status='+encodeURIComponent(status)+'&offset='+offset,{privateReview:true});
export const updateRecommendationReview=(id,data)=>call('/'+encodeURIComponent(id),{method:'PATCH',data,privateReview:true});
export const deletePrivateRecommendation=id=>call('/'+encodeURIComponent(id),{method:'DELETE',privateReview:true});
