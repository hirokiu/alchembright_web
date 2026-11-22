import test from 'node:test';
import assert from 'node:assert/strict';
import {hashtagLinks} from '../../src/lib/tag-policy.mjs';
test('same encoded hashtag is used for all three social links',()=>{
 const links=hashtagLinks({name:'料理'});
 assert.equal(links.x,'https://x.com/hashtag/'+encodeURIComponent('料理'));
 assert.equal(links.instagram,'https://www.instagram.com/explore/tags/'+encodeURIComponent('料理')+'/');
 assert.equal(links.note,'https://note.com/tag/'+encodeURIComponent('料理'));
 assert.equal(hashtagLinks({name:'GitHub Pages',hashtag:'GitHubPages'}).value,'GitHubPages');
});
test('internal tags and unsupported hashtag text have no external links',()=>{
 for(const name of ['two words','a/b','123','<script>','a?b']) assert.equal(hashtagLinks({name}),null);
 assert.equal(hashtagLinks({name:'ads',internal:true}),null);
});
