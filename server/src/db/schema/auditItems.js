import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assets } from './assets.js';
import { audits } from './audits.js';
import { users } from './users.js';

export const auditItemStatusEnum = pgEnum('audit_item_status', ['verified', 'missing', 'damaged']);
export const auditDiscrepancyResolutionEnum = pgEnum('audit_discrepancy_resolution', ['pending', 'resolved', 'no_action']);

export const auditItems = pgTable('audit_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  auditId: uuid('audit_id').references(() => audits.id).notNull(),
  assetId: uuid('asset_id').references(() => assets.id).notNull(),
  auditorId: uuid('auditor_id').references(() => users.id).notNull(),
  status: auditItemStatusEnum('status').notNull(),
  remarks: text('remarks'),
  evidencePhotoUrl: text('evidence_photo_url'),
  resolutionStatus: auditDiscrepancyResolutionEnum('resolution_status').default('pending').notNull(),
  resolutionNotes: text('resolution_notes'),
  resolvedById: uuid('resolved_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
