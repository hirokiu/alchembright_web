import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsSrc,analyticsInit,validAnalyticsScript} from '../../src/data/analytics.mjs';
test('GA4 whitelist rejects changed destinations and injected handlers',()=>{
 const attrs={id:'ga4-loader',async:'',src:analyticsSrc};
 assert.ok(validAnalyticsScript(attrs,''));
 assert.ok(validAnalyticsScript({id:'ga4-init'},analyticsInit));
 assert.equal(validAnalyticsScript({...attrs,src:'https://example.com/tag.js'},''),false);
 assert.equal(validAnalyticsScript({...attrs,onload:'alert(1)'},''),false);
 assert.equal(validAnalyticsScript({id:'ga4-init'},analyticsInit+'alert(1)'),false);
});
