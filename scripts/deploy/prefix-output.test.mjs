import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';
test('project preview keeps navigation and media local without changing archive identifiers',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'alchembright-prefix-'));
 try {
  await fs.writeFile(path.join(dir,'index.html'),'<html><head><link rel="canonical" href="https://hirokiu.github.io/about/"></head><body><a href="/about/#old">about</a><a href="https://elsewhere.example/">external</a><img src="/media/pending.svg" data-original-src="https://www.alchembright.com/old.jpg"><script type="module" src="/alchembright_web/_astro/nav.js"></script></body></html>');
  await fs.writeFile(path.join(dir,'feed.xml'),'<rss><channel><link>https://hirokiu.github.io/</link><item><link>https://hirokiu.github.io/about/</link><guid>https://www.alchembright.com/about/</guid></item></channel></rss>');
  const run=()=>execFileSync(process.execPath,['scripts/deploy/prefix-output.mjs'],{env:{...process.env,ALCHEMBRIGHT_BASE:'/alchembright_web',ALCHEMBRIGHT_SITE:'https://hirokiu.github.io',ALCHEMBRIGHT_DIST_DIR:dir}});
  run();run();
  const $=load(await fs.readFile(path.join(dir,'index.html'),'utf8'));
  assert.equal($('a').first().attr('href'),'/alchembright_web/about/#old');
  assert.equal($('a').last().attr('href'),'https://elsewhere.example/');
  assert.equal($('img').attr('src'),'/alchembright_web/media/pending.svg');
  assert.equal($('img').attr('data-original-src'),'https://www.alchembright.com/old.jpg');
  assert.equal($('script').attr('src'),'/alchembright_web/_astro/nav.js');
  assert.equal($('link').attr('href'),'https://hirokiu.github.io/alchembright_web/about/');
  const xml=load(await fs.readFile(path.join(dir,'feed.xml'),'utf8'),{xml:true});
  assert.equal(xml('item link').text(),'https://hirokiu.github.io/alchembright_web/about/');
  assert.equal(xml('guid').text(),'https://www.alchembright.com/about/');
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
