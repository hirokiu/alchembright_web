import test from 'node:test';
import assert from 'node:assert/strict';
import {profileGraph,serializeJsonLd,validProfileScript} from '../../src/data/person.mjs';
test('verified researcher identity and canonical profile',()=>{
 const p=profileGraph.mainEntity;
 assert.equal(p['@id'],'https://www.alchembright.com/about/#person');
 assert.ok(p.sameAs.includes('https://scholar.google.com/citations?user=0b03ZwEAAAAJ'));
 assert.ok(p.sameAs.includes('https://orcid.org/0000-0003-4215-3112'));
 assert.equal(p.sameAs.length,5);
 assert.ok(!JSON.stringify(p).includes('GT6LhVYAAAAJ'));
 assert.ok(!JSON.stringify(p).includes('daiki-uematsu.com'));
 assert.ok(!p.sameAs.includes(p.subjectOf.url));
});
test('JSON-LD cannot break out of script element',()=>{
 const input={name:'</script><script>alert(1)</script>\u2028\u2029'};
 const output=serializeJsonLd(input);
 assert.ok(!output.includes('<'));
 assert.deepEqual(JSON.parse(output),input);
});
test('only exact inert profile payload on about is allowed',()=>{
 const text=serializeJsonLd(profileGraph),attrs={type:'application/ld+json'};
 assert.ok(validProfileScript('about/index.html',attrs,text));
 for(const [file,a,t] of [
 ['index.html',attrs,text],['about/index.html',{...attrs,src:'https://example.com/x.js'},text],
 ['about/index.html',{...attrs,onload:'alert(1)'},text],['about/index.html',{type:'module'},text],
 ['about/index.html',attrs,'{}'],['about/index.html',attrs,'invalid'],
 ['about/index.html',attrs,text.replace('0b03ZwEAAAAJ','GT6LhVYAAAAJ')]]) assert.equal(validProfileScript(file,a,t),false);
});
