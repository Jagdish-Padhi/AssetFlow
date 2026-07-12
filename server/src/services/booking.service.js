import crypto from 'node:crypto';
import { and, asc, eq, gt, gte, inArray, isNull, lt, lte, ne } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { bookingResources, bookings } from '../db/schema/index.js';
import { getBookingResourceById } from './bookingResource.service.js';

const ACTIVE_STATUSES = ['pending', 'upcoming', 'ongoing'];
const TERMINAL_STATUSES = ['cancelled', 'rejected', 'completed', 'expired'];
const MAX_RECURRING_OCCURRENCES = 52;

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}
const badRequest = (m) => httpError(400, m);
const forbidden = (m) => httpError(403, m);
const notFound = (m) => httpError(404, m);
const conflict = (m) => httpError(409, m);

function validateTimeRange(startTime, endTime) {
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw badRequest('Invalid start or end time.');
  }
  if (endTime <= startTime) {
    throw badRequest('End time must be after start time.');
  }
}

async function hasOverlap(db, { resourceId, startTime, endTime, excludeBookingId }) {
  const conditions = [
    eq(bookings.resourceId, resourceId),
    inArray(bookings.status, ACTIVE_STATUSES),
    lt(bookings.startTime, endTime),
    gt(bookings.endTime, startTime),
  ];
  if (excludeBookingId) conditions.push(ne(bookings.id, excludeBookingId));
  const rows = await db.select({ id: bookings.id }).from(bookings).where(and(...conditions)).limit(1);
  return rows.length > 0;
}

function deriveStatus(row, now) {
  if (TERMINAL_STATUSES.includes(row.status)) return row.status;
  if (row.status === 'pending') {
    return now >= row.startTime ? 'expired' : 'pending';
  }
  if (now >= row.endTime) return 'completed';
  if (now >= row.startTime) return 'ongoing';
  return 'upcoming';
}

async function recomputeAndPersist(db, rows) {
  const now = new Date();
  const out = [];
  for (const row of rows) {
    const nextStatus = deriveStatus(row, now);
    if (nextStatus !== row.status) {
      const [updated] = await db
        .update(bookings)
        .set({ status: nextStatus, updatedAt: now })
        .where(eq(bookings.id, row.id))
        .returning();
      out.push(updated);
    } else {
      out.push(row);
    }
  }
  return out;
}

async function getBookingRowOrThrow(db, bookingId) {
  const [row] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!row) throw notFound('Booking not found.');
  return row;
}

export async function listBookings({ resourceId, mineUserId, status, from, to } = {}) {
  const db = getDb();
  const conditions = [];
  if (resourceId) conditions.push(eq(bookings.resourceId, resourceId));
  if (mineUserId) conditions.push(eq(bookings.bookedByUserId, mineUserId));
  if (status) conditions.push(eq(bookings.status, status));
  if (from) conditions.push(gte(bookings.endTime, new Date(from)));
  if (to) conditions.push(lte(bookings.startTime, new Date(to)));

  const query = db.select().from(bookings);
  if (conditions.length) query.where(and(...conditions));
  const rows = await query.orderBy(asc(bookings.startTime));
  return recomputeAndPersist(db, rows);
}

export async function getBookingById(bookingId) {
  const db = getDb();
  const row = await getBookingRowOrThrow(db, bookingId);
  const [updated] = await recomputeAndPersist(db, [row]);
  return updated;
}

export async function listDueReminders({ userId, withinMinutes = 30 }) {
  const db = getDb();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + withinMinutes * 60 * 1000);

  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.bookedByUserId, userId),
        eq(bookings.status, 'upcoming'),
        gte(bookings.startTime, now),
        lte(bookings.startTime, windowEnd),
        isNull(bookings.reminderSentAt),
      ),
    );

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  await db.update(bookings).set({ reminderSentAt: now, updatedAt: now }).where(inArray(bookings.id, ids));
  return rows;
}

export async function createBooking({ userId, payload = {} }) {
  const db = getDb();

  if (!payload.resourceId) throw badRequest('resourceId is required.');
  if (!payload.title || !payload.title.trim()) throw badRequest('A title/purpose is required.');

  const resource = await getBookingResourceById(payload.resourceId);
  if (!resource.isActive) throw badRequest('This resource is not currently available for booking.');

  const startTime = new Date(payload.startTime);
  const endTime = new Date(payload.endTime);
  validateTimeRange(startTime, endTime);

  if (await hasOverlap(db, { resourceId: resource.id, startTime, endTime })) {
    throw conflict('This resource is already booked for an overlapping time slot.');
  }

  const [row] = await db
    .insert(bookings)
    .values({
      resourceId: resource.id,
      bookedByUserId: userId,
      title: payload.title.trim(),
      notes: payload.notes?.trim() || null,
      startTime,
      endTime,
      status: resource.requiresApproval ? 'pending' : 'upcoming',
    })
    .returning();

  return row;
}

export async function createRecurringBooking({ userId, payload = {} }) {
  const db = getDb();

  if (!payload.resourceId) throw badRequest('resourceId is required.');
  if (!payload.title || !payload.title.trim()) throw badRequest('A title/purpose is required.');

  const recurrence = payload.recurrence || {};
  if (!['daily', 'weekly'].includes(recurrence.frequency)) {
    throw badRequest('recurrence.frequency must be "daily" or "weekly".');
  }

  const resource = await getBookingResourceById(payload.resourceId);
  if (!resource.isActive) throw badRequest('This resource is not currently available for booking.');

  const firstStart = new Date(payload.startTime);
  const firstEnd = new Date(payload.endTime);
  validateTimeRange(firstStart, firstEnd);
  const durationMs = firstEnd.getTime() - firstStart.getTime();

  const occurrenceCap = recurrence.occurrences ? Math.min(Number(recurrence.occurrences), MAX_RECURRING_OCCURRENCES) : null;
  const until = recurrence.until ? new Date(recurrence.until) : null;
  if (until && Number.isNaN(until.getTime())) throw badRequest('Invalid recurrence.until date.');
  if (!occurrenceCap && !until) throw badRequest('Provide recurrence.occurrences or recurrence.until.');

  const stepMs = recurrence.frequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const recurringGroupId = crypto.randomUUID();

  const created = [];
  const skipped = [];
  let occStart = new Date(firstStart);

  for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i += 1) {
    if (occurrenceCap && i >= occurrenceCap) break;
    if (until && occStart > until) break;
    if (!occurrenceCap && !until) break;

    const occEnd = new Date(occStart.getTime() + durationMs);
    // eslint-disable-next-line no-await-in-loop
    const overlaps = await hasOverlap(db, { resourceId: resource.id, startTime: occStart, endTime: occEnd });

    if (overlaps) {
      skipped.push({ startTime: occStart.toISOString(), endTime: occEnd.toISOString(), reason: 'Overlaps an existing booking.' });
    } else {
      // eslint-disable-next-line no-await-in-loop
      const [row] = await db
        .insert(bookings)
        .values({
          resourceId: resource.id,
          bookedByUserId: userId,
          title: payload.title.trim(),
          notes: payload.notes?.trim() || null,
          startTime: occStart,
          endTime: occEnd,
          status: resource.requiresApproval ? 'pending' : 'upcoming',
          recurringGroupId,
        })
        .returning();
      created.push(row);
    }

    occStart = new Date(occStart.getTime() + stepMs);
  }

  if (created.length === 0) {
    throw conflict('Every occurrence in this recurring series overlaps an existing booking.');
  }

  return { created, skipped, recurringGroupId };
}

export async function cancelBooking({ bookingId, userId, reason }) {
  const db = getDb();
  const row = await getBookingRowOrThrow(db, bookingId);
  if (row.bookedByUserId !== userId) throw forbidden('You can only cancel your own bookings.');
  if (TERMINAL_STATUSES.includes(row.status)) throw badRequest(`Cannot cancel a booking that is already ${row.status}.`);

  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled', cancelReason: reason?.trim() || null, cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();
  return updated;
}

export async function rescheduleBooking({ bookingId, userId, startTime, endTime }) {
  const db = getDb();
  const row = await getBookingRowOrThrow(db, bookingId);
  if (row.bookedByUserId !== userId) throw forbidden('You can only reschedule your own bookings.');
  if (TERMINAL_STATUSES.includes(row.status)) throw badRequest(`Cannot reschedule a booking that is already ${row.status}.`);

  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);
  validateTimeRange(newStart, newEnd);

  if (await hasOverlap(db, { resourceId: row.resourceId, startTime: newStart, endTime: newEnd, excludeBookingId: bookingId })) {
    throw conflict('The new time slot overlaps an existing booking.');
  }

  const resource = await getBookingResourceById(row.resourceId);
  const nextStatus = resource.requiresApproval ? 'pending' : 'upcoming';

  const [updated] = await db
    .update(bookings)
    .set({
      startTime: newStart,
      endTime: newEnd,
      status: nextStatus,
      approvedByUserId: null,
      approvedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();
  return updated;
}

export async function approveBooking({ bookingId, approverUserId }) {
  const db = getDb();
  const row = await getBookingRowOrThrow(db, bookingId);
  if (row.status !== 'pending') throw badRequest(`Only pending bookings can be approved (this one is ${row.status}).`);

  const [updated] = await db
    .update(bookings)
    .set({ status: 'upcoming', approvedByUserId: approverUserId, approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();
  return updated;
}

export async function rejectBooking({ bookingId, approverUserId, reason }) {
  const db = getDb();
  const row = await getBookingRowOrThrow(db, bookingId);
  if (row.status !== 'pending') throw badRequest(`Only pending bookings can be rejected (this one is ${row.status}).`);

  const [updated] = await db
    .update(bookings)
    .set({
      status: 'rejected',
      approvedByUserId: approverUserId,
      approvedAt: new Date(),
      rejectionReason: reason?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();
  return updated;
}

export { bookingResources };
