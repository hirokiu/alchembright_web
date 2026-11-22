import { load } from 'cheerio';
export const author = { '@type': 'Person', '@id': 'https://www.alchembright.com/about/#person', name: '上松大輝', url: 'https://www.alchembright.com/about/' };
export function articleDescription(data) {
  const $ = load(data.seo_description || data.excerpt || '', null, false);
  $('script,style').remove();
  return $.text().replace(/[“「"][^\n]*?の続きを読む(?:\\n)?/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}
// Imported modification timestamps can describe a migration, not an editorial update.
// Use a date only: the archive's original timezone is not always known.
export function articleDates(data) {
  return { published: String(data.first_published_at || data.published_at_local).slice(0, 10), modified: data.seo_modified_at };
}
export function articleGraph(data, site = 'https://www.alchembright.com') {
  if (data.content_type !== 'post') return null;
  const url = new URL(data.canonical_path, site).href;
  const dates = articleDates(data);
  const description = articleDescription(data);
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#article`, url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, headline: data.title,
    ...(description ? { description } : {}), author, datePublished: dates.published,
    ...(dates.modified ? { dateModified: dates.modified } : {}), inLanguage: 'ja' };
}
// This is an eligibility gate only. No ad code, slot, or request is rendered.
export { advertisingAllowed as adsPermitted } from './tag-policy.mjs';
