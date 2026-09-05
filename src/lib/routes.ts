import { getCollection, type CollectionEntry } from 'astro:content';
import categories from '../data/categories.json';
import tags from '../data/tags.json';
export type Entry = CollectionEntry<'archive'>;
export type Route = { path: string; title: string; entry?: Entry; entries?: Entry[]; page?: number; totalPages?: number; base?: string };
export const pathOf = (url: string) => decodeURIComponent(new URL(url).pathname);
export async function routes(): Promise<Route[]> {
  const entries = await getCollection('archive');
  const posts = entries.filter(e => e.data.content_type === 'post').sort((a,b) => b.data.published_at_local.localeCompare(a.data.published_at_local) || b.data.source_id-a.data.source_id);
  const out: Route[] = entries.map(entry => ({ path:entry.data.canonical_path, title:entry.data.title, entry }));
  function listing(base: string, title: string, items: Entry[]) {
    const totalPages = Math.max(1,Math.ceil(items.length / 10));
    for (let page=1;page<=totalPages;page++) out.push({ path:page===1?base:`${base}page/${page}/`,title,entries:items.slice((page-1)*10,page*10),page,totalPages,base });
  }
  listing('/blog/','blog',posts);
  function descendants(id: number, visited = new Set<number>()): number[] {
    if (visited.has(id)) throw new Error('Category cycle');
    const next=new Set([...visited,id]);
    return [id,...categories.filter(c=>c.parent===id).flatMap(c=>descendants(c.id,next))];
  }
  for (const category of categories) {
    const ids = descendants(category.id);
    listing(pathOf(category.link),category.name,posts.filter(e=>e.data.category_ids.some(id=>ids.includes(id))));
  }
  for (const tag of tags) listing(pathOf(tag.link),tag.name,posts.filter(e=>e.data.tag_ids.includes(tag.id)));
  for (const year of new Set(posts.map(e=>e.data.published_at_local.slice(0,4)))) listing(`/${year}/`,`${year}年`,posts.filter(e=>e.data.published_at_local.startsWith(year)));
  for (const month of new Set(posts.map(e=>e.data.published_at_local.slice(0,7)))) listing(`/${month.replace('-','/')}/`,`${month.replace('-','年')}月`,posts.filter(e=>e.data.published_at_local.startsWith(month)));
  if (new Set(out.map(r=>r.path)).size !== out.length) throw new Error('Route collision');
  return out;
}
export { categories, tags };

export async function archiveYears() { return [...new Set((await getCollection('archive')).filter(e=>e.data.content_type==='post').map(e=>e.data.published_at_local.slice(0,4)))].sort().reverse(); }
