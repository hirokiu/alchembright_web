import test from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { convert, signature, canonicalPath, mediaTarget, assetURLs } from './lib.mjs';
const record = html => ({link:'https://www.alchembright.com/blog/days/example/',content:{rendered:html}});
test('Japanese text, explicit line breaks and code survive conversion',()=>{
 const c=convert(record('<p>一行目<br />\n二行目</p><pre>if (a &lt; b) {\n  return 1;\n}</pre>'),new Map(),new Set());
 assert.deepEqual(signature(marked.parse(c.body)),c.expected);
 assert.equal(c.expected.breaks,1);
 assert.equal(c.expected.code[0],'if (a < b) {\n  return 1;\n}');
});
test('named fragments and complex table structure survive HTML fallback',()=>{
 const c=convert(record('<h2 id="old-title">見出し</h2><a name="legacy"></a><table><tr><td colspan="2">結合</td></tr><tr><td>A</td><td>B</td></tr></table>'),new Map(),new Set());
 assert.deepEqual(signature(marked.parse(c.body)),c.expected);
 assert.ok(c.expected.attrs.some(a=>a.id==='old-title'));
 assert.ok(c.expected.attrs.some(a=>a.name==='legacy'));
 assert.ok(c.expected.attrs.some(a=>a.colspan==='2'));
});
test('script/event handlers do not become executable; source changes are reported',()=>{
 const c=convert(record('<script>alert(1)</script><p onclick="bad()">本文<img src="http://old.example/a.jpg" onerror="bad()" alt="写真"></p>'),new Map(),new Set());
 assert.doesNotMatch(c.body,/<script|onerror|onclick/);
 assert.match(c.body,/data-original-src="http:\/\/old.example\/a.jpg"/);
 assert.ok(c.warnings.includes('active_content_removed_or_linked'));
});
test('pending and recovered image URLs use the mapping without losing origin',()=>{
 const u='http://old.example/p.jpg',r=record(`<p><img src="${u}" srcset="${u} 1x" alt="古い写真"></p>`);
 const pending=convert(r,new Map(),new Set());assert.match(pending.body,/\/media\/pending.svg/);
 const c=convert(r,new Map([[u,{target_path:'/media/imported/key/p.jpg',recovery_status:'recovered'}]]),new Set());
 assert.match(c.body,/src="\/media\/imported\/key\/p.jpg"/);assert.match(c.body,/data-original-src=/);assert.doesNotMatch(c.body,/srcset=/);
});
test('current article links become local; unknown old-host links remain traceable',()=>{
 const c=convert(record('<a href="https://www.alchembright.com/about/#bio">本人</a><a href="http://www.balog.jp/~hiro/mt/archives/000144.html">旧記事</a>'),new Map(),new Set(['/about/']));
 assert.ok(c.expected.attrs.some(x=>x.href==='/about/#bio'));
 assert.ok(c.expected.attrs.some(x=>x.href?.includes('/mt/archives/')));
});
test('media paths separate hosts and canonical paths preserve Japanese slugs',()=>{
 assert.notEqual(mediaTarget('http://a.example/a.jpg'),mediaTarget('http://b.example/a.jpg'));
 assert.equal(canonicalPath('https://www.alchembright.com/blog/%e6%97%a5/'),'/blog/日/');
 assert.throws(()=>canonicalPath('https://other.example/a/'));
 assert.deepEqual(assetURLs('<img src="a.jpg"><a href="original.jpg">原寸</a>','https://example.com/x/'),['https://example.com/x/a.jpg','https://example.com/x/original.jpg']);
});
