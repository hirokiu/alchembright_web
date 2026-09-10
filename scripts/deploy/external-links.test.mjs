import test from 'node:test';import assert from 'node:assert/strict';import {load} from 'cheerio';import {externalLinks} from './external-links.mjs';
test('external HTTP links open separately while same-site and email links remain unchanged',()=>{
 const $=load(externalLinks('<a href="https://other.example/x" rel="nofollow">a</a><a href="/blog/">b</a><a href="mailto:a@example.com">c</a><a href="https://www.alchembright.com/about/">d</a>','https://www.alchembright.com'));
 assert.equal($('a').eq(0).attr('target'),'_blank');assert.equal($('a').eq(0).attr('rel'),'nofollow noopener noreferrer');
 for(let n=1;n<4;n++)assert.equal($('a').eq(n).attr('target'),undefined);
});
