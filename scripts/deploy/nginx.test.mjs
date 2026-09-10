import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'csv-parse/sync';
import {generate} from './generate-nginx.mjs';
test('all imported post/page IDs are represented and Unicode paths are encoded',()=>{
 const rows=parse(fs.readFileSync('migration/mappings/url-map.csv','utf8'),{columns:true});
 const output=generate(rows);
 assert.equal((output.match(/^    "(?:post|page):/gm)||[]).length,422);
 assert.match(output,/"post:50" "\/blog\/days\/movabletype\/"/);
 assert.match(output,/"page:461" "\/"/);
 assert.doesNotMatch(output,/料理/);
 assert.match(output,/%E6%96%99/i);
 assert.equal(output,fs.readFileSync('deploy/nginx/wp-id-maps.conf','utf8'));
});
test('reject conflicting IDs and Nginx directives injected through a mapping',()=>{
 const row={source_kind:'post',source_id:'wp:1',target_path:'/ok/'};
 assert.throws(()=>generate([row,row]),/Duplicate/);
 for(const target_path of ['/a/;return 200;/', '/$host/', '/a/../b/']) assert.throws(()=>generate([{...row,target_path}]),/Unsafe/);
});

test('release switch replaces only a verified release symlink and can be reversed',async()=>{
 const fsp=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path'),{spawnSync}=await import('node:child_process');
 const dir=await fsp.mkdtemp(path.join(os.tmpdir(),'alchembright-release-test-'));
 const script=path.resolve('scripts/deploy/switch-release.mjs');
 try {
  for(const name of ['first','second']) {
   const r=path.join(dir,'releases',name);await fsp.mkdir(path.join(r,'public'),{recursive:true});await fsp.mkdir(path.join(r,'nginx'));
   await fsp.writeFile(path.join(r,'public/index.html'),'test');await fsp.writeFile(path.join(r,'nginx/wp-id-maps.conf'),'test');
   await fsp.writeFile(path.join(r,'release.json'),JSON.stringify({mode:'preview'}));await fsp.writeFile(path.join(r,'verification.json'),JSON.stringify({failures:[]}));
  }
  const current=path.join(dir,'current'),run=name=>spawnSync(process.execPath,[script,current,path.join(dir,'releases',name)],{encoding:'utf8'});
  assert.equal(run('first').status,0);assert.equal(run('second').status,0);assert.match(await fsp.readlink(current),/second$/);
  assert.equal(run('first').status,0);assert.match(await fsp.readlink(current),/first$/);
  await fsp.writeFile(path.join(dir,'releases/second/.incomplete'),'not ready');assert.notEqual(run('second').status,0);assert.match(await fsp.readlink(current),/first$/);
  await fsp.unlink(current);await fsp.mkdir(current);assert.notEqual(run('first').status,0);assert.ok((await fsp.stat(current)).isDirectory());
 }finally{await fsp.rm(dir,{recursive:true,force:true});}
});
