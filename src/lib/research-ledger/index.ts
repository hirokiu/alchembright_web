import ledger from '../../../research-ledger/ledger.json';
import { publicData } from '../../../scripts/research-ledger/core.mjs';
import type { z } from 'zod';
import type { recordSchema } from '../../../scripts/research-ledger/schema.mjs';
export type LedgerRecord = z.infer<typeof recordSchema>;
export type PublicRecord = Omit<LedgerRecord, 'evidence' | 'last_verified_at' | 'verification' | 'review_notes' | 'sync' | 'publication_status'>;
/** Build-time/server import only. Never import the master directly into client scripts. */
export function getResearchActivities(kind?: LedgerRecord['kind']): PublicRecord[] {
  const records = publicData(ledger).records as PublicRecord[];
  return kind ? records.filter(record => record.kind === kind) : records;
}
export function getProjectActivities(projectId: string): PublicRecord[] {
  return getResearchActivities().filter(record => record.project_ids.includes(projectId));
}
