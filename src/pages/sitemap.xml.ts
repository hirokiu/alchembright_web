import {routes} from '../lib/routes';
export async function GET({site}: {site: URL | undefined}) {
 const xml=[...(await routes()), {path:'/works/kirokun/'}, {path:'/works/balog/'}, {path:'/tags/'}].map(r=>`<url><loc>${new URL(r.path,site).href.replaceAll('&','&amp;')}</loc></url>`).join('');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
