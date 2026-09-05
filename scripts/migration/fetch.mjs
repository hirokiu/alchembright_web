import fs from 'node:fs/promises';
import path from 'node:path';
import { origin, hash } from './lib.mjs';
const dest = path.resolve(process.argv[2] || `migration/raw/${new Date().toISOString().replace(/[:.]/g, '-')}`);
// A failed or repeated run must never overwrite an earlier snapshot.
await fs.mkdir(path.dirname(dest), { recursive: true });
await fs.mkdir(dest, { recursive: false });
const manifest = { fetched_at: new Date().toISOString(), origin, visibility: 'public REST only', resources: {} };
for (const type of ['posts','pages','categories','tags','media']) {
  let all = [], totalPages = 1, expectedTotal;
  for (let page = 1; page <= totalPages; page++) {
    const url = `${origin}/wp-json/wp/v2/${type}?per_page=100&page=${page}&orderby=id&order=asc`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`${res.status} fetching ${type} page ${page}`);
    if (!res.headers.has('x-wp-totalpages') || !res.headers.has('x-wp-total')) throw new Error('Missing API total headers');
    totalPages = Number(res.headers.get('x-wp-totalpages')); const total = Number(res.headers.get('x-wp-total'));
    if (!Number.isInteger(totalPages) || totalPages < 0 || !Number.isInteger(total)) throw new Error('Missing API totals');
    if (expectedTotal !== undefined && total !== expectedTotal) throw new Error('Content changed during capture; retain incomplete snapshot and retry in a new directory');
    expectedTotal = total; all.push(...await res.json());
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (all.length !== expectedTotal || new Set(all.map(x => x.id)).size !== expectedTotal) throw new Error(`Incomplete ${type}`);
  const body = JSON.stringify(all, null, 2) + '\n'; await fs.writeFile(path.join(dest, `${type}.json`), body, { flag: 'wx' });
  manifest.resources[type] = { count: all.length, sha256: hash(body) };
  console.log(`${type}: ${all.length}`);
}
await fs.writeFile(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
console.log(`Snapshot complete: ${dest}`);
