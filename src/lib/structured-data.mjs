const root = 'https://www.alchembright.com/';
const personId = `${root}about/#person`;
/** Emit only information already displayed on the corresponding page. */
export function structuredData(path, title, researcher, projects) {
  const url = new URL(path, root).href;
  const website = {'@type':'WebSite','@id':`${root}#website`,url:root,name:'Alchembright'};
  const page = {'@type':path === '/about/' ? 'ProfilePage' : 'WebPage','@id':`${url}#webpage`,url,name:title === 'home' ? 'Alchembright' : title,inLanguage:'ja',isPartOf:{'@id':website['@id']}};
  const graph = [website,page];
  if (path === '/about/') {
    graph.push({'@type':'Person','@id':personId,name:researcher.name,alternateName:researcher.alternateName,url:researcher.url,sameAs:researcher.sameAs,knowsAbout:researcher.knowsAbout});
    page.mainEntity = {'@id':personId};
  }
  const project = projects.find(p => path === `/works/${p.slug}/` && p.kind.startsWith('研究'));
  if (project) {
    const id = `${url}#project`;
    graph.push({'@type':'ResearchProject','@id':id,name:project.title,description:project.summary,url});
    page.mainEntity = {'@id':id};
    // These links include portals as well as papers; do not mislabel all as ScholarlyArticle.
    page.relatedLink = project.links.map(([,href]) => href);
  }
  return {'@context':'https://schema.org','@graph':graph};
}
/** Prevent user-controlled text from terminating the JSON-LD script element. */
export function serializeStructuredData(value) {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
}
