import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { adsPermitted, articleDates } from '../../src/lib/article-seo.mjs';
const categories=JSON.parse(await fs.readFile('src/data/categories.json','utf8'));
const tags=JSON.parse(await fs.readFile('src/data/tags.json','utf8'));
const ids=new Set(),routes=new Set();
for(const file of (await fs.readdir('src/content',{recursive:true})).filter(f=>f.endsWith('.md'))){
 const text=await fs.readFile(path.join('src/content',file),'utf8');
 const match=text.match(/^---\n([\s\S]*?)\n---/);if(!match)throw Error(`Missing metadata: ${file}`);
 const data=YAML.parse(match[1]);
 if(data.ads_allowed === true && !adsPermitted(data)) throw Error(`Ads require an explicitly reviewed general blog article: ${file}`);
 if(data.seo_modified_at && data.seo_modified_at < articleDates(data).published) throw Error(`Editorial update predates publication: ${file}`);
 for(const [key,terms] of [['category_ids',categories],['tag_ids',tags]]){
  if(!Array.isArray(data[key])||data[key].some(id=>!terms.some(t=>t.id===id)))throw Error(`Unknown ${key}: ${file}`);
 }
 if(ids.has(data.source_id)||routes.has(data.canonical_path))throw Error(`Duplicate article ID or URL: ${file}`);
 ids.add(data.source_id);routes.add(data.canonical_path);
 if(!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])T\d{2}:\d{2}:\d{2}$/.test(data.published_at_local)||Number.isNaN(Date.parse(data.published_at_local)))throw Error(`Invalid publication date: ${file}`);
}
console.log(`Validated classification references and identities for ${ids.size} articles/pages`);
