/**
 * Asset Service — Phase 3
 * Full CRUD, lifecycle state machine, QR code generation.
 * State transition rules are enforced here — never in the controller.
 */
import { and, eq, ilike, inArray, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { assets } from '../db/schema/index.js';

// Valid state transitions — key = current status, value = allowed next statuses
const VALID_TRANSITIONS = {
  available:         ['allocated', 'reserved', 'under_maintenance', 'lost', 'retired'],
  allocated:         ['available', 'under_maintenance', 'lost'],
  reserved:          ['available', 'allocated'],
  under_maintenance: ['available', 'retired', 'disposed'],
  lost:              ['available', 'disposed'],
  retired:           ['disposed'],
  disposed:          [],
};

function generateAssetTag() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AST-${ts}-${rand}`;
}

export async function listAssets({ search, categoryId, departmentId, status, isBookable, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(assets.name, `%${search}%`));
  if (categoryId) conditions.push(eq(assets.categoryId, categoryId));
  if (departmentId) conditions.push(eq(assets.departmentId, departmentId));
  if (status) conditions.push(eq(assets.status, status));
  if (isBookable !== undefined) conditions.push(eq(assets.isBookable, isBookable === 'true' || isBookable === true));

  const query = db.select().from(assets);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(assets.createdAt)).limit(limit).offset(offset);
}

export async function getAssetById(id) {
  const db = getDb();
  const [row] = await db.select().from(assets).where(eq(assets.id, id));
  if (!row) { const e = new Error('Asset not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function getAssetByTag(tag) {
  const db = getDb();
  const [row] = await db.select().from(assets).where(eq(assets.assetTag, tag));
  if (!row) { const e = new Error('Asset not found by tag.'); e.statusCode = 404; throw e; }
  return row;
}

export async function createAsset(payload = {}) {
  const db = getDb();
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name) { const e = new Error('Asset name is required.'); e.statusCode = 400; throw e; }

  const assetTag = payload.assetTag?.trim() || generateAssetTag();

  // Ensure unique asset tag
  const [tagExists] = await db.select({ id: assets.id }).from(assets).where(eq(assets.assetTag, assetTag));
  if (tagExists) { const e = new Error(`Asset tag "${assetTag}" is already in use.`); e.statusCode = 409; throw e; }

  const [row] = await db.insert(assets).values({
    name,
    assetTag,
    categoryId: payload.categoryId || null,
    serialNumber: payload.serialNumber || null,
    acquisitionDate: payload.acquisitionDate ? new Date(payload.acquisitionDate) : null,
    acquisitionCost: payload.acquisitionCost || null,
    condition: payload.condition || null,
    currentLocation: payload.currentLocation || null,
    departmentId: payload.departmentId || null,
    photoUrl: payload.photoUrl || null,
    documentUrl: payload.documentUrl || null,
    isBookable: payload.isBookable === true || payload.isBookable === 'true',
    qrCode: assetTag, // QR points to asset tag for scanning
    customFields: payload.customFields || null,
    remarks: payload.remarks || null,
    status: 'available',
  }).returning();

  return row;
}

export async function updateAsset(id, payload = {}) {
  const db = getDb();
  await getAssetById(id);

  const updates = { updatedAt: new Date() };
  const fields = ['name', 'serialNumber', 'condition', 'currentLocation', 'remarks', 'photoUrl', 'documentUrl'];
  fields.forEach(f => { if (payload[f] !== undefined) updates[f] = payload[f]; });
  if (payload.categoryId !== undefined) updates.categoryId = payload.categoryId || null;
  if (payload.departmentId !== undefined) updates.departmentId = payload.departmentId || null;
  if (payload.isBookable !== undefined) updates.isBookable = payload.isBookable === true || payload.isBookable === 'true';
  if (payload.customFields !== undefined) updates.customFields = payload.customFields;
  if (payload.acquisitionDate !== undefined) updates.acquisitionDate = payload.acquisitionDate ? new Date(payload.acquisitionDate) : null;
  if (payload.acquisitionCost !== undefined) updates.acquisitionCost = payload.acquisitionCost;

  const [updated] = await db.update(assets).set(updates).where(eq(assets.id, id)).returning();
  return updated;
}

export async function updateAssetStatus(id, newStatus) {
  const db = getDb();
  const asset = await getAssetById(id);

  const allowed = VALID_TRANSITIONS[asset.status] || [];
  if (!allowed.includes(newStatus)) {
    const e = new Error(`Cannot transition from "${asset.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}.`);
    e.statusCode = 400;
    throw e;
  }

  const [updated] = await db.update(assets).set({ status: newStatus, updatedAt: new Date() }).where(eq(assets.id, id)).returning();
  return updated;
}

export async function deleteAsset(id) {
  const db = getDb();
  const asset = await getAssetById(id);

  if (asset.status === 'allocated') {
    const e = new Error('Cannot delete an allocated asset. Return it first.'); e.statusCode = 400; throw e;
  }

  await db.delete(assets).where(eq(assets.id, id));
  return { deleted: true };
}
