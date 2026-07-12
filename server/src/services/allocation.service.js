/**
 * Allocation Service — Phase 4
 * Handles: allocate, return, overdue detection, transfer requests.
 * Conflict engine prevents double-allocation and invalid-state assignments.
 */
import { and, eq, lt, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { allocations, assets, transferRequests, users } from '../db/schema/index.js';
import { sendNotification } from './notification.service.js';
import { logActivity } from './activityLog.service.js';

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
  const { assetId, assignedToId, departmentId, expectedReturnDate, notes, actionedByUserId } = payload;

  if (!assetId || !assignedToId) {
    const e = new Error('assetId and assignedToId are required.'); e.statusCode = 400; throw e;
  }

  // Conflict check
  const asset = await ensureAssetAllocatable(db, assetId);

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

  // Log activity
  await logActivity({
    userId: actionedByUserId,
    action: 'Asset Allocated',
    entityType: 'asset',
    entityId: assetId,
    details: { assignedToId, expectedReturnDate },
  });

  // Send Notification
  await sendNotification({
    userId: assignedToId,
    title: 'Asset Allocated To You',
    message: `You have been allocated the asset: "${asset.name}" (Tag: ${asset.assetTag}). Please review and keep it in good condition.`,
    type: 'assignment',
  });

  return allocation;
}

export async function returnAsset(allocationId, payload = {}) {
  const db = getDb();
  const allocation = await getAllocationById(allocationId);

  if (allocation.status !== 'active' && allocation.status !== 'overdue') {
    const e = new Error('Only active or overdue allocations can be returned.'); e.statusCode = 400; throw e;
  }

  const { conditionOnReturn, actionedByUserId } = payload;

  await db.update(allocations).set({
    status: 'returned',
    conditionOnReturn: conditionOnReturn || null,
    updatedAt: new Date(),
  }).where(eq(allocations.id, allocationId));

  // Update asset status → available, and update condition
  await db.update(assets).set({
    status: 'available',
    condition: conditionOnReturn || undefined,
    updatedAt: new Date(),
  }).where(eq(assets.id, allocation.assetId));

  const [asset] = await db.select({ name: assets.name, assetTag: assets.assetTag }).from(assets).where(eq(assets.id, allocation.assetId));

  // Log activity
  await logActivity({
    userId: actionedByUserId,
    action: 'Asset Returned',
    entityType: 'asset',
    entityId: allocation.assetId,
    details: { conditionOnReturn },
  });

  // Send Notification
  await sendNotification({
    userId: allocation.assignedToId,
    title: 'Asset Return Processed',
    message: `The return of your allocated asset "${asset?.name || 'Asset'}" (Tag: ${asset?.assetTag || ''}) has been processed successfully.`,
    type: 'return',
  });

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
    .returning({ id: allocations.id, assignedToId: allocations.assignedToId, assetId: allocations.assetId });

  // Send notifications for newly flagged overdue allocations
  for (const item of result) {
    const [asset] = await db.select({ name: assets.name, assetTag: assets.assetTag }).from(assets).where(eq(assets.id, item.assetId));
    await sendNotification({
      userId: item.assignedToId,
      title: 'Asset Allocation Overdue!',
      message: `Your allocation for "${asset?.name || 'Asset'}" (Tag: ${asset?.assetTag || ''}) is overdue. Please return it or contact your administrator.`,
      type: 'overdue',
    });
  }

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

  // Log activity
  await logActivity({
    userId: requestedById,
    action: 'Transfer Requested',
    entityType: 'asset',
    entityId: assetId,
    details: { fromUserId, toUserId },
  });

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

  const [asset] = await db.select({ name: assets.name, assetTag: assets.assetTag }).from(assets).where(eq(assets.id, tr.assetId));

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

    // Notify new holder
    await sendNotification({
      userId: tr.toUserId,
      title: 'Asset Transferred To You',
      message: `The asset "${asset?.name || 'Asset'}" (Tag: ${asset?.assetTag || ''}) has been transferred to your possession.`,
      type: 'assignment',
    });

    // Notify previous holder
    await sendNotification({
      userId: tr.fromUserId,
      title: 'Asset Transfer Confirmed',
      message: `Your asset "${asset?.name || 'Asset'}" (Tag: ${asset?.assetTag || ''}) has been successfully transferred to another colleague.`,
      type: 'return',
    });
  } else {
    // Notify requester about rejection
    await sendNotification({
      userId: tr.requestedById,
      title: 'Transfer Request Rejected',
      message: `Your transfer request for "${asset?.name || 'Asset'}" has been rejected.`,
      type: 'rejection',
    });
  }

  // Log activity
  await logActivity({
    userId: actionedById,
    action: `Transfer Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
    entityType: 'asset',
    entityId: tr.assetId,
    details: { transferId },
  });

  return { action, transferId };
}
