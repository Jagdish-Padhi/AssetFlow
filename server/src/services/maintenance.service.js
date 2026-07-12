import { and, eq, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { maintenance } from '../db/schema/index.js';

export async function listMaintenance({ assetId, status, priority, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (assetId) conditions.push(eq(maintenance.assetId, assetId));
  if (status)  conditions.push(eq(maintenance.status, status));
  if (priority) conditions.push(eq(maintenance.priority, priority));

  const query = db.select().from(maintenance);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(maintenance.createdAt)).limit(limit).offset(offset);
}
