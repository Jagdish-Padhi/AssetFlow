import { boolean, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { categories } from './categories.js';
import { departments } from './departments.js';

export const assetStatusEnum = pgEnum('asset_status', ['available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed']);

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  assetTag: text('asset_tag').unique().notNull(),
  serialNumber: text('serial_number'),
  acquisitionDate: timestamp('acquisition_date', { withTimezone: true }),
  acquisitionCost: numeric('acquisition_cost'),
  condition: text('condition'),
  currentLocation: text('current_location'),
  departmentId: uuid('department_id').references(() => departments.id),
  photoUrl: text('photo_url'),
  documentUrl: text('document_url'),
  qrCode: text('qr_code'),
  isBookable: boolean('is_bookable').default(false).notNull(),
  status: assetStatusEnum('status').default('available').notNull(),
  customFields: jsonb('custom_fields'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
