import { z } from 'zod';
export const kinds = ['publications','presentations','projects','grants','awards','career','education','academic_service','events','datasets','software','memberships'];
export const targets = ['researchmap','orcid','google_scholar','university_db','alchembright','cv'];
export const mapping = {
  publications: ['published_papers','misc'], presentations: ['presentations'],
  projects: ['works','research_projects','others'], grants: ['research_projects'],
  awards: ['awards'], career: ['research_experience'], education: ['education'],
  academic_service: ['committee_memberships','academic_contribution'],
  events: ['academic_contribution','social_contribution','presentations'],
  datasets: ['works','others'], software: ['works','others'],
  memberships: ['association_memberships','committee_memberships'],
};
const text = z.string().trim().min(1);
const nullableText = text.nullable();
const url = z.url().refine(v => ['http:','https:'].includes(new URL(v).protocol), 'HTTP(S) URL required');
const day = z.iso.date();
const date = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/).refine(v => {
  const full = v.length === 4 ? `${v}-01-01` : v.length === 7 ? `${v}-01` : v;
  return day.safeParse(full).success;
}, 'Invalid calendar date');
const localized = z.strictObject({ja: nullableText, en: nullableText}).refine(v => v.ja || v.en, 'At least one language required');
const id = z.string().regex(/^ral-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const sync = z.strictObject({
  status: z.enum(['tracked','synced','needs_review','not_applicable']),
  external_id: nullableText, url: url.nullable(), checked_at: day.nullable(),
  content_hash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  note: nullableText,
}).superRefine((v,c) => {
  if (v.status === 'synced' && (!v.checked_at || !v.content_hash || !v.url || !v.external_id))
    c.addIssue({code:'custom',message:'synced requires dated comparison, URL, external ID and content hash'});
  if (['needs_review','not_applicable'].includes(v.status) && !v.note)
    c.addIssue({code:'custom',message:'Review or non-applicability reason required'});
});
export const recordSchema = z.strictObject({
  id, kind: z.enum(kinds), subtype: text, title: localized,
  date: date.nullable(), end_date: date.nullable(), ongoing: z.boolean(),
  contributors: z.array(z.strictObject({name: localized, person_id: z.literal('hiroki-uematsu').nullable(), role: text})).min(1),
  peer_reviewed: z.enum(['yes','no','unknown','not_applicable']),
  peer_review_scope: z.enum(['full_text','abstract','none','unknown','not_applicable']).optional(),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/i).nullable(), urls: z.array(url),
  project_ids: z.array(id), related_ids: z.array(id), keywords: z.array(text),
  bibliographic: z.strictObject({venue: nullableText, volume: nullableText, issue: nullableText, pages: nullableText}),
  organization: nullableText, funding: z.strictObject({funder: nullableText, program: nullableText, award_number: nullableText}),
  researchmap_category: z.enum([...new Set(Object.values(mapping).flat())]).nullable(),
  evidence: z.array(z.strictObject({url, accessed_at: day, supports: z.array(text).min(1), note: text})).min(1),
  last_verified_at: day, verification: z.enum(['verified','needs_review']), review_notes: z.array(text),
  publication_status: z.enum(['public','withheld']), web_work_slug: z.string().regex(/^[a-z0-9-]+$/).nullable(),
  sync: z.strictObject(Object.fromEntries(targets.map(t => [t, sync]))),
}).superRefine((v,c) => {
  const issue = message => c.addIssue({code:'custom',message});
  if (!v.contributors.some(p => p.person_id === 'hiroki-uematsu')) issue('Target researcher must be identified');
  if (v.contributors.some(p => p.person_id && /daiki/i.test(p.name.en ?? ''))) issue('Daiki is not the target researcher');
  if (v.researchmap_category && !mapping[v.kind].includes(v.researchmap_category)) issue('Researchmap category incompatible with record kind');
  if (!v.researchmap_category && v.sync.researchmap.status === 'synced') issue('Researchmap category required for synced');
  if (v.verification === 'needs_review' && !v.review_notes.length) issue('Review notes required');
  if (v.verification === 'verified' && v.review_notes.length) issue('Unresolved review notes prevent verification');
  if (v.verification === 'verified' && ['publications','presentations'].includes(v.kind) && !v.date) issue('Publication/presentation date required for verification');
  if (v.peer_review_scope === 'abstract' || v.peer_review_scope === 'full_text') {
    if (v.peer_reviewed !== 'yes') issue('Reviewed scope requires peer_reviewed=yes');
  }
  if (v.peer_review_scope === 'none' && v.peer_reviewed !== 'no') issue('No review scope requires peer_reviewed=no');
  if (v.peer_review_scope === 'not_applicable' && v.peer_reviewed !== 'not_applicable') issue('Non-applicable review scope requires matching review status');
  if (v.ongoing && v.end_date) issue('Ongoing record cannot have end date');
  if (v.date && v.end_date && v.date > v.end_date && !v.date.startsWith(v.end_date)) issue('End date precedes start date');
});
export const ledgerSchema = z.strictObject({schema_version: z.literal(1), records: z.array(recordSchema)});
