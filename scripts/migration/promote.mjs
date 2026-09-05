import fs from 'node:fs/promises';
import path from 'node:path';
import { hash } from './lib.mjs';
const stage=process.argv[2];if(!stage)throw new Error('Usage: node scripts/migration/promote.mjs <staging-directory>');
const next=JSON.parse(await fs.readFile(path.join(stage,'conversion-report.json'),'utf8'));
const prior=JSON.parse(await fs.readFile('migration/reports/conversion-report.json','utf8'));
if(!next.generated_files || !prior.generated_files)throw new Error('Missing generated-file checksums; manual baseline review required');
// Validate every input and destination before writing anything.
if(prior.url_map_generated_sha256 && hash(await fs.readFile('migration/mappings/url-map.csv'))!==prior.url_map_generated_sha256)throw new Error('Manual URL-map edits preserved; merge required');
if(hash(await fs.readFile('migration/mappings/media-map.csv'))!==next.mapping_input_sha256)throw new Error('Media map changed since staging; re-import');
for(const [file,digest] of Object.entries(prior.generated_files)) {
 if(hash(await fs.readFile(file))!==digest)throw new Error(`Manual edit preserved; merge required: ${file}`);
 if(!next.generated_files[file])throw new Error(`Source removal requires review: ${file}`);
}
for(const [file,digest] of Object.entries(next.generated_files)) {
 if(!/^src\/(?:content|data)\//.test(file)||file.includes('..'))throw new Error('Unsafe generated path');
 if(hash(await fs.readFile(path.join(stage,file)))!==digest)throw new Error(`Staged file changed: ${file}`);
 if(!prior.generated_files[file]) { try {await fs.access(file);throw new Error(`Untracked destination exists: ${file}`);}catch(e){if(e.code!=='ENOENT')throw e;} }
}
for(const file of Object.keys(next.generated_files)) {await fs.mkdir(path.dirname(file),{recursive:true});await fs.copyFile(path.join(stage,file),file);}
for(const name of ['media-map.csv','url-map.csv'])await fs.copyFile(path.join(stage,name),`migration/mappings/${name}`);
await fs.copyFile(path.join(stage,'conversion-report.json'),'migration/reports/conversion-report.json');
console.log('Promoted reviewed staging data. Run tests, check, build and migration:verify before committing.');
