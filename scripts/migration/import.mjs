import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import {applyTagAdditions} from './tag-additions.mjs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { convert, canonicalPath, decodeText, assetURLs, mediaTarget, hash } from './lib.mjs';
const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error('Usage: npm run migration:import -- <snapshot-directory> <NEW-staging-directory>');
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.mkdir(output, { recursive: false });
const read = async type => JSON.parse(await fs.readFile(path.join(input, `${type}.json`), 'utf8'));
const manifest = await read('manifest');
for (const type of ['posts','pages','categories','tags','media']) if(!manifest.resources?.[type]) throw new Error(`Missing resource manifest: ${type}`);
for (const [type, item] of Object.entries(manifest.resources)) {
  const rows=await read(type);
  if(rows.length!==item.count || new Set(rows.map(r=>r.id)).size!==item.count) throw new Error(`Count/ID mismatch: ${type}`);
  if (hash(await fs.readFile(path.join(input, `${type}.json`))) !== item.sha256) throw new Error(`Snapshot hash mismatch: ${type}`);
}
const [posts,pages,categories,tags,attachments] = await Promise.all(['posts','pages','categories','tags','media'].map(read));
const sourceRecordHashes = new Map([...posts,...pages].map(r => [r.id,hash(JSON.stringify(r))]));
let additions = null;
try { additions = JSON.parse(await fs.readFile('migration/mappings/mt-tag-additions.json','utf8')); }
catch (e) { if (e.code !== 'ENOENT') throw e; }
if (additions) applyTagAdditions(posts, tags, additions);
const records = [...posts,...pages];
if (records.some(r => r.status !== 'publish' || r.content?.protected || !['post','page'].includes(r.type))) throw new Error('Only public, unprotected posts/pages may enter this import');
const paths = new Set(records.map(r => canonicalPath(r.link)));
if (paths.size !== records.length || new Set(records.map(r => r.id)).size !== records.length) throw new Error('Duplicate content ID or path');
const mappingText = await fs.readFile('migration/mappings/media-map.csv', 'utf8');
const media = new Map(parse(mappingText, { columns: true, skip_empty_lines: true }).map(m => [m.source_url,m]));
const discovered = new Set(records.flatMap(r => assetURLs(r.content.rendered, r.link)));
for (const a of attachments) {
  discovered.add(a.source_url);
  for (const size of Object.values(a.media_details?.sizes || {})) if (size.source_url) discovered.add(size.source_url);
}
for (const u of discovered) if (!media.has(u)) media.set(u, { source_url:u, source_record_id:'', target_path:mediaTarget(u), sha256:'', bytes:'', mime_type:'', recovery_status:'pending', evidence:'public REST 2026-09-05', notes:'Media URL changes approved; awaiting file recovery' });
for (const m of media.values()) if (m.recovery_status === 'recovered') {
  if (!m.target_path.startsWith('/media/imported/') || m.target_path.includes('..')) throw new Error('Unsafe recovered media path');
  const bytes = await fs.readFile(path.join('public',m.target_path));
  if (hash(bytes)!==m.sha256) throw new Error(`Recovered media hash mismatch: ${m.source_url}`);
}
const report = { source_snapshot: manifest, provisional: true, mapping_input_sha256:hash(mappingText), generated_files:{}, records:[], media: { total:media.size, pending:[...media.values()].filter(m=>m.recovery_status!=='recovered').length } };
const urlRows = [];
for (const r of records) {
  const conversion = convert(r, media, paths);
  const folder = r.type === 'post' ? `blog/${r.date.slice(0,4)}` : 'pages';
  const relative = `src/content/${folder}/wp-${r.id}.md`;
  const meta = { source_system:'wordpress', source_id:r.id, content_type:r.type, status:r.status, title:decodeText(r.title.rendered), slug_original:r.slug, canonical_path:canonicalPath(r.link), original_url:r.link, legacy_urls:[], published_at_local:r.date, published_at_gmt:r.date_gmt || null, modified_at_local:r.modified, modified_at_gmt:r.modified_gmt || null, source_timezone:null, category_ids:r.categories || [], tag_ids:r.tags || [], parent_id:r.parent || 0, menu_order:r.menu_order || 0, excerpt:decodeText(r.excerpt?.rendered || ''), featured_media_id:r.featured_media || 0, mt_entry_id:null, mt_basename:null, source_record_sha256:sourceRecordHashes.get(r.id), source_html_sha256:conversion.sourceHash, conversion_version:'1', conversion_format:conversion.format, conversion_warnings:conversion.warnings };
  const file = path.join(output,relative); await fs.mkdir(path.dirname(file), {recursive:true});
  await fs.writeFile(file, `---\n${YAML.stringify(meta, { defaultStringType: 'QUOTE_DOUBLE' })}---\n\n${conversion.body}\n`, {flag:'wx'});
  report.generated_files[relative]=hash(await fs.readFile(file));
  report.records.push({ id:r.id, type:r.type, file:relative, path:meta.canonical_path, format:conversion.format, warnings:conversion.warnings, expected:conversion.expected });
  urlRows.push({source_url:r.link,source_kind:r.type,source_id:`wp:${r.id}`,target_path:meta.canonical_path,action:'preserve',http_status:'200',evidence:'public REST permalink; local build verification pending',verified_at:'',notes:'production server unverified'});
}
for (const [name,data] of [['categories',categories],['tags',tags]]) {
  const dir=path.join(output,'src/data');await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,`${name}.json`),JSON.stringify(data,null,2)+'\n');
  report.generated_files[`src/data/${name}.json`]=hash(await fs.readFile(path.join(dir,`${name}.json`)));
}
await fs.writeFile(path.join(output,'media-map.csv'),stringify([...media.values()], {header:true}));
await fs.writeFile(path.join(output,'url-map.csv'),stringify(urlRows,{header:true}));
report.url_map_generated_sha256=hash(await fs.readFile(path.join(output,'url-map.csv')));
await fs.writeFile(path.join(output,'conversion-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Staged ${records.length} public records; ${report.records.filter(r=>r.format==='html-preserved').length} HTML fallbacks; ${report.media.pending} pending media URLs. Existing source not overwritten.`);
