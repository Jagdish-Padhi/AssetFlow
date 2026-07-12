import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assets } from './assets.js';
import { users } from './users.js';

export const transferStatusEnum = pgEnum('transfer_status', ['pending', 'approved', 'rejected']);

export const transferRequests = pgTable('transfer_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetId: uuid('asset_id').references(() => assets.id).notNull(),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toUserId: uuid('to_user_id').references(() => users.id).notNull(),
  requestedById: uuid('requested_by_id').references(() => users.id).notNull(),
  status: transferStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  actionedById: uuid('actioned_by_id').references(() => users.id),
  actionedAt: timestamp('actioned_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
