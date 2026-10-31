import test from 'node:test';
import assert from 'node:assert/strict';
import {localizedRecord,dictionaryWithFallback} from '../src/localization.js';
import {githubError} from '../src/github/errors.js';
test('Arabic presentation preserves canonical English records and file URLs',()=>{
 const row={id:'p',entity:'Project',office:'Design office',slug:'project'};
 const snapshot={localization:{ar:{projects:{p:{office:'مكتب التصميم',slug:'bad-slug'}}}}};
 assert.equal(localizedRecord(snapshot,row,'ar').office,'مكتب التصميم');
 assert.equal(localizedRecord(snapshot,row,'ar').slug,'project');
 assert.equal(localizedRecord(snapshot,row,'en').office,'Design office');
 assert.equal(row.office,'Design office');
 const media={id:'m',entity:'MediaItem',title:'Cover',url:'https://example.com/a.png'};
 const localized=localizedRecord({localization:{ar:{media:{m:{title:'صورة',url:'javascript:bad'}}}}},media,'ar');
 assert.equal(localized.title,'صورة');assert.equal(localized.url,media.url);
});
test('new dictionary fields fall back safely until Arabic is generated',()=>{
 assert.deepEqual(dictionaryWithFallback({x:'English',new:'New field',items:['First']},{x:'العربية'}),{x:'العربية',new:'New field',items:['First']});
});
test('GitHub errors distinguish token permissions from rate limits and keep diagnostics',()=>{
 const headers={get:key=>({'x-accepted-github-permissions':'contents=write','x-github-request-id':'test-id'}[key]||null)};
 assert.match(githubError({status:403,headers},{message:'Resource not accessible by personal access token'},'POST /git/blobs').message,/contents=write/);
 assert.match(githubError({status:403,headers},{message:'API rate limit exceeded'},'GET /user').message,/rate-limited/);
 assert.match(githubError({status:401,headers},{message:'Bad credentials'},'GET /user').message,/expired or revoked/);
});
