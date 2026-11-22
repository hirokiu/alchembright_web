import test from 'node:test';
import assert from 'node:assert/strict';
import {articleDescription, articleGraph, adsPermitted} from '../../src/lib/article-seo.mjs';
import {serializeJsonLd} from '../../src/data/person.mjs';
const base={content_type:'post',canonical_path:'/blog/test/',title:'題名',published_at_local:'2003-10-02T12:00:00',modified_at_local:'2026-09-01T00:00:00',category_ids:[13],excerpt:'<p>本文 &amp; 要約</p>\n“題名” の続きを読む\\n'};
test('article metadata strips excerpt markup and read-more, preserving original dates',()=>{
 const graph=articleGraph(base);
 assert.equal(graph.description,'本文 & 要約');
 assert.equal(graph.datePublished,'2003-10-02');
 assert.ok(!('dateModified' in graph));
 assert.equal(graph.author.url,'https://www.alchembright.com/about/');
 assert.equal(articleGraph({...base,content_type:'page'}),null);
});
test('restored drafts use first publication, and only editorial updates are exposed',()=>{
 const graph=articleGraph({...base,first_published_at:'2026-09-09',seo_modified_at:'2026-11-22'});
 assert.equal(graph.datePublished,'2026-09-09');assert.equal(graph.dateModified,'2026-11-22');
});
test('JSON-LD safely escapes HTML and explicit summaries override excerpts',()=>{
 assert.equal(articleDescription({...base,seo_description:'専用要約'}),'専用要約');
 const json=serializeJsonLd(articleGraph({...base,title:'</script><script>alert(1)</script>'}));
 assert.ok(!json.includes('<'));assert.equal(JSON.parse(json).headline,'</script><script>alert(1)</script>');
});
test('ads require explicit permission and reviewed general blog classification',()=>{
 assert.equal(adsPermitted(base),false);
 const allowed={...base,article_kind:'general',ads_allowed:true};
 assert.equal(adsPermitted(allowed),true);
 for(const override of [{article_kind:'research'},{article_kind:'unreviewed'},{ads_allowed:'true'},{content_type:'page'},{canonical_path:'/works/test/'},{category_ids:[13,14]}]) assert.equal(adsPermitted({...allowed,...override}),false);
});
