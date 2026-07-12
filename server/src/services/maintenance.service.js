/**
 * Maintenance Service — Phase 6
 * Handles: create request, approve, reject, assign, in-progress, resolve, close.
 * Automatically updates asset lifecycle status.
 */
import { and, eq, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { maintenance, assets, users } from '../db/schema/index.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}
const badRequest = (m) => httpError(400, m);
const notFound = (m) => httpError(404, m);


const VALID_TRANSITIONS = {
  pending:   ['approved', 'rejected'],
  approved:  ['assigned'],
  rejected:  [],
  assigned:  ['in_progress'],
  in_progress: ['resolved'],
  resolved:  ['closed'],
  closed:    [],
};

async function getMaintenanceOrThrow(db, id) {
  const [row] = await db.select().from(maintenance).where(eq(maintenance.id, id));
  if (!row) throw notFound('Maintenance ticket not found.');
  return row;
}

async function getAssetOrThrow(db, assetId) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
  if (!asset) throw notFound('Asset not found.');
  return asset;
}

async function getUserOrThrow(db, userId) {
  const [user] = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.id, userId));
  if (!user) throw notFound('User not found.');
  return user;
}

function ensureValidTransition(current, next) {
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw badRequest(`Cannot transition from "${current}" to "${next}".`);
  }
}

// ── List & Get ───────────────────────────────────────────────────────────────

export async function listMaintenance({ assetId, status, priority, requestedById, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (assetId) conditions.push(eq(maintenance.assetId, assetId));
  if (status) conditions.push(eq(maintenance.status, status));
  if (priority) conditions.push(eq(maintenance.priority, priority));
  if (requestedById) conditions.push(eq(maintenance.requestedById, requestedById));

  const query = db.select().from(maintenance);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(maintenance.createdAt)).limit(limit).offset(offset);
}

export async function getMaintenanceById(id) {
  const db = getDb();
  return getMaintenanceOrThrow(db, id);
}

// ── Create Request ───────────────────────────────────────────────────────────

export async function createMaintenanceRequest(payload = {}, requestedById) {
  const db = getDb();
  const { assetId, description, priority, issueType, photoUrl } = payload;

  if (!assetId) throw badRequest('assetId is required.');
  if (!description || !description.trim()) throw badRequest('Description is required.');

  await getAssetOrThrow(db, assetId);
  await getUserOrThrow(db, requestedById);

  const [row] = await db.insert(maintenance).values({
    assetId,
    requestedById,
    description: description.trim(),
    priority: priority || 'medium',
    issueType: issueType?.trim() || null,
    photoUrl: photoUrl || null,
    status: 'pending',
  }).returning();

  return row;
}

// ── Workflow Actions ─────────────────────────────────────────────────────────

export async function approveMaintenance(id) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'approved');

  const [updated] = await db.update(maintenance)
    .set({ status: 'approved', updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  // Asset goes under maintenance
  await db.update(assets).set({ status: 'under_maintenance', updatedAt: new Date() }).where(eq(assets.id, row.assetId));

  return updated;
}

export async function rejectMaintenance(id, reason) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'rejected');

  const [updated] = await db.update(maintenance)
    .set({ status: 'rejected', completionNotes: reason?.trim() || null, updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  return updated;
}

export async function assignTechnician(id, technicianId) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'assigned');

  await getUserOrThrow(db, technicianId);

  const [updated] = await db.update(maintenance)
    .set({ assignedTechnicianId: technicianId, status: 'assigned', updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  return updated;
}

export async function startProgress(id) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'in_progress');

  const [updated] = await db.update(maintenance)
    .set({ status: 'in_progress', updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  return updated;
}

export async function resolveMaintenance(id, completionNotes) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'resolved');

  const [updated] = await db.update(maintenance)
    .set({ status: 'resolved', completionNotes: completionNotes?.trim() || null, updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  return updated;
}

export async function closeMaintenance(id) {
  const db = getDb();
  const row = await getMaintenanceOrThrow(db, id);
  ensureValidTransition(row.status, 'closed');

  const [updated] = await db.update(maintenance)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(eq(maintenance.id, id))
    .returning();

  // Restore asset to available
  await db.update(assets).set({ status: 'available', updatedAt: new Date() }).where(eq(assets.id, row.assetId));

  return updated;
}

// ── History ──────────────────────────────────────────────────────────────────

export async function getMaintenanceHistory(assetId, { limit = 50, offset = 0 } = {}) {
  const db = getDb();
  if (!assetId) throw badRequest('assetId is required.');

  return db.select()
    .from(maintenance)
    .where(eq(maintenance.assetId, assetId))
    .orderBy(desc(maintenance.createdAt))
    .limit(limit)
    .offset(offset);
}
