import test from 'node:test';
import assert from 'node:assert/strict';
import {applyTagAdditions} from './tag-additions.mjs';
test('tag restoration unions tags, preserves title/body, and is idempotent', () => {
 const posts=[{id:1,title:{rendered:'Old &amp; title'},date:'2003-01-01',content:{rendered:'Original body'},tags:[2]}];
 const tags=[{id:2,name:'existing'}];
 const additions={records:[{wp_id:1,title:'Old & title',published_at_local:'2003-01-01',tags:['existing','restored']}]};
 applyTagAdditions(posts,tags,additions);
 assert.deepEqual(posts[0].tags,[2,-1]);
 assert.equal(posts[0].title.rendered,'Old &amp; title');assert.equal(posts[0].content.rendered,'Original body');
 const once=JSON.stringify({posts,tags});applyTagAdditions(posts,tags,additions);assert.equal(JSON.stringify({posts,tags}),once);
});
test('changed article identity stops corrections', () => {
 assert.throws(()=>applyTagAdditions([{id:1,title:{rendered:'different'},date:'2003-01-01'}],[],{records:[{wp_id:1,title:'old',published_at_local:'2003-01-01',tags:['tag']}]}),/identity mismatch/);
});
