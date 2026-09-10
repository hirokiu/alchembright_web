import {test} from 'node:test';
import assert from 'node:assert/strict';
import {structuredData,serializeStructuredData} from '../../src/lib/structured-data.mjs';
const person={name:'上松 大輝',alternateName:['Hiroki UEMATSU'],url:'https://www.alchembright.com/about/',sameAs:['https://researchmap.jp/hiroki_u'],knowsAbout:['知識グラフ'],privateNote:'not for output'};
const projects=[{slug:'research',kind:'研究',title:'研究',summary:'説明',links:[['成果','https://example.org/']]},{slug:'business',kind:'業務',title:'匿名業務'}];
test('profile identifies a Person and only exports explicitly allowed fields',()=>{
 const d=structuredData('/about/','about',person,projects);
 assert.equal(d['@graph'][1]['@type'],'ProfilePage');
 assert.equal(d['@graph'][1].mainEntity['@id'],d['@graph'][2]['@id']);
 assert.equal(d['@graph'][2]['@type'],'Person');
 assert.ok(!JSON.stringify(d).includes('privateNote'));
});
test('research entities only appear on their own research pages',()=>{
 assert.equal(structuredData('/works/research/','研究',person,projects)['@graph'][2]['@type'],'ResearchProject');
 for(const p of ['/','/works/business/','/category/works/']) assert.equal(structuredData(p,'title',person,projects)['@graph'].length,2);
});
test('JSON-LD script termination is escaped without changing parsed data',()=>{
 const value={name:'</script><script>alert(1)</script>\u2028'};
 const encoded=serializeStructuredData(value);assert.ok(!encoded.includes('<'));assert.deepEqual(JSON.parse(encoded),value);
});
