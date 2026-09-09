import {decodeText} from './lib.mjs';
// Keep archival corrections outside the immutable WordPress snapshot.
export function applyTagAdditions(posts, tags, additions) {
  const seen = new Set();
  for (const item of additions.records) {
    if (seen.has(item.wp_id)) throw Error('Duplicate tag correction');
    seen.add(item.wp_id);
    const post = posts.find(p => p.id === item.wp_id);
    if (!post || decodeText(post.title.rendered) !== item.title || post.date !== item.published_at_local) throw Error(`Tag correction identity mismatch: ${item.wp_id}`);
    for (const name of item.tags) {
      if (typeof name !== 'string' || !name.trim()) throw Error('Invalid tag name');
      let tag = tags.find(t => t.name === name);
      if (!tag) {
        // Negative IDs cannot collide with IDs assigned by WordPress.
        const id = Math.min(0, ...tags.map(t => t.id)) - 1;
        const slug = `mt-${-id}`;
        tag = {id, count:0, description:'', link:`https://www.alchembright.com/tag/${slug}/`, name, slug, taxonomy:'post_tag', meta:[]};
        tags.push(tag);
      }
      post.tags = [...new Set([...(post.tags || []), tag.id])];
    }
  }
  for (const tag of tags) tag.count = posts.filter(p => p.tags?.includes(tag.id)).length;
}
