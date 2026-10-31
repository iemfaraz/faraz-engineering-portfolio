export const PUBLIC_RECOMMENDATION_FIELDS=['name','job_title','company','relation','message'];
export function reviewedPublicData(values,privatePhone=''){
 const result=Object.fromEntries(PUBLIC_RECOMMENDATION_FIELDS.map(key=>[key,String(values[key]||'').trim()]));
 if(!result.name||result.name.length>80||result.message.length<10||result.message.length>700||PUBLIC_RECOMMENDATION_FIELDS.filter(k=>k!=='message').some(k=>result[k].length>80))throw Error('Enter a name and a recommendation of 10–700 characters. Other public fields must be 80 characters or fewer.');
 const phone=privatePhone.replace(/\D/g,'');
 for(const value of Object.values(result))if(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)||phone.length>=7&&value.replace(/\D/g,'').includes(phone))throw Error('Remove email addresses and the private phone number from the public preview.');
 return {...result,status:'approved'};
}
export function recommendationRecordId(id){if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id))throw Error('Invalid submission ID.');return 'reviewed-'+id;}
