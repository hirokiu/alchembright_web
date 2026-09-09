import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {hash} from './lib.mjs';
const scripts=path.dirname(new URL(import.meta.url).pathname);
const record={id:1,type:'post',status:'publish',date:'2003-04-24T15:16:55',date_gmt:'2003-04-24T06:16:55',modified:'2003-04-24T15:16:55',modified_gmt:'2003-04-24T06:16:55',title:{rendered:'試験'},slug:'test',link:'https://www.alchembright.com/blog/test/',content:{rendered:'<p>原文<br />二行目</p>',protected:false},categories:[],tags:[]};
async function fixture(r=record) {
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'alchembright-test-'));
 await fs.mkdir(path.join(dir,'snapshot'));await fs.mkdir(path.join(dir,'migration/mappings'),{recursive:true});
 await fs.writeFile(path.join(dir,'migration/mappings/media-map.csv'),'source_url,source_record_id,target_path,sha256,bytes,mime_type,recovery_status,evidence,notes\n');
 const manifest={resources:{}};
 for(const [type,data] of Object.entries({posts:[r],pages:[],categories:[],tags:[],media:[]})){
  const body=JSON.stringify(data);await fs.writeFile(path.join(dir,'snapshot',`${type}.json`),body);manifest.resources[type]={count:data.length,sha256:hash(body)};
 }
 await fs.writeFile(path.join(dir,'snapshot/manifest.json'),JSON.stringify(manifest));return dir;
}
const run=(dir,script,...args)=>spawnSync(process.execPath,[path.join(scripts,script),...args],{cwd:dir,encoding:'utf8'});
test('private and password-protected records cannot enter the public content directory',async()=>{
 for(const r of [{...record,status:'private'},{...record,content:{...record.content,protected:true}}]){
  const dir=await fixture(r);try {const out=run(dir,'import.mjs','snapshot','stage');assert.notEqual(out.status,0);assert.match(out.stderr,/public, unprotected/);}finally{await fs.rm(dir,{recursive:true,force:true});}
 }
});
test('repeat imports are deterministic, existing stages are protected, and promotion preserves manual edits',async()=>{
 const dir=await fixture();try {
  assert.equal(run(dir,'import.mjs','snapshot','stage1').status,0);
  assert.equal(run(dir,'import.mjs','snapshot','stage2').status,0);
  const content='src/content/blog/2003/wp-1.md';
  assert.equal(await fs.readFile(path.join(dir,'stage1',content),'utf8'),await fs.readFile(path.join(dir,'stage2',content),'utf8'));
  assert.notEqual(run(dir,'import.mjs','snapshot','stage1').status,0);
  await fs.cp(path.join(dir,'stage1/src'),path.join(dir,'src'),{recursive:true});
  await fs.mkdir(path.join(dir,'migration/reports'));await fs.copyFile(path.join(dir,'stage1/conversion-report.json'),path.join(dir,'migration/reports/conversion-report.json'));
  await fs.copyFile(path.join(dir,'stage1/url-map.csv'),path.join(dir,'migration/mappings/url-map.csv'));
  await fs.appendFile(path.join(dir,content),'\n手編集\n');
  const out=run(dir,'promote.mjs','stage2');assert.notEqual(out.status,0);assert.match(out.stderr,/Manual edit preserved/);
  assert.match(await fs.readFile(path.join(dir,content),'utf8'),/手編集/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('former drafts without owner approval cannot enter the public content directory',async()=>{
 const dir=await fixture();try{
  await fs.mkdir(path.join(dir,'migration/reviewed'),{recursive:true});
  await fs.writeFile(path.join(dir,'migration/reviewed/mt-drafts.json'),JSON.stringify([{basename:'private',publication_approved:false}]));
  const result=run(dir,'import-reviewed-mt.mjs');assert.notEqual(result.status,0);assert.match(result.stderr,/Unapproved publication/);
  await assert.rejects(fs.access(path.join(dir,'src/content')));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
