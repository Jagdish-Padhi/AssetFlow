import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { bookingResources } from './bookingResources.js';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
  'rejected',
  'expired',
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  resourceId: uuid('resource_id')
    .notNull()
    .references(() => bookingResources.id, { onDelete: 'cascade' }),
  bookedByUserId: uuid('booked_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  notes: text('notes'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').default('upcoming').notNull(),
  recurringGroupId: uuid('recurring_group_id'),
  cancelReason: text('cancel_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  approvedByUserId: uuid('approved_by_user_id').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
