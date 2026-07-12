import { and, asc, eq, ilike } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { bookingResources } from '../db/schema/index.js';

const VALID_TYPES = ['meeting_room', 'projector', 'vehicle', 'equipment', 'lab', 'other'];

function notFound(message) {
  const e = new Error(message);
  e.statusCode = 404;
  return e;
}

export async function listBookingResources({ search = '', type = '', activeOnly = false } = {}) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(bookingResources.name, `%${search}%`));
  if (type && VALID_TYPES.includes(type)) conditions.push(eq(bookingResources.type, type));
  if (activeOnly) conditions.push(eq(bookingResources.isActive, true));

  const query = db.select().from(bookingResources);
  if (conditions.length) query.where(and(...conditions));
  return query.orderBy(asc(bookingResources.name));
}

export async function getBookingResourceById(resourceId) {
  const db = getDb();
  const [row] = await db.select().from(bookingResources).where(eq(bookingResources.id, resourceId));
  if (!row) throw notFound('Resource not found.');
  return row;
}

export async function createBookingResource({ userId, payload = {} }) {
  const db = getDb();
  const [row] = await db
    .insert(bookingResources)
    .values({
      name: payload.name.trim(),
      type: VALID_TYPES.includes(payload.type) ? payload.type : 'other',
      location: payload.location?.trim() || null,
      capacity: payload.capacity != null && payload.capacity !== '' ? Number(payload.capacity) : null,
      description: payload.description?.trim() || null,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      requiresApproval: Boolean(payload.requiresApproval),
      createdByUserId: userId,
    })
    .returning();
  return row;
}

export async function updateBookingResource({ resourceId, payload = {} }) {
  const db = getDb();
  await getBookingResourceById(resourceId);

  const updates = { updatedAt: new Date() };
  if (typeof payload.name === 'string') updates.name = payload.name.trim();
  if (typeof payload.type === 'string' && VALID_TYPES.includes(payload.type)) updates.type = payload.type;
  if (typeof payload.location === 'string') updates.location = payload.location.trim() || null;
  if (payload.capacity !== undefined) updates.capacity = payload.capacity === '' || payload.capacity === null ? null : Number(payload.capacity);
  if (typeof payload.description === 'string') updates.description = payload.description.trim() || null;
  if (payload.isActive !== undefined) updates.isActive = Boolean(payload.isActive);
  if (payload.requiresApproval !== undefined) updates.requiresApproval = Boolean(payload.requiresApproval);

  const [updated] = await db
    .update(bookingResources)
    .set(updates)
    .where(eq(bookingResources.id, resourceId))
    .returning();
  return updated;
}

export async function deactivateBookingResource(resourceId) {
  const db = getDb();
  await getBookingResourceById(resourceId);
  const [updated] = await db
    .update(bookingResources)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(bookingResources.id, resourceId))
    .returning();
  return updated;
}
