import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assets } from './assets.js';
import { users } from './users.js';

export const maintenancePriorityEnum = pgEnum('maintenance_priority', ['low', 'medium', 'high']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['pending', 'approved', 'rejected', 'assigned', 'in_progress', 'resolved', 'closed']);

export const maintenance = pgTable('maintenance', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetId: uuid('asset_id').references(() => assets.id).notNull(),
  requestedById: uuid('requested_by_id').references(() => users.id).notNull(),
  assignedTechnicianId: uuid('assigned_technician_id').references(() => users.id),
  description: text('description').notNull(),
  priority: maintenancePriorityEnum('priority').default('medium').notNull(),
  issueType: text('issue_type'),
  status: maintenanceStatusEnum('status').default('pending').notNull(),
  completionNotes: text('completion_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
