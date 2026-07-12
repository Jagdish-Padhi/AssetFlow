/**
 * Allocation Service — Phase 4
 * Handles: allocate, return, overdue detection, transfer requests.
 * Conflict engine prevents double-allocation and invalid-state assignments.
 */
import { and, eq, lt, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { allocations, assets, transferRequests, users } from '../db/schema/index.js';

// ── Conflict Engine ───────────────────────────────────────────────────────────

const UNALLOCATABLE_STATUSES = ['allocated', 'under_maintenance', 'lost', 'retired', 'disposed'];

async function ensureAssetAllocatable(db, assetId) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
  if (!asset) { const e = new Error('Asset not found.'); e.statusCode = 404; throw e; }

  if (UNALLOCATABLE_STATUSES.includes(asset.status)) {
    const e = new Error(`Asset is currently "${asset.status}" and cannot be allocated.`);
    e.statusCode = 409;
    throw e;
  }
  return asset;
}

// ── Allocation ────────────────────────────────────────────────────────────────

export async function listAllocations({ assetId, userId, status, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (assetId) conditions.push(eq(allocations.assetId, assetId));
  if (userId) conditions.push(eq(allocations.assignedToId, userId));
  if (status) conditions.push(eq(allocations.status, status));

  const query = db
    .select({
      id: allocations.id,
      assetId: allocations.assetId,
      assignedToId: allocations.assignedToId,
      departmentId: allocations.departmentId,
      expectedReturnDate: allocations.expectedReturnDate,
      status: allocations.status,
      notes: allocations.notes,
      createdAt: allocations.createdAt,
      assetName: assets.name,
      assetTag: assets.assetTag,
      employeeName: users.name,
    })
    .from(allocations)
    .leftJoin(assets, eq(allocations.assetId, assets.id))
    .leftJoin(users, eq(allocations.assignedToId, users.id));

  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(allocations.createdAt)).limit(limit).offset(offset);
}

export async function getAllocationById(id) {
  const db = getDb();
  const [row] = await db.select().from(allocations).where(eq(allocations.id, id));
  if (!row) { const e = new Error('Allocation not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function allocateAsset(payload = {}) {
  const db = getDb();
  const { assetId, assignedToId, departmentId, expectedReturnDate, notes } = payload;

  if (!assetId || !assignedToId) {
    const e = new Error('assetId and assignedToId are required.'); e.statusCode = 400; throw e;
  }

  // Conflict check
  await ensureAssetAllocatable(db, assetId);

  // Verify assignee exists
  const [assignee] = await db.select({ id: users.id }).from(users).where(eq(users.id, assignedToId));
  if (!assignee) { const e = new Error('Assignee not found.'); e.statusCode = 404; throw e; }

  const [allocation] = await db.insert(allocations).values({
    assetId,
    assignedToId,
    departmentId: departmentId || null,
    expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
    notes: notes || null,
    status: 'active',
  }).returning();

  // Update asset status → allocated
  await db.update(assets).set({ status: 'allocated', updatedAt: new Date() }).where(eq(assets.id, assetId));

  return allocation;
}

export async function returnAsset(allocationId, payload = {}) {
  const db = getDb();
  const allocation = await getAllocationById(allocationId);

  if (allocation.status !== 'active' && allocation.status !== 'overdue') {
    const e = new Error('Only active or overdue allocations can be returned.'); e.statusCode = 400; throw e;
  }

  const { conditionOnReturn } = payload;

  await db.update(allocations).set({
    status: 'returned',
    conditionOnReturn: conditionOnReturn || null,
    updatedAt: new Date(),
  }).where(eq(allocations.id, allocationId));

  // Update asset status → available
  await db.update(assets).set({ status: 'available', updatedAt: new Date() }).where(eq(assets.id, allocation.assetId));

  return { returned: true, assetId: allocation.assetId };
}

export async function flagOverdueAllocations() {
  const db = getDb();
  const now = new Date();

  const result = await db.update(allocations)
    .set({ status: 'overdue', updatedAt: now })
    .where(and(
      eq(allocations.status, 'active'),
      lt(allocations.expectedReturnDate, now),
    ))
    .returning({ id: allocations.id });

  return { flagged: result.length };
}

// ── Transfer Requests ─────────────────────────────────────────────────────────

export async function listTransferRequests({ assetId, status, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (assetId) conditions.push(eq(transferRequests.assetId, assetId));
  if (status) conditions.push(eq(transferRequests.status, status));

  const query = db.select().from(transferRequests);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(transferRequests.createdAt)).limit(limit).offset(offset);
}

export async function createTransferRequest(payload = {}, requestedById) {
  const db = getDb();
  const { assetId, fromUserId, toUserId, notes } = payload;

  if (!assetId || !fromUserId || !toUserId) {
    const e = new Error('assetId, fromUserId, and toUserId are required.'); e.statusCode = 400; throw e;
  }

  // Asset must be currently allocated to validate fromUserId
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
  if (!asset) { const e = new Error('Asset not found.'); e.statusCode = 404; throw e; }
  if (asset.status !== 'allocated') {
    const e = new Error('Transfer requests can only be raised for currently allocated assets.'); e.statusCode = 409; throw e;
  }

  const [row] = await db.insert(transferRequests).values({
    assetId, fromUserId, toUserId,
    requestedById,
    notes: notes || null,
    status: 'pending',
  }).returning();
  return row;
}

export async function actionTransferRequest(transferId, action, actionedById) {
  const db = getDb();
  const [tr] = await db.select().from(transferRequests).where(eq(transferRequests.id, transferId));
  if (!tr) { const e = new Error('Transfer request not found.'); e.statusCode = 404; throw e; }
  if (tr.status !== 'pending') { const e = new Error('Transfer request is no longer pending.'); e.statusCode = 400; throw e; }

  if (!['approved', 'rejected'].includes(action)) {
    const e = new Error('Action must be "approved" or "rejected".'); e.statusCode = 400; throw e;
  }

  await db.update(transferRequests).set({
    status: action,
    actionedById,
    actionedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(transferRequests.id, transferId));

  // If approved: close old allocation + open new one
  if (action === 'approved') {
    // Mark old allocation returned
    const [oldAlloc] = await db.select().from(allocations).where(
      and(eq(allocations.assetId, tr.assetId), eq(allocations.status, 'active'))
    );
    if (oldAlloc) {
      await db.update(allocations).set({ status: 'returned', updatedAt: new Date() }).where(eq(allocations.id, oldAlloc.id));
    }

    // Open new allocation for toUserId
    await db.insert(allocations).values({
      assetId: tr.assetId,
      assignedToId: tr.toUserId,
      status: 'active',
      notes: `Transferred from transfer request ${transferId}`,
    });
  }

  return { action, transferId };
}
