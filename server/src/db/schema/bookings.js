import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assets } from './assets.js';
import { users } from './users.js';

export const bookingStatusEnum = pgEnum('booking_status', ['upcoming', 'ongoing', 'completed', 'cancelled']);

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  resourceId: uuid('resource_id').references(() => assets.id).notNull(),
  bookedById: uuid('booked_by_id').references(() => users.id).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').default('upcoming').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
