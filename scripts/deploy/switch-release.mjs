import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
const [linkArg,targetArg]=process.argv.slice(2);
if(!linkArg||!targetArg)throw new Error('Usage: node scripts/deploy/switch-release.mjs <static/current> <static/releases/release-id>');
const link=path.resolve(linkArg),target=await fs.realpath(targetArg);
if(path.basename(link)!=='current')throw new Error('The link must be named current');
const allowed=await fs.realpath(path.join(path.dirname(link),'releases'));
if(path.dirname(target)!==allowed)throw new Error('Release must be a direct child of the sibling releases directory');
try{await fs.access(path.join(target,'.incomplete'));throw new Error('Release is incomplete');}catch(e){if(e.code!=='ENOENT')throw e;}
const release=JSON.parse(await fs.readFile(path.join(target,'release.json'),'utf8'));
const verification=JSON.parse(await fs.readFile(path.join(target,'verification.json'),'utf8'));
if(verification.failures.length || !['preview','production'].includes(release.mode))throw new Error('Release has not passed validation');
for(const file of ['public/index.html','nginx/wp-id-maps.conf'])await fs.access(path.join(target,file));
let previous=null;
try{const stat=await fs.lstat(link);if(!stat.isSymbolicLink())throw new Error('Refusing to replace a real file or directory');previous=await fs.readlink(link);}catch(e){if(e.code!=='ENOENT')throw e;}
const temp=path.join(path.dirname(link),`.current-${randomUUID()}`);
await fs.symlink(target,temp);
try{await fs.rename(temp,link);}catch(e){await fs.unlink(temp);throw e;}
console.log(JSON.stringify({previous,current:target,mode:release.mode,next:'Run nginx -t, then reload. Restore the previous link if configuration validation fails.'},null,2));
