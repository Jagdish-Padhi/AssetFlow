import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { activityLogs, users } from '../db/schema/index.js';

export async function logActivity({ userId, action, entityType, entityId, details = null }) {
  const db = getDb();
  console.log(`[Activity] User ${userId || 'SYSTEM'} performed ${action} on ${entityType} ${entityId || ''}`);
  const [log] = await db.insert(activityLogs).values({
    userId: userId || null,
    action,
    entityType,
    entityId: entityId || null,
    details: details || null,
  }).returning();
  return log;
}

export async function listActivityLogs({ limit = 50, offset = 0 } = {}) {
  const db = getDb();
  return db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);
}
