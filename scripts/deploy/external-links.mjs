import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
export function externalLinks(html,site){
 const $=load(html);const origin=new URL(site).origin;
 $('a[href]').each((_,el)=>{
  const a=$(el);const u=new URL(a.attr('href'),origin);
  if(['http:','https:'].includes(u.protocol)&&u.origin!==origin){
   a.attr('target','_blank');a.attr('rel',[...new Set([...(a.attr('rel')||'').split(/\s+/).filter(Boolean),'noopener','noreferrer'])].join(' '));
  }
 });return $.html();
}
if(process.argv[1]?.endsWith('/external-links.mjs')){
 const root=process.env.ALCHEMBRIGHT_DIST_DIR||'dist';
 for(const file of (await fs.readdir(root,{recursive:true})).filter(f=>f.endsWith('.html'))){
  const p=path.join(root,file);await fs.writeFile(p,externalLinks(await fs.readFile(p,'utf8'),process.env.ALCHEMBRIGHT_SITE||'https://www.alchembright.com'));
 }
}
