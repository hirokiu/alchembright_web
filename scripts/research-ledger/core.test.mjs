import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLedger,publicData,contentHash,syncStatus} from './core.mjs';
import {kinds,mapping} from './schema.mjs';
const seed=JSON.parse(readFileSync(new URL('../../research-ledger/ledger.json',import.meta.url)));
const copy=()=>structuredClone(seed);
const invalid=change=>{const x=copy();change(x);assert.ok(validateLedger(x).errors.length);};
test('seed validates; only verified affiliation reaches public projection',()=>{
 assert.deepEqual(validateLedger(seed),{errors:[],warnings:[]});
 const result=publicData(seed);assert.equal(result.records.length,1);assert.equal(result.records[0].kind,'career');
 for(const key of ['sync','evidence','review_notes','verification','publication_status'])assert.ok(!(key in result.records[0]));
});
test('required evidence, strict fields and valid dates',()=>{
 invalid(x=>x.records[0].evidence=[]);invalid(x=>x.records[0].secret='x');
 invalid(x=>x.records[0].date='2025-02-29');invalid(x=>x.records[0].date='2026-13');
 invalid(x=>x.records[0].last_verified_at='2099-01-01');
});
test('reject malformed DOI, unsafe URLs and wrong category',()=>{
 invalid(x=>x.records[0].doi='https://doi.org/10.1/no');invalid(x=>x.records[0].urls=['javascript:alert(1)']);
 invalid(x=>x.records[3].researchmap_category='presentations');
});
test('identity, cross references and duplicate identifiers',()=>{
 invalid(x=>x.records[0].contributors[0].name.en='Daiki UEMATSU');
 invalid(x=>x.records.push(structuredClone(x.records[0])));
 invalid(x=>x.records[3].project_ids=[x.records[4].id]);
 invalid(x=>x.records[0].doi=x.records[3].doi.toUpperCase());
 invalid(x=>x.records[1].related_ids=['ral-11111111-1111-4111-8111-111111111111']);
});
test('all twelve activity families can be represented with independent category and review status',()=>{
 for(const kind of kinds){const x=copy(); x.records[0].kind=kind;x.records[0].researchmap_category=mapping[kind][0];
 // Changing the fixture's project kind requires removing every inbound project reference.
 for(const r of x.records)r.project_ids=r.project_ids.filter(id=>id!==x.records[0].id);
 assert.deepEqual(validateLedger(x).errors,[],kind);}
});
test('sync declaration requires evidence of comparison; content edits invalidate sync',()=>{
 const r=copy().records[4];r.sync.cv={status:'synced',external_id:'cv-v1',url:'https://www.alchembright.com/cv/',checked_at:'2026-09-10',content_hash:contentHash(r),note:null};
 assert.equal(syncStatus(r,'cv'),'synced');r.title.ja+=' 更新';assert.equal(syncStatus(r,'cv'),'needs_review');
 invalid(x=>x.records[0].sync.cv.status='synced');
});
test('hash independent of JSON key ordering and sync bookkeeping',()=>{
 const r=copy().records[4],hash=contentHash(r);r.sync.cv.note='checked';r.last_verified_at='2026-09-09';
 assert.equal(contentHash(r),hash);assert.equal(contentHash(Object.fromEntries(Object.entries(r).reverse())),hash);
});
test('unverified and withheld records cannot leak via projection or project references',()=>{
 const x=copy();x.records[4].project_ids=[x.records[0].id];assert.deepEqual(publicData(x).records[0].project_ids,[]);
 x.records[4].publication_status='withheld';assert.equal(publicData(x).records.length,0);
});
test('same title/year warns, distinct publication and presentation are not merged',()=>{
 const x=copy(),r=structuredClone(x.records[3]);r.id='ral-11111111-1111-4111-8111-111111111111';r.doi=null;r.sync.researchmap.external_id=null;x.records.push(r);
 assert.equal(validateLedger(x).warnings.length,1);r.kind='presentations';r.researchmap_category='presentations';assert.equal(validateLedger(x).warnings.length,0);
});
test('invalid input fails export closed',()=>assert.throws(()=>publicData({records:[]})));
test('review scope is consistent and retained in public output',()=>{
 invalid(x=>{x.records[3].peer_review_scope='abstract';x.records[3].peer_reviewed='no';});
 const x=copy(),r=x.records.find(r=>r.subtype==='symposium_paper');
 r.verification='verified';r.review_notes=[];r.publication_status='public';
 assert.equal(publicData(x).records.find(p=>p.id===r.id).peer_review_scope,'abstract');
});
test('review flags point to retained observations and valid ledger records',()=>{
 const queue=JSON.parse(readFileSync(new URL('../../research-ledger/review-queue.json',import.meta.url)));
 const observed=JSON.parse(readFileSync(new URL('../../research-ledger/observations/researchmap-2026-09-10.json',import.meta.url)));
 const orcid=JSON.parse(readFileSync(new URL('../../research-ledger/observations/orcid-2026-09-10.json',import.meta.url)));
 const scholar=JSON.parse(readFileSync(new URL('../../research-ledger/observations/scholar-2026-09-10.json',import.meta.url)));
 const urls=new Set([...observed.entries.map(o=>o.url),...orcid.entries.map(o=>o.url),scholar.source,...seed.records.flatMap(r=>r.evidence.map(e=>e.url))]),ids=new Set(seed.records.map(r=>r.id));
 assert.equal(new Set(queue.items.map(i=>i.id)).size,queue.items.length);
 for(const item of queue.items){assert.ok(['needs_review','confirmed_duplicate','not_duplicate','resolved'].includes(item.status));for(const url of item.source_urls)assert.ok(urls.has(url));for(const id of item.ledger_ids)assert.ok(ids.has(id));}
 assert.equal(queue.items.find(i=>i.id==='DUP-001').source_urls.length,2);
});
