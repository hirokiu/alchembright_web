import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateLedger} from './core.mjs';
import {targets, mapping} from './schema.mjs';
export const categoryLabels={published_papers:'論文',misc:'MISC',presentations:'講演・口頭発表',works:'Works（作品等）',research_projects:'共同研究・競争的資金等の研究課題',others:'その他',awards:'受賞',research_experience:'経歴',education:'学歴',committee_memberships:'委員歴',academic_contribution:'学術貢献活動',social_contribution:'社会貢献活動',association_memberships:'所属学協会'};
const categoryCode=v=>v==='未決定'||v===''?null:Object.keys(categoryLabels).find(k=>categoryLabels[k]===v)??(()=>{throw new Error('Unknown classification choice');})();
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const snapshotHash=state=>createHash('sha256').update(JSON.stringify(stable(state))).digest('hex');
export const headers={
 '活動台帳':['ID','本人確認','修正メモ','日本語題名','英語題名','種別','細分類','発行日・開始日','終了日','継続中','査読','査読範囲','Researchmap分類案','データ確認状態','公開方針','最終確認日','Works識別子','DOI'],
 '書誌・研究費':['ID','掲載先','巻','号','頁','機関','資金配分機関','助成制度','課題番号'],
 '著者・役割':['ID','順序','日本語氏名','英語氏名','人物ID','役割'],
 '補足情報':['ID','項目','順序','値'],
 '出典':['ID','順序','URL','確認日','根拠対象JSON','確認内容'],
 '掲載先状況':['ID','掲載先','状態','外部ID','URL','照合日','内容ハッシュ','メモ'],
 '重複確認':['確認ID','種類','判断','台帳ID_JSON','出典URL_JSON','確認内容'],
 '管理情報':['キー','値'],
 'Researchmap分類':['ID','題名（参照）','提案分類（参照）','本人選択','分類メモ','提案理由（参照）'],
};
const fieldLabels={urls:'URL',project_ids:'関連プロジェクトID',related_ids:'関連成果ID',keywords:'キーワード',review_notes:'確認事項'};
const empty=v=>v===null||v===undefined?'':v;
const nullable=v=>v===''?null:v;
const json=(v,label)=>{try{return JSON.parse(v);}catch{throw new Error(`${label}: Invalid JSON`);}};
const required=(v,label)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${label}: Required text`);return v;};
const position=v=>{if(!/^\d+$/.test(String(v))||Number(v)<1)throw new Error('Order must be a positive integer');return Number(v);};
const bool=v=>{if(v===true||v==='TRUE')return true;if(v===false||v==='FALSE')return false;throw new Error('継続中 must be TRUE or FALSE');};
export function validateState(state){
 const result=validateLedger(state.ledger);if(result.errors.length)throw new Error(result.errors.join('\n'));
 const ids=new Set(state.ledger.records.map(r=>r.id)),qid=new Set();
 if(!state.queue||!Array.isArray(state.queue.items)||!/^\d{4}-\d{2}-\d{2}$/.test(state.queue.as_of))throw new Error('Invalid review queue');
 for(const q of state.queue.items){
  if(!q.id||qid.has(q.id)||!['needs_review','confirmed_duplicate','not_duplicate','resolved'].includes(q.status))throw new Error('Invalid or duplicate review flag');qid.add(q.id);
  if(!Array.isArray(q.ledger_ids)||q.ledger_ids.some(id=>!ids.has(id)))throw new Error('Review flag references missing ledger ID');
  if(!Array.isArray(q.source_urls)||q.source_urls.some(u=>{try{return !['http:','https:'].includes(new URL(u).protocol);}catch{return true;}}))throw new Error('Invalid review source URL');
  if(typeof q.note!=='string'||typeof q.type!=='string')throw new Error('Invalid review flag text');
 }
 for(const [id,v] of Object.entries(state.decisions)){
  if(!ids.has(id)||!['未確認','確認済み','要修正'].includes(v.status)||typeof v.note!=='string')throw new Error('Invalid owner decision');
  if(v.researchmap_category!==undefined&&v.researchmap_category!==null&&!Object.values(mapping).flat().includes(v.researchmap_category))throw new Error('Invalid classification choice');
  if(v.classification_note!==undefined&&typeof v.classification_note!=='string')throw new Error('Invalid classification note');
 }
 return result;
}
export function exportWorkbook(state,baseCommit='unknown'){
 validateState(state);
 const tabs=Object.fromEntries(Object.entries(headers).map(([k,h])=>[k,[[...h]]]));
 for(const r of state.ledger.records){
  const decision=state.decisions[r.id]??{status:'未確認',note:''};
  tabs['活動台帳'].push([r.id,decision.status,decision.note,r.title.ja,r.title.en,r.kind,r.subtype,r.date,r.end_date,r.ongoing?'TRUE':'FALSE',r.peer_reviewed,r.peer_review_scope,r.researchmap_category,r.verification,r.publication_status,r.last_verified_at,r.web_work_slug,r.doi].map(empty));
  tabs['Researchmap分類'].push([r.id,r.title.ja??r.title.en,categoryLabels[r.researchmap_category]??'未決定',categoryLabels[decision.researchmap_category]??'未決定',decision.classification_note??'',r.review_notes.filter(n=>/分類|査読|予稿|プレプリント/.test(n)).join(' / ')]);
  tabs['書誌・研究費'].push([r.id,r.bibliographic.venue,r.bibliographic.volume,r.bibliographic.issue,r.bibliographic.pages,r.organization,r.funding.funder,r.funding.program,r.funding.award_number].map(empty));
  r.contributors.forEach((a,i)=>tabs['著者・役割'].push([r.id,String(i+1),a.name.ja,a.name.en,a.person_id,a.role].map(empty)));
  for(const [field,label] of Object.entries(fieldLabels))r[field].forEach((v,i)=>tabs['補足情報'].push([r.id,label,String(i+1),v]));
  r.evidence.forEach((e,i)=>tabs['出典'].push([r.id,String(i+1),e.url,e.accessed_at,JSON.stringify(e.supports),e.note]));
  for(const t of targets){const s=r.sync[t];tabs['掲載先状況'].push([r.id,t,s.status,s.external_id,s.url,s.checked_at,s.content_hash,s.note].map(empty));}
 }
 for(const q of state.queue.items)tabs['重複確認'].push([q.id,q.type,q.status,JSON.stringify(q.ledger_ids),JSON.stringify(q.source_urls),q.note]);
 tabs['管理情報'].push(['format_version','1'],['ledger_schema_version',String(state.ledger.schema_version)],['base_hash',snapshotHash(state)],['base_commit',baseCommit],['queue_as_of',state.queue.as_of]);
 return {format_version:1,tabs};
}
function table(book,name){
 const values=book.tabs[name];if(!Array.isArray(values)||JSON.stringify(values[0])!==JSON.stringify(headers[name]))throw new Error(`${name}: Missing tab or changed headers`);
 return values.slice(1).map(row=>{
  if(!Array.isArray(row)||row.length>headers[name].length)throw new Error(`${name}: Invalid row width`);
  const padded=headers[name].map((_,i)=>row[i]??'');
  if(padded.some(v=>!['string','boolean'].includes(typeof v)))throw new Error(`${name}: Numeric/date coercion detected; use plain text cells`);
  if(padded.some(v=>typeof v==='string'&&v.startsWith('=')))throw new Error(`${name}: Formula not allowed in data cells`);
  return padded;
 }).filter(row=>row.some(v=>v!==''));
}
export function importWorkbook(book,current){
 validateState(current);if(book.format_version!==1)throw new Error('Unsupported workbook version');
 const metaRows=table(book,'管理情報'),meta=Object.fromEntries(metaRows);
 if(new Set(metaRows.map(r=>r[0])).size!==metaRows.length||meta.format_version!=='1'||meta.ledger_schema_version!=='1')throw new Error('Invalid workbook metadata');
 if(meta.base_hash!==snapshotHash(current))throw new Error('CONFLICT: GitHub data changed after sheet export. Refresh/compare before import.');
 const state={ledger:{schema_version:1,records:[]},queue:{as_of:meta.queue_as_of,items:[]},decisions:{}};
 const byId=new Map();
 for(const row of table(book,'活動台帳')){
  const [id,approval,note,ja,en,kind,subtype,date,end,ongoing,peer,scope,category,verification,pub,verified,slug,doi]=row;
  if(byId.has(id))throw new Error('Duplicate ID');required(id,'ID');
  const r={id,kind,subtype,title:{ja:nullable(ja),en:nullable(en)},date:nullable(date),end_date:nullable(end),ongoing:bool(ongoing),contributors:[],peer_reviewed:peer,...(scope?{peer_review_scope:scope}:{}),doi:nullable(doi),urls:[],project_ids:[],related_ids:[],keywords:[],researchmap_category:nullable(category),evidence:[],last_verified_at:verified,verification,review_notes:[],publication_status:pub,web_work_slug:nullable(slug),sync:{}};
  byId.set(id,r);state.ledger.records.push(r);state.decisions[id]={status:approval,note};
 }
 for(const r of current.ledger.records)if(!byId.has(r.id))throw new Error(`DELETION BLOCKED: missing ${r.id}; retain row or mark withheld`);
 const record=id=>{if(!byId.has(id))throw new Error(`Unknown parent ID ${id}`);return byId.get(id);};
 const seen=new Set();
 for(const [id,venue,volume,issue,pages,organization,funder,program,award_number] of table(book,'書誌・研究費')){
  if(seen.has(id))throw new Error('Duplicate bibliography');seen.add(id);const r=record(id);
  r.bibliographic={venue:nullable(venue),volume:nullable(volume),issue:nullable(issue),pages:nullable(pages)};r.organization=nullable(organization);r.funding={funder:nullable(funder),program:nullable(program),award_number:nullable(award_number)};
 }
 const ordered=new Map();
 function add(id,field,order,value){record(id);const key=id+':'+field,n=position(order);if(!ordered.has(key))ordered.set(key,new Map());if(ordered.get(key).has(n))throw new Error(`Duplicate order ${key}`);ordered.get(key).set(n,value);}
 for(const [id,i,ja,en,person,role] of table(book,'著者・役割'))add(id,'contributors',i,{name:{ja:nullable(ja),en:nullable(en)},person_id:nullable(person),role});
 for(const [id,label,i,value] of table(book,'補足情報')){const field=Object.keys(fieldLabels).find(k=>fieldLabels[k]===label);if(!field)throw new Error('Unknown list field');add(id,field,i,required(value,'List value'));}
 for(const [id,i,url,accessed_at,supports,note] of table(book,'出典'))add(id,'evidence',i,{url,accessed_at,supports:json(supports,'Evidence supports'),note});
 for(const r of state.ledger.records)for(const field of ['contributors','evidence',...Object.keys(fieldLabels)]){
  const rows=ordered.get(r.id+':'+field);if(rows){const sorted=[...rows].sort((a,b)=>a[0]-b[0]);if(sorted.some(([n],i)=>n!==i+1))throw new Error('Non-contiguous order');r[field]=sorted.map(([,v])=>v);}
 }
 for(const [id,target,status,external,url,checked,hash,note] of table(book,'掲載先状況')){const r=record(id);if(!targets.includes(target)||r.sync[target])throw new Error('Unknown or duplicate sync target');r.sync[target]={status,external_id:nullable(external),url:nullable(url),checked_at:nullable(checked),content_hash:nullable(hash),note:nullable(note)};}
 for(const [id,type,status,ids,urls,note] of table(book,'重複確認'))state.queue.items.push({id,type,status,ledger_ids:json(ids,'Ledger IDs'),source_urls:json(urls,'Source URLs'),note});
 for(const q of current.queue.items)if(!state.queue.items.some(i=>i.id===q.id))throw new Error('Review flag deletion blocked; mark resolved instead');
 if(book.tabs['Researchmap分類']){
  const classified=new Set();
  for(const [id,title,proposed,choice,note,reason] of table(book,'Researchmap分類')){
   const r=record(id);if(classified.has(id))throw new Error('Duplicate classification ID');classified.add(id);
   const reference=current.ledger.records.find(v=>v.id===id)??r;
   if(title!==(reference.title.ja??reference.title.en)||proposed!==(categoryLabels[reference.researchmap_category]??'未決定')||reason!==reference.review_notes.filter(n=>/分類|査読|予稿|プレプリント/.test(n)).join(' / '))throw new Error('Classification reference columns changed; refresh from ledger');
   const d=state.decisions[id],old=current.decisions[id]??{};
   if(choice!=='未決定'||Object.hasOwn(old,'researchmap_category'))d.researchmap_category=categoryCode(choice);
   if(note||Object.hasOwn(old,'classification_note'))d.classification_note=note;
  }
  if(classified.size!==byId.size)throw new Error('Missing classification rows');
 }else if(Object.values(current.decisions).some(d=>Object.hasOwn(d,'researchmap_category')||Object.hasOwn(d,'classification_note')))throw new Error('Missing classification tab would discard decisions');
 // Row sorting is presentation only; preserve existing ledger/queue order for clean diffs.
 const orderedIds=new Map(current.ledger.records.map((r,i)=>[r.id,i]));state.ledger.records.sort((a,b)=>(orderedIds.get(a.id)??Infinity)-(orderedIds.get(b.id)??Infinity)||a.id.localeCompare(b.id));
 const queueOrder=new Map(current.queue.items.map((q,i)=>[q.id,i]));state.queue.items.sort((a,b)=>(queueOrder.get(a.id)??Infinity)-(queueOrder.get(b.id)??Infinity)||a.id.localeCompare(b.id));
 validateState(state);return state;
}
export function readState(root=process.cwd()){
 const read=n=>JSON.parse(readFileSync(resolve(root,'research-ledger',n),'utf8'));
 return {ledger:read('ledger.json'),queue:read('review-queue.json'),decisions:read('review-decisions.json')};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [command,input,output]=process.argv.slice(2),state=readState();
 if(command==='validate'){validateState(state);console.log('Workbook sidecars validated');}
 else if(command==='export'){if(!input)throw new Error('Usage: sheets.mjs export OUTPUT.json [BASE_COMMIT]');writeFileSync(input,JSON.stringify(exportWorkbook(state,output),null,2)+'\n');}
 else if(command==='import'){
  if(!input||!output)throw new Error('Usage: sheets.mjs import INPUT.json NEW_OUTPUT_DIRECTORY');
  const result=importWorkbook(JSON.parse(readFileSync(input,'utf8')),state);
  if(resolve(output)===resolve('research-ledger'))throw new Error('Write to a candidate directory; review diff before replacing the master');
  mkdirSync(output,{recursive:false});
  for(const [name,data] of [['ledger.json',result.ledger],['review-queue.json',result.queue],['review-decisions.json',result.decisions]])writeFileSync(resolve(output,name),JSON.stringify(data,null,2)+'\n');
  console.log(`Validated candidate: ${result.ledger.records.length} records. No master files modified.`);
 }else throw new Error('Expected export or import');
}
