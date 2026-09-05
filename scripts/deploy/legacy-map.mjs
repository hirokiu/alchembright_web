import fs from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
export async function legacyMap() {
  const rows = parse(await fs.readFile('migration/mappings/url-map.csv', 'utf8'), {columns:true});
  const map = Object.create(null);
  for (const row of rows) {
    if (!/^wp:\d+$/.test(row.source_id)) continue;
    const id = row.source_id.slice(3), target = row.target_path;
    if (!target.startsWith('/') || target.startsWith('//') || /[\\?#]/.test(target)) throw Error('Invalid legacy target');
    if (map[id] && map[id] !== target) throw Error(`Conflicting WordPress ID ${id}`);
    map[id] = target;
  }
  return map;
}
