import { getCollection } from 'astro:content';
const escape = (s: string) => s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET() {
  const posts=(await getCollection('archive')).filter(e=>e.data.content_type==='post').sort((a,b)=>b.data.published_at_local.localeCompare(a.data.published_at_local)).slice(0,20);
  const items=posts.map(e=>`<item><title>${escape(e.data.title)}</title><link>${escape(e.data.original_url)}</link><guid isPermaLink="true">${escape(e.data.original_url)}</guid>${e.data.published_at_gmt ? `<pubDate>${new Date(e.data.published_at_gmt+'Z').toUTCString()}</pubDate>`:''}<description>${escape(e.data.excerpt)}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Alchembright</title><link>https://www.alchembright.com/</link><description>Alchembright Blog</description><language>ja</language>${items}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
}
