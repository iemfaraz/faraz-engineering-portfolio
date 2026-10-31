import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewedPublicData,recommendationRecordId} from '../src/recommendation-review.js';
import {applyOperations} from '../src/github/model.js';
test('review publication whitelists public fields, excludes contacts and uses a stable id',()=>{
 const source={name:'Engineer',job_title:'Site engineer',company:'Example',relation:'Colleague',message:'A dependable and professional colleague.',email:'secret@example.com',phone:'+971 555 123 456',notes:'Private review',profile_url:'https://example.com/private',project_context:'Private project',consent:true};
 const data=reviewedPublicData(source,source.phone);assert.deepEqual(Object.keys(data),['name','job_title','company','relation','message','status']);
 const id=recommendationRecordId('12345678-1234-4234-8234-123456789abc');const op={type:'create',kind:'Recommendation',id,data};
 const first=applyOperations({version:1,records:[],files:[]},[op]);const next=applyOperations(first,[op]);assert.equal(next.records.length,1);assert.equal(next.translation.status,'queued');assert.ok(!JSON.stringify(next).includes(source.email));
 assert.throws(()=>reviewedPublicData({...source,message:'Contact me at secret@example.com'},source.phone),/Remove email/);
 assert.throws(()=>reviewedPublicData({...source,message:'Contact me at +971 555 123 456'},source.phone),/private phone/);
});
