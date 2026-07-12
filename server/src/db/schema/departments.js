import { AnyPgColumn, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const departmentStatusEnum = pgEnum('department_status', ['active', 'inactive']);

export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  headId: uuid('head_id').references(() => users.id),
  parentId: uuid('parent_id').references((): AnyPgColumn => departments.id),
  status: departmentStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
