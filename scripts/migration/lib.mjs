import crypto from 'node:crypto';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

export const origin = 'https://www.alchembright.com';
export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export const decodeText = value => load(value || '', null, false).text();
export function canonicalPath(url) {
  const u = new URL(url);
  if (!['www.alchembright.com', 'alchembright.com'].includes(u.hostname)) throw new Error(`Unexpected content host: ${u.hostname}`);
  const p = decodeURIComponent(u.pathname);
  if (/[\\\0?#]/.test(p) || p.split('/').includes('..')) throw new Error(`Unsafe content path: ${p}`);
  return p;
}
export function assetURLs(html, base) {
  const $ = load(html || '', null, false), found = [];
  $('img, source, video, audio, iframe, embed, object').each((_, el) => {
    for (const attr of ['src', 'poster', 'data-src', 'data']) if ($(el).attr(attr)) found.push($(el).attr(attr));
    for (const attr of ['srcset', 'data-srcset']) for (const part of ($(el).attr(attr) || '').split(',')) if (part.trim()) found.push(part.trim().split(/\s+/)[0]);
  });
  $('a[href]').each((_, el) => { if (/\.(?:jpe?g|png|gif|webp|pdf|avif)(?:[?#]|$)/i.test($(el).attr('href'))) found.push($(el).attr('href')); });
  return [...new Set(found.map(s => { try { return new URL(s, base).href; } catch { return ''; } }).filter(s => /^https?:/.test(s)))];
}
export function mediaTarget(url) {
  const pathname = new URL(url).pathname;
  const name = pathname.split('/').pop().replace(/[^a-zA-Z0-9._-]/g, '_') || 'asset';
  return `/media/imported/${hash(url).slice(0, 16)}/${name}`;
}
export function signature(html) {
  const $ = load(html, null, false);
  const attrs = selector => $(selector).toArray().map(el => {
    const e = $(el);
    return Object.fromEntries(['href', 'id', 'name', 'src', 'srcset', 'alt', 'data-original-src', 'colspan', 'rowspan'].filter(a => e.attr(a) !== undefined).map(a => [a, e.attr(a)]));
  }).filter(x => Object.keys(x).length);
  return {
    text: $.text().replace(/\s+/g, ''),
    attrs: attrs('a, [id], img, td, th'),
    code: $('pre').toArray().map(el => $(el).text().replace(/\r\n/g, '\n').replace(/\n$/, '')),
    breaks: $('br').length,
    tableCells: $('td,th').toArray().map(el => $(el).text().replace(/\s+/g, '')),
  };
}
export function convert(record, media, knownPaths) {
  const raw = record.content?.rendered || '';
  const $ = load(raw, null, false), warnings = [];
  if ($('script,style,iframe,object,embed').length) warnings.push('active_content_removed_or_linked');
  $('script,style').remove();
  $('iframe,object,embed').each((_, el) => {
    const u = $(el).attr('src') || $(el).attr('data');
    const a = $('<a>').text('元の埋め込みコンテンツ');
    if (u && /^https?:/.test(new URL(u, record.link).href)) a.attr('href', new URL(u, record.link).href);
    $(el).replaceWith(a);
  });
  $('[id]').each((_, el) => {
    // Anchors attached to paragraphs/headings must survive Markdown conversion.
    if (!['a','span'].includes(el.tagName)) { const id = $(el).attr('id'); $(el).removeAttr('id'); $(el).before($('<span>').attr('id', id)); }
  });
  $('img').each((_, el) => {
    const e = $(el), original = new URL(e.attr('src') || e.attr('data-src') || '', record.link).href;
    const mapping = media.get(original);
    e.attr('data-original-src', original);
    if (mapping?.recovery_status === 'recovered') e.attr('src', mapping.target_path);
    else { e.attr('src', '/media/pending.svg'); warnings.push(`pending_media:${original}`); }
    e.removeAttr('srcset').removeAttr('data-srcset').removeAttr('data-src').removeAttr('sizes');
    e.removeAttr('width').removeAttr('height');
    e.attr('loading', 'lazy');
  });
  $('a[href]').each((_, el) => {
    const e = $(el), href = e.attr('href');
    if (href.startsWith('#')) return;
    let u; try { u = new URL(href, record.link); } catch { warnings.push(`invalid_link:${href}`); return; }
    const mapping = media.get(u.href);
    if (mapping?.recovery_status === 'recovered') { e.attr('href', mapping.target_path); return; }
    if (['www.alchembright.com','alchembright.com'].includes(u.hostname) && !u.search && knownPaths.has(decodeURIComponent(u.pathname))) e.attr('href', decodeURIComponent(u.pathname) + u.hash);
    else if (!/^[a-z][a-z0-9+.-]*:/i.test(href)) e.attr('href', u.href);
  });
  const cleaned = sanitizeHtml($.html(), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'span', 'del', 'ins', 'figure', 'figcaption'],
    allowedAttributes: { '*': ['id','class','title','lang'], a: ['href','name','title'], img: ['src','alt','title','loading','data-original-src'], td: ['colspan','rowspan'], th: ['colspan','rowspan','scope'] },
    allowedSchemes: ['http','https','mailto','tel'],
  });
  if (cleaned !== $.html()) warnings.push('html_sanitized');
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', br: '  ' });
  td.use(gfm);
  td.addRule('preserveHTML', { filter: node => ['IMG','SPAN','FIGURE','FIGCAPTION','DEL','INS'].includes(node.nodeName) || (node.nodeName === 'A' && (node.hasAttribute('id') || node.hasAttribute('name'))), replacement: (_, node) => node.outerHTML });
  let body = td.turndown(cleaned), format = 'markdown';
  if (JSON.stringify(signature(marked.parse(body))) !== JSON.stringify(signature(cleaned))) {
    body = cleaned; format = 'html-preserved'; warnings.push('semantic_comparison_required_html_fallback');
  }
  return { body, format, warnings: [...new Set(warnings)], expected: signature(cleaned), sourceHash: hash(raw) };
}
