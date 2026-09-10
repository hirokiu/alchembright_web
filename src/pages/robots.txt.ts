export function GET() {
 const text=import.meta.env.PUBLIC_SITE_MODE==='production'?'User-agent: *\nAllow: /\nSitemap: https://www.alchembright.com/sitemap.xml\n':'User-agent: *\nDisallow: /\n';
 return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
