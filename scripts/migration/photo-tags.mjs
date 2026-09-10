import {load} from 'cheerio';
export const hasImage = html => load(html || '',null,false)('img[src],picture source[srcset],svg').length > 0;
export function addPhotoTags(posts,tags) {
 let tag=tags.find(t=>t.name==='photo');
 const images=posts.filter(p=>hasImage(p.content?.rendered)||p.featured_media>0);
 if(!images.length)return;
 if(!tag){
  if(tags.some(t=>t.slug==='photo'))throw Error('photo slug already assigned');
  tag={id:Math.min(0,...tags.map(t=>t.id))-1,count:0,description:'',link:'https://www.alchembright.com/tag/photo/',name:'photo',slug:'photo',taxonomy:'post_tag',meta:[]};tags.push(tag);
 }
 for(const p of images)p.tags=[...new Set([...(p.tags||[]),tag.id])];
 tag.count=posts.filter(p=>p.tags?.includes(tag.id)).length;
}
