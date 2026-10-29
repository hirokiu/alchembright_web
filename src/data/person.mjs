// Public identity verified on 2026-10-20; evidence and update procedure: docs/person-audit.md.
export const profiles = [
  {label:'researchmap', url:'https://researchmap.jp/hiroki_u'},
  {label:'ORCID', url:'https://orcid.org/0000-0003-4215-3112'},
  {label:'Google Scholar', url:'https://scholar.google.com/citations?user=0b03ZwEAAAAJ'},
  {label:'東京経済大学 教員プロフィール', url:'https://gyoseki.acoffice.jp/tkeihp/KgApp/k03/resid/S000258'},
  {label:'GitHub', url:'https://github.com/hirokiu'},
];
export const researcherSummary = '上松大輝（Hiroki Uematsu）。博士（情報学）。国立情報学研究所の特任研究員。Semantic Web、知識グラフ、地震観測、デジタルアーカイブ、デジタル人文学に取り組んでいます。';
export const profileGraph = {
  '@context':'https://schema.org',
  '@type':'ProfilePage',
  '@id':'https://www.alchembright.com/about/#webpage',
  url:'https://www.alchembright.com/about/',
  name:'上松大輝 — Alchembright',
  mainEntity:{
    '@type':'Person', '@id':'https://www.alchembright.com/about/#person',
    description:researcherSummary,
    name:'上松 大輝', alternateName:['上松大輝','Hiroki Uematsu','Hiroki UEMATSU','hiroki_u'],
    givenName:'大輝', familyName:'上松', url:'https://www.alchembright.com/about/',
    sameAs:profiles.map(p=>p.url),
    identifier:{'@type':'PropertyValue', propertyID:'ORCID', value:'0000-0003-4215-3112'},
    affiliation:[
      {'@type':'Organization',name:'国立情報学研究所',url:'https://www.nii.ac.jp/'},
      {'@type':'CollegeOrUniversity',name:'東京経済大学',url:'https://www.tku.ac.jp/'},
    ],
    alumniOf:{'@type':'CollegeOrUniversity',name:'総合研究大学院大学',url:'https://www.soken.ac.jp/'},
    hasCredential:{'@type':'EducationalOccupationalCredential',name:'博士（情報学）',credentialCategory:'博士'},
    knowsAbout:['Semantic Web','知識グラフ','オントロジー','IoT','地震観測','デジタルアーカイブ','デジタル人文学'],
    subjectOf:{'@type':'WebPage',url:'https://www.nii.ac.jp/faculty/list/project-profs/',name:'国立情報学研究所 特任教員'},
  },
};
// Escape HTML delimiters even when future public data contains a script closing tag.
export const serializeJsonLd = value => JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export function validProfileScript(relative, attributes, text) {
  if(relative !== 'about/index.html' || attributes.type !== 'application/ld+json' || Object.keys(attributes).some(k=>k!=='type')) return false;
  try {return JSON.stringify(JSON.parse(text))===JSON.stringify(profileGraph);} catch {return false;}
}
