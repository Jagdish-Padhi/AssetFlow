/**
 * Category Service — Phase 2
 * Admin CRUD for asset categories with custom field schemas.
 */
import { and, eq, ilike, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { categories } from '../db/schema/index.js';

export async function listCategories({ search = '', limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(categories.name, `%${search}%`));

  const query = db.select().from(categories);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(categories.createdAt)).limit(limit).offset(offset);
}

export async function getCategoryById(id) {
  const db = getDb();
  const [row] = await db.select().from(categories).where(eq(categories.id, id));
  if (!row) { const e = new Error('Category not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function createCategory(payload = {}) {
  const db = getDb();
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name) { const e = new Error('Category name is required.'); e.statusCode = 400; throw e; }

  const [row] = await db.insert(categories).values({
    name,
    description: payload.description || null,
    customFieldsSchema: payload.customFieldsSchema || null,
  }).returning();
  return row;
}

export async function updateCategory(id, payload = {}) {
  const db = getDb();
  await getCategoryById(id);

  const updates = { updatedAt: new Date() };
  if (typeof payload.name === 'string') updates.name = payload.name.trim();
  if (typeof payload.description === 'string') updates.description = payload.description.trim();
  if (payload.customFieldsSchema !== undefined) updates.customFieldsSchema = payload.customFieldsSchema;

  const [updated] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
  return updated;
}

export async function deleteCategory(id) {
  const db = getDb();
  await getCategoryById(id);
  await db.delete(categories).where(eq(categories.id, id));
  return { deleted: true };
}
