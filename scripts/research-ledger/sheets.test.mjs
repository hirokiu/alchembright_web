import test from 'node:test';
import assert from 'node:assert/strict';
import {readState,exportWorkbook,importWorkbook,snapshotHash} from './sheets.mjs';
const state=readState();
const fresh=()=>exportWorkbook(structuredClone(state),'test');
test('all records, nested arrays, optional fields and review flags round-trip without data loss',()=>{
 assert.deepEqual(importWorkbook(fresh(),state),state);
});
test('stale sheet cannot overwrite direct JSON edits',()=>{
 const changed=structuredClone(state);changed.ledger.records[0].title.ja+='直接編集';
 assert.throws(()=>importWorkbook(fresh(),changed),/CONFLICT/);
});
test('rows may be sorted independently while stable IDs and author order survive',()=>{
 const b=fresh();for(const [name,rows]of Object.entries(b.tabs))if(name!=='管理情報')b.tabs[name]=[rows[0],...rows.slice(1).reverse()];
 assert.deepEqual(importWorkbook(b,state),state);
});
test('owner approval remains separate from verification and publication',()=>{
 const b=fresh();b.tabs['活動台帳'][1][1]='確認済み';b.tabs['活動台帳'][1][2]='題名を確認しました';
 const r=importWorkbook(b,state);assert.equal(r.decisions[state.ledger.records[0].id].status,'確認済み');
 assert.deepEqual(r.ledger,state.ledger);
});
test('missing records, flags, references and duplicate author order fail closed',()=>{
 let b=fresh();b.tabs['活動台帳'].splice(1,1);assert.throws(()=>importWorkbook(b,state),/DELETION/);
 b=fresh();b.tabs['重複確認'].splice(1,1);assert.throws(()=>importWorkbook(b,state),/deletion/);
 b=fresh();b.tabs['著者・役割'][1][0]='unknown';assert.throws(()=>importWorkbook(b,state),/Unknown parent/);
 b=fresh();b.tabs['著者・役割'].push(b.tabs['著者・役割'][1]);assert.throws(()=>importWorkbook(b,state),/Duplicate order/);
});
test('numeric coercion, formulas, schema violations and header drift are rejected',()=>{
 let b=fresh();b.tabs['活動台帳'][1][7]=2026;assert.throws(()=>importWorkbook(b,state),/coercion/);
 b=fresh();b.tabs['活動台帳'][1][3]='=IMPORTXML("x")';assert.throws(()=>importWorkbook(b,state),/Formula/);
 b=fresh();b.tabs['活動台帳'][1][10]='maybe';assert.throws(()=>importWorkbook(b,state));
 b=fresh();b.tabs['活動台帳'][0][0]='new';assert.throws(()=>importWorkbook(b,state),/headers/);
});
test('multiline notes, quotes, JSON arrays and partial dates survive',()=>{
 const x=structuredClone(state);x.ledger.records[0].review_notes.push('line1\nline2, "quoted"');x.ledger.records[0].date='2026';
 assert.deepEqual(importWorkbook(exportWorkbook(x),x),x);
 assert.notEqual(snapshotHash(x),snapshotHash(state));
});
test('flag resolution updates status without deleting source observations',()=>{
 const b=fresh();b.tabs['重複確認'][1][2]='not_duplicate';
 const r=importWorkbook(b,state);assert.equal(r.queue.items[0].status,'not_duplicate');assert.deepEqual(r.queue.items[0].source_urls,state.queue.items[0].source_urls);
});

test('Japanese category choices persist independently from master and can request presentations',()=>{
 const b=fresh(),row=b.tabs['Researchmap分類'][1],id=row[0];row[3]='講演・口頭発表';row[4]='発表として別登録を希望';
 const result=importWorkbook(b,state);
 assert.equal(result.decisions[id].researchmap_category,'presentations');
 assert.equal(result.decisions[id].classification_note,'発表として別登録を希望');
 assert.deepEqual(result.ledger,state.ledger);
 assert.deepEqual(importWorkbook(exportWorkbook(result),result),result);
 const missing=exportWorkbook(result);delete missing.tabs['Researchmap分類'];assert.throws(()=>importWorkbook(missing,result),/Missing classification/);
});
test('classification unknown choices, duplicate rows and edited reference cells are rejected',()=>{
 for(const mutate of [b=>b.tabs['Researchmap分類'][1][3]='適当',b=>b.tabs['Researchmap分類'].push(b.tabs['Researchmap分類'][1]),b=>b.tabs['Researchmap分類'].pop(),b=>b.tabs['Researchmap分類'][1][1]='changed']){
  const b=fresh();mutate(b);assert.throws(()=>importWorkbook(b,state));
 }
});
