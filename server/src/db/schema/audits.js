import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { departments } from './departments.js';

export const auditStatusEnum = pgEnum('audit_status', ['open', 'closed']);

export const audits = pgTable('audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  departmentScopeId: uuid('department_scope_id').references(() => departments.id),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  status: auditStatusEnum('status').default('open').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
