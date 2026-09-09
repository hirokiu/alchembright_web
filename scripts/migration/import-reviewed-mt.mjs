import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import {parse} from 'csv-parse/sync';
import {convert,hash} from './lib.mjs';
const records=JSON.parse(await fs.readFile('migration/reviewed/mt-drafts.json','utf8'));
if(records.some(r=>r.publication_approved!==true || !r.approved_by || !r.approved_at))throw Error('Unapproved publication');
const tags=JSON.parse(await fs.readFile('src/data/tags.json','utf8'));
const categories=JSON.parse(await fs.readFile('src/data/categories.json','utf8'));
const media=new Map(parse(await fs.readFile('migration/mappings/media-map.csv','utf8'),{columns:true}).map(m=>[m.source_url,m]));
const paths=new Set(records.map(r=>`/blog/restored/${r.created_at.slice(0,4)}/${r.basename}/`));
const report={records:[]};
for(const r of records){
 const route=`/blog/restored/${r.created_at.slice(0,4)}/${r.basename}/`;
 const conversion=convert({link:'https://www.alchembright.com'+route,content:{rendered:r.html}},media,paths);
 const tagIds=r.tags.map(name=>{const t=tags.find(t=>t.name===name);if(!t)throw Error('Unknown reviewed tag '+name);return t.id;});
 const categoryIds=[...new Set([categories.find(c=>c.slug==='blog').id,...r.categories.flatMap(name=>categories.filter(c=>c.name===name).map(c=>c.id))])];
 const meta={source_system:'movable-type',source_id:r.archive_id,source_id_kind:'local archival ID; not an original MT entry ID',content_type:'post',status:'publish',original_status:'Draft',title:r.title,canonical_path:route,original_url:null,published_at_local:r.created_at,published_at_gmt:null,modified_at_local:r.created_at,first_published_at:'2026-09-09',source_timezone:null,category_ids:categoryIds,tag_ids:tagIds,original_category_labels:r.categories,excerpt:'過去の下書きを本人確認のうえ公開した記事です。',mt_basename:r.basename,conversion_format:conversion.format,conversion_warnings:conversion.warnings,reviewed_content_sha256:hash(JSON.stringify(r))};
 const file=`src/content/restored/${r.basename}.md`;
 await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,`---\n${YAML.stringify(meta,{defaultStringType:'QUOTE_DOUBLE'})}---\n\n${conversion.body}\n`);
 report.records.push({id:r.archive_id,file,path:route,expected:conversion.expected});
}
await fs.writeFile('migration/reports/reviewed-mt.json',JSON.stringify(report,null,2)+'\n');
console.log(`Generated ${records.length} reviewed former drafts.`);
