/**
 * Resource Service
 * Refactored to operate on the new `assets` table instead of the deleted `resourceItems` template table.
 */

import { and, eq, ilike, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { assets } from '../db/schema/index.js';

export async function listResources({ userId, search = '', limit = 20, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(assets.name, `%${search}%`));
  
  const query = db.select().from(assets);
  if (conditions.length > 0) {
    query.where(and(...conditions));
  }
  return query.orderBy(desc(assets.createdAt)).limit(limit).offset(offset);
}

export async function getResourceById({ userId, resourceId }) {
  const db = getDb();
  const [row] = await db.select().from(assets).where(eq(assets.id, resourceId));
  if (!row) { const e = new Error('Asset not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function createResource({ userId, payload = {} }) {
  const db = getDb();
  const name = typeof payload.name === 'string' ? payload.name.trim() : (payload.title || '').trim();
  if (!name) { const e = new Error('Name is required.'); e.statusCode = 400; throw e; }
  
  // Note: we generate a fallback assetTag to satisfy the non-null constraint
  const [row] = await db.insert(assets).values({
    name,
    assetTag: payload.assetTag || `AST-${Date.now()}`,
    status: payload.status || 'available',
    remarks: payload.description || payload.remarks || null,
  }).returning();
  return row;
}

export async function updateResource({ userId, resourceId, payload = {} }) {
  const db = getDb();
  await getResourceById({ userId, resourceId });
  const updates = { updatedAt: new Date() };
  if (typeof payload.name === 'string') updates.name = payload.name.trim();
  if (typeof payload.title === 'string') updates.name = payload.title.trim();
  if (typeof payload.description === 'string') updates.remarks = payload.description.trim();
  if (typeof payload.remarks === 'string') updates.remarks = payload.remarks.trim();
  if (typeof payload.status === 'string') updates.status = payload.status;
  
  const [updated] = await db.update(assets).set(updates).where(eq(assets.id, resourceId)).returning();
  return updated;
}

export async function deleteResource({ userId, resourceId }) {
  const db = getDb();
  await getResourceById({ userId, resourceId });
  await db.delete(assets).where(eq(assets.id, resourceId));
  return { deleted: true };
}
