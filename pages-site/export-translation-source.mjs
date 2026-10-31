import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import en from '../independent/content/en.js';
import ar from '../independent/content/ar.js';
const output=process.argv[2];
if(!output)throw Error('Provide the temporary output path.');
writeFileSync(resolve(output),JSON.stringify({en,ar}));
