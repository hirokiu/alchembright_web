import { createHash } from 'node:crypto';
import { ledgerSchema, targets } from './schema.mjs';
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
export function contentHash(record) {
  const {sync, evidence, last_verified_at, verification, review_notes, ...content} = record;
  return createHash('sha256').update(JSON.stringify(canonical(content))).digest('hex');
}
export function syncStatus(record, target) {
  const state = record.sync[target];
  return state.status === 'synced' && state.content_hash !== contentHash(record) ? 'needs_review' : state.status;
}
export function validateLedger(input) {
  const parsed = ledgerSchema.safeParse(input);
  if (!parsed.success) return {errors: parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`), warnings: []};
  const errors = [], warnings = [], ids = new Map(), dois = new Map(), titles = new Map(), external = new Map();
  const today = new Date().toISOString().slice(0,10);
  for (const r of parsed.data.records) {
    if (ids.has(r.id)) errors.push(`Duplicate stable ID: ${r.id}`);
    ids.set(r.id,r);
    if (r.doi) { const key=r.doi.toLowerCase(); if(dois.has(key)) errors.push(`Duplicate DOI: ${r.id}, ${dois.get(key)}`); dois.set(key,r.id); }
    for(const title of [r.title.ja,r.title.en].filter(Boolean)) {
      const key=`${r.kind}:${r.date?.slice(0,4)}:${title.normalize('NFKC').toLowerCase().replace(/[\s\p{P}]/gu,'')}`;
      if(titles.has(key) && titles.get(key)!==r.id) warnings.push(`Possible duplicate title/year: ${r.id}, ${titles.get(key)}`);
      titles.set(key,r.id);
    }
    if(r.last_verified_at > today || r.evidence.some(e=>e.accessed_at > today)) errors.push(`${r.id}: Future verification date`);
    for(const t of targets) {
      const s=r.sync[t];
      if(s.checked_at && s.checked_at > today) errors.push(`${r.id}: Future ${t} check date`);
      if(s.external_id) {
        const key=`${t}:${t==='researchmap'?r.researchmap_category+':':''}${s.external_id}`;
        if(external.has(key)) errors.push(`Duplicate external identity: ${key}`);
        external.set(key,r.id);
      }
      if(t==='orcid' && s.external_id && !/^\d+$/.test(s.external_id)) errors.push(`${r.id}: Invalid ORCID put-code`);
      if(syncStatus(r,t)!==s.status) warnings.push(`${r.id}: ${t} content changed since comparison`);
    }
  }
  for(const r of parsed.data.records) {
    for(const ref of r.project_ids) if(ids.get(ref)?.kind!=='projects' || ref===r.id) errors.push(`${r.id}: Invalid project reference ${ref}`);
    for(const ref of r.related_ids) if(!ids.has(ref) || ref===r.id) errors.push(`${r.id}: Invalid related reference ${ref}`);
  }
  return {errors,warnings:[...new Set(warnings)]};
}
export function publicData(input) {
  const result=validateLedger(input);
  if(result.errors.length) throw new Error(result.errors.join('\n'));
  const records=input.records.filter(r=>r.publication_status==='public' && r.verification==='verified');
  const publicIds=new Set(records.map(r=>r.id));
  return {schema_version:1, records:records.map(r=>({
    id:r.id,kind:r.kind,subtype:r.subtype,title:r.title,date:r.date,end_date:r.end_date,ongoing:r.ongoing,
    contributors:r.contributors,peer_reviewed:r.peer_reviewed,peer_review_scope:r.peer_review_scope,doi:r.doi,urls:r.urls,
    project_ids:r.project_ids.filter(id=>publicIds.has(id)),related_ids:r.related_ids.filter(id=>publicIds.has(id)),
    keywords:r.keywords,bibliographic:r.bibliographic,organization:r.organization,funding:r.funding,
    web_work_slug:r.web_work_slug,researchmap_category:r.researchmap_category,
  })).sort((a,b)=>(b.date??'').localeCompare(a.date??'') || a.id.localeCompare(b.id))};
}
