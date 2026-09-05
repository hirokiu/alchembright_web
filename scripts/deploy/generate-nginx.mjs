import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
export function generate(rows) {
  const seen = new Set();
  const entries = [];
  for (const row of rows) {
    if (!['post','page'].includes(row.source_kind)) continue;
    if (!/^wp:[0-9]+$/.test(row.source_id)) throw new Error('Invalid WordPress ID');
    const key = `${row.source_kind}:${row.source_id.slice(3)}`;
    if (seen.has(key)) throw new Error(`Duplicate ID: ${key}`);
    seen.add(key);
    const p=row.target_path;
    if (!p.startsWith('/') || !p.endsWith('/') || /[\s\\$";{}?#]/.test(p) || p.split('/').includes('..')) throw new Error(`Unsafe canonical path: ${p}`);
    const encoded=new URL(p,'https://www.alchembright.com').pathname;
    entries.push(`    "${key}" "${encoded}";`);
  }
  return `# Generated from migration/mappings/url-map.csv. Include in http context.\nmap "$arg_p:$arg_page_id" $ab_legacy_id {\n    default "";\n    ~^([0-9]+):$ "post:$1";\n    ~^:([0-9]+)$ "page:$1";\n}\nmap "$arg_p:$arg_page_id" $ab_has_legacy_query {\n    default 1;\n    ":" 0;\n}\nmap $ab_legacy_id $ab_legacy_target {\n    default "";\n${entries.join('\n')}\n}\n`;
}
if (process.argv[1] && import.meta.url===new URL(process.argv[1],'file:').href) {
 const rows=parse(await fs.readFile('migration/mappings/url-map.csv','utf8'),{columns:true});
 await fs.writeFile(process.argv[2] || 'deploy/nginx/wp-id-maps.conf',generate(rows));
 console.log(`Generated WordPress ID redirect map (${rows.length} source rows)`);
}
