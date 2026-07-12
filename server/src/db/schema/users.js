import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { departments } from './departments.js';

export const userRoleEnum = pgEnum('user_role', ['admin', 'asset_manager', 'department_head', 'technician', 'employee']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  refreshTokenHash: text('refresh_token_hash'),
  role: userRoleEnum('role').default('employee').notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  status: userStatusEnum('status').default('active').notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
