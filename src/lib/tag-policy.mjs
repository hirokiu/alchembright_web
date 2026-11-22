export function hashtagFor(tag) {
  const value = tag.hashtag ?? tag.name;
  if (tag.internal || !/^[\p{L}\p{M}\p{N}_]+$/u.test(value) || !/[\p{L}]/u.test(value)) return null;
  return value;
}
export function hashtagLinks(tag) {
  const value = hashtagFor(tag);
  if (!value) return null;
  const encoded = encodeURIComponent(value);
  return { value, x: `https://x.com/hashtag/${encoded}`, instagram: `https://www.instagram.com/explore/tags/${encoded}/`, note: `https://note.com/tag/${encoded}` };
}
export function advertisingAllowed(data, categories, tags) {
  if (data.content_type !== 'post' || !data.canonical_path.startsWith('/blog/') || data.article_kind === 'research') return false;
  const categoryIds = data.category_ids || [], tagIds = data.tag_ids || [];
  // Unknown classifications fail closed. Category decisions apply to exact IDs, not descendants.
  if (categoryIds.some(id=>!categories.some(c=>c.id===id)) || tagIds.some(id=>!tags.some(t=>t.id===id))) return false;
  const terms = [...categories.filter(c=>categoryIds.includes(c.id)), ...tags.filter(t=>tagIds.includes(t.id))];
  if (terms.some(t=>t.ad_policy === 'deny') || categoryIds.some(id=>[14,16].includes(id))) return false;
  return terms.some(t=>t.ad_policy === 'allow');
}
