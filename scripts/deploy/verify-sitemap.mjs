import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const root = path.resolve(process.env.ALCHEMBRIGHT_DIST_DIR || 'dist');
const xml = load(await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8'), { xmlMode: true });
assert.equal(xml('urlset').attr('xmlns'), 'http://www.sitemaps.org/schemas/sitemap/0.9');
const urls = xml('urlset > url > loc').map((_, element) => xml(element).text()).get();
assert.equal(urls.length, new Set(urls).size, 'Duplicate sitemap URLs');
const pages = new Set();
async function visit(dir) {
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) { await visit(file); continue; }
    if (!item.name.endsWith('.html') || file === path.join(root, '404.html')) continue;
    const $ = load(await fs.readFile(file, 'utf8'));
    if ($('meta[http-equiv="refresh" i]').length) continue;
    const canonical = $('link[rel="canonical"]').attr('href');
    assert.ok(canonical, `Missing canonical: ${file}`);
    const url = new URL(canonical);
    assert.equal(url.origin, new URL(process.env.ALCHEMBRIGHT_SITE || 'https://www.alchembright.com').origin);
    assert.equal(url.search + url.hash, '', `Noncanonical URL: ${canonical}`);
    if (process.env.PUBLIC_SITE_MODE === 'production') {
      assert.ok(!/noindex/i.test($('meta[name="robots"]').attr('content') || ''), `Production noindex: ${file}`);
    }
    assert.ok(!pages.has(canonical), `Duplicate canonical: ${canonical}`);
    pages.add(canonical);
  }
}
await visit(root);
assert.deepEqual(new Set(urls), pages, 'Sitemap must match canonical HTML pages (excluding errors and redirects)');
console.log(`Sitemap verified: ${urls.length} unique canonical pages`);
