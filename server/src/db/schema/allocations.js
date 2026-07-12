import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assets } from './assets.js';
import { departments } from './departments.js';
import { users } from './users.js';

export const allocationStatusEnum = pgEnum('allocation_status', ['active', 'returned', 'overdue']);

export const allocations = pgTable('allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetId: uuid('asset_id').references(() => assets.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  expectedReturnDate: timestamp('expected_return_date', { withTimezone: true }),
  notes: text('notes'),
  status: allocationStatusEnum('status').default('active').notNull(),
  conditionOnReturn: text('condition_on_return'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
