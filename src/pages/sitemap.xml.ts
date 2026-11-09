import projects from '../data/works.json';
import { routes } from '../lib/routes';

export async function GET({ site }: { site: URL | undefined }) {
  if (!site) throw new Error('Sitemap requires a configured site URL');
  const paths = [
    ...(await routes()).map(route => route.path),
    ...projects.map(project => `/works/${project.slug}/`),
    '/works/kirokun/', '/works/balog/', '/tags/', '/privacy/', '/feed/',
  ];
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  const urls = [...new Set(paths.map(path => new URL(path, site).href))].sort();
  const xml = urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
