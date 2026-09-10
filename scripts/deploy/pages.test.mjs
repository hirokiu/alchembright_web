import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyTarget } from '../../src/lib/legacy-navigation.ts';
import { legacyMap } from './legacy-map.mjs';
test('all inventoried IDs resolve to their preserved URLs', async () => {
  const map=await legacyMap(); assert.equal(Object.keys(map).length,422);
  for (const [id,target] of Object.entries(map)) {
    assert.equal(legacyTarget('/',`?p=${id}`,'#old-anchor',map),target+'#old-anchor');
    assert.equal(legacyTarget('/index.php',`?page_id=${id}`,'',map),target);
  }
});
test('unknown, ambiguous, unsafe and unrelated requests do not redirect', () => {
  const map={'6':'/blog/old/','7':'//example.org/','8':'/\\example.org/'};
  for (const query of ['?p=999','?p=0','?p=06','?p=6&p=6','?p=6&page_id=6','?p=7','?p=8','?p=__proto__']) assert.equal(legacyTarget('/',query,'',map),null);
  assert.equal(legacyTarget('/about/','?p=6','',map),null);
  assert.equal(legacyTarget('/','?feed=rss2','',map),'/feed.xml');
  assert.equal(legacyTarget('/','?feed=rss2&feed=atom','',map),null);
});
