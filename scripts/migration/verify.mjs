import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { signature } from './lib.mjs';
const root = path.resolve(process.env.ALCHEMBRIGHT_DIST_DIR || 'dist');
const report=JSON.parse(await fs.readFile('migration/reports/conversion-report.json','utf8'));
const failures=[], legacyLinks=[];
const pages=new Map();
const projectBase=(process.env.ALCHEMBRIGHT_BASE || '/').replace(/\/$/,'');
async function walk(dir) { for(const e of await fs.readdir(dir,{withFileTypes:true})) { const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.html'))pages.set(p,load(await fs.readFile(p,'utf8'))); } }
await walk(root);
// Validate the deployed project prefix before normalizing back to archival paths.
if(projectBase) for(const [file,$] of pages) {
  for(const attr of ['href','src','action','poster']) $(`[${attr}]`).each((_,el)=>{
    const value=$(el).attr(attr);
    if(value.startsWith('/') && !value.startsWith('//')) {
      if(!value.startsWith(projectBase+'/')) failures.push({file,ref:value,reason:'missing project prefix'});
      else $(el).attr(attr,value.slice(projectBase.length));
    }
  });
}

const pageFile = p => path.join(root, decodeURIComponent(p), p.endsWith('/')?'index.html':'');
for(const r of report.records) {
  const $=pages.get(pageFile(r.path));
  if(!$) { failures.push({path:r.path,reason:'missing content route'});continue; }
  const body=$(`[data-source-id="${r.id}"]`);
  const ids=$('[id]').toArray().map(el=>$(el).attr('id'));
  if(new Set(ids).size!==ids.length) failures.push({path:r.path,reason:'duplicate HTML anchor IDs'});
  if(body.length!==1) { failures.push({path:r.path,reason:'content ID mismatch'});continue; }
  // Astro adds heading IDs; preserve and compare all original anchors while allowing new heading anchors.
  const originalIDs=new Set(r.expected.attrs.flatMap(a=>a.id ? [a.id] : []));
  body.find('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]').each((_,el)=>{if(!originalIDs.has($(el).attr('id')))$(el).removeAttr('id');});
  if(JSON.stringify(signature(body.html()))!==JSON.stringify(r.expected)) failures.push({path:r.path,reason:'rendered text/links/anchors/code/breaks/table differs from staged conversion'});
}
for(const [file,$] of pages) {
  const relative = path.relative(root,file);
  for (const script of $('script').toArray()) {
    const e=$(script), src=e.attr('src');
    const allowed=['index.html','404.html'].includes(relative) && e.attr('type')==='module' && /^\/_astro\/[A-Za-z0-9_.-]+\.js$/.test(src || '') && !e.html().trim();
    if (!allowed) failures.push({file:relative,reason:'unexpected script'});
    else try { await fs.access(path.join(root,src)); } catch { failures.push({file:relative,reason:'missing navigation script'}); }
  }
  if($('[onclick],[onerror],[onload]').length) failures.push({file:path.relative(root,file),reason:'unexpected active content in static output'});
  if(!process.argv.includes('--release') && !$('meta[name="robots"]').attr('content')?.includes('noindex')) failures.push({file:path.relative(root,file),reason:'missing preview noindex'});
  if(process.argv.includes('--release') && $('meta[name="robots"]').attr('content')?.includes('noindex')) failures.push({file:path.relative(root,file),reason:'production output still contains noindex'});
  for(const el of $('a[href],img[src],link[rel="stylesheet"]').toArray()) {
    const e=$(el); const ref=e.attr('href') || e.attr('src');
    if(!ref || /^(?:https?:|mailto:|tel:|data:)/i.test(ref)) {
      if(ref && /alchembright\.com|hrk-up\.net|balog\.jp/i.test(ref) && e.is('a')) legacyLinks.push({page:path.relative(root,file),url:ref});
      continue;
    }
    const base='https://www.alchembright.com/'+path.relative(root,file).replace(/index\.html$/,'');
    const u=new URL(ref,base);
    let target=pageFile(u.pathname);
    try { if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html'); }
    catch { failures.push({page:path.relative(root,file),ref,reason:'unresolved local target'});continue; }
    if(u.hash && pages.has(target)) {
      const fragment=decodeURIComponent(u.hash.slice(1));const dest=pages.get(target);
      if(!dest('[id],[name]').toArray().some(n=>dest(n).attr('id')===fragment || dest(n).attr('name')===fragment)) failures.push({page:path.relative(root,file),ref,reason:'missing fragment'});
    }
  }
}
if(process.argv.includes('--release') && report.media.pending && !process.argv.includes('--allow-pending-media')) failures.push({reason:`${report.media.pending} unresolved media URLs; recovery decisions required before release`});
const result={verified_at:new Date().toISOString(),html_pages:pages.size,content_pages:report.records.length,failures,unresolved_legacy_or_external_links:legacyLinks,pending_media_urls:report.media.pending,scope:'Static output validation, not an HTTP server/redirect test or visual comparison'};
await fs.writeFile(process.env.ALCHEMBRIGHT_REPORT_PATH || 'migration/reports/build-verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({html_pages:pages.size,content_pages:report.records.length,failures:failures.length,legacy_links:legacyLinks.length,pending_media:report.media.pending}));
if(failures.length) { console.error(failures.slice(0,10));process.exitCode=1; }
