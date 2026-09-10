import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
const base=(process.env.ALCHEMBRIGHT_BASE || '/').replace(/\/$/,'');
if (base) {
  if (!/^\/[A-Za-z0-9_-]+$/.test(base)) throw Error('Expected one project path segment');
  const root=process.env.ALCHEMBRIGHT_DIST_DIR || 'dist';
  const site=new URL(process.env.ALCHEMBRIGHT_SITE || 'https://www.alchembright.com');
  function prefix(value) {
    if (value.startsWith('/') && !value.startsWith('//') && value!==base && !value.startsWith(base+'/')) return base+value;
    if (value.startsWith(site.origin+'/')) {
      const u=new URL(value);
      if (u.pathname!==base && !u.pathname.startsWith(base+'/')) {u.pathname=base+u.pathname;return u.href;}
    }
    return value;
  }
  async function walk(dir) {
    for(const e of await fs.readdir(dir,{withFileTypes:true})) {
      const file=path.join(dir,e.name);
      if(e.isDirectory()) {await walk(file);continue;}
      if(e.name.endsWith('.html')) {
        const $=load(await fs.readFile(file,'utf8'));
        for(const attr of ['href','src','action','poster']) $(`[${attr}]`).each((_,el)=>$(el).attr(attr,prefix($(el).attr(attr))));
        await fs.writeFile(file,$.html());
      } else if(e.name.endsWith('.xml')) {
        const $=load(await fs.readFile(file,'utf8'),{xml:true});
        $('loc,link').each((_,el)=>$(el).text(prefix($(el).text())));
        // RSS GUIDs deliberately retain the original stable identifiers.
        await fs.writeFile(file,$.xml());
      }
    }
  }
  await walk(root);
}
