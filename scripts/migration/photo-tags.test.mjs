import test from 'node:test';
import assert from 'node:assert/strict';
import {addPhotoTags} from './photo-tags.mjs';
test('image and featured-image posts receive photo without replacing existing tags',()=>{
 const posts=[{content:{rendered:'<img src="a.jpg">'},tags:[3]},{content:{rendered:'<a href="a.jpg">link only</a>'},tags:[]},{featured_media:12,tags:[]}];const tags=[{id:3,name:'other'}];
 addPhotoTags(posts,tags);const id=tags.find(t=>t.name==='photo').id;
 assert.deepEqual(posts.map(p=>p.tags),[[3,id],[],[id]]);
 const once=JSON.stringify({posts,tags});addPhotoTags(posts,tags);assert.equal(JSON.stringify({posts,tags}),once);
});
