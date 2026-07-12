import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const resourceTypeEnum = pgEnum('resource_type', [
  'meeting_room',
  'projector',
  'vehicle',
  'equipment',
  'lab',
  'other',
]);

export const bookingResources = pgTable('booking_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: resourceTypeEnum('type').notNull().default('other'),
  location: text('location'),
  capacity: integer('capacity'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
