import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import {marked} from 'marked';
import {load} from 'cheerio';
import sharp from 'sharp';
const thumbnails={};
for(const file of (await fs.readdir('src/content',{recursive:true})).filter(f=>f.endsWith('.md'))){
 const text=await fs.readFile(path.join('src/content',file),'utf8');
 const parts=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!parts)continue;
 const meta=YAML.parse(parts[1]);if(meta.content_type!=='post')continue;
 const $=load(await marked.parse(parts[2]));
 const src=$('img[src]').toArray().map(el=>$(el).attr('src')).find(s=>s.startsWith('/img/blog/')&&!s.includes('..'));
 if(!src)continue;
 const bytes=await fs.readFile(path.join('public',src));
 const hash=crypto.createHash('sha256').update(bytes).update('thumb-v1-320x240-contain').digest('hex').slice(0,20);
 const target=`/img/blog/thumbnails/${hash}.webp`;
 await fs.mkdir('public/img/blog/thumbnails',{recursive:true});
 await sharp(bytes).rotate().resize(320,240,{fit:'contain',background:'#ffffff',withoutEnlargement:true}).webp({quality:80}).toFile(path.join('public',target));
 thumbnails[meta.canonical_path]=target;
}
await fs.writeFile('src/data/thumbnails.json',JSON.stringify(thumbnails,null,2)+'\n');
console.log(`Prepared ${Object.keys(thumbnails).length} article thumbnails`);
