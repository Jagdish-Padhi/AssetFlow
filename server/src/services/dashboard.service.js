/**
 * Dashboard Service — Phase 8
 * Provides: KPIs, chart data, analytics, reports, CSV export.
 */
import { count, eq, and, lt, gte, desc, asc, ne } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import {
  assets, allocations, maintenance, bookings, transferRequests,
  departments, categories, audits, auditItems, users, activityLogs,
} from '../db/schema/index.js';

// ── KPIs ─────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = getDb();
  const now = new Date();

  const [availRes] = await db.select({ count: count() }).from(assets).where(eq(assets.status, 'available'));
  const [allocRes] = await db.select({ count: count() }).from(assets).where(eq(assets.status, 'allocated'));
  const [maintRes] = await db.select({ count: count() }).from(maintenance).where(eq(maintenance.status, 'pending'));
  const [bookingsRes] = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, 'upcoming'));
  const [transfersRes] = await db.select({ count: count() }).from(transferRequests).where(eq(transferRequests.status, 'pending'));
  const [upcomingRes] = await db.select({ count: count() }).from(allocations).where(and(eq(allocations.status, 'active'), gte(allocations.expectedReturnDate, now)));
  const [overdueRes] = await db.select({ count: count() }).from(allocations).where(and(eq(allocations.status, 'active'), lt(allocations.expectedReturnDate, now)));
  const [totalAssets] = await db.select({ count: count() }).from(assets);
  const [totalEmployees] = await db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

  return {
    assetsAvailable: Number(availRes?.count || 0),
    assetsAllocated: Number(allocRes?.count || 0),
    maintenancePending: Number(maintRes?.count || 0),
    activeBookings: Number(bookingsRes?.count || 0),
    pendingTransfers: Number(transfersRes?.count || 0),
    upcomingReturns: Number(upcomingRes?.count || 0),
    overdueReturns: Number(overdueRes?.count || 0),
    totalAssets: Number(totalAssets?.count || 0),
    totalEmployees: Number(totalEmployees?.count || 0),
  };
}

// ── Asset Status Distribution (Pie chart) ────────────────────────────────────

export async function getAssetStatusDistribution() {
  const db = getDb();
  const rows = await db.select({
    status: assets.status,
    count: count(),
  }).from(assets).groupBy(assets.status);

  return rows.map(r => ({ status: r.status, count: Number(r.count) }));
}

// ── Asset Category Distribution (Pie/Bar chart) ──────────────────────────────

export async function getCategoryDistribution() {
  const db = getDb();
  const rows = await db.select({
    category: categories.name,
    count: count(),
  }).from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .groupBy(categories.name);

  return rows.map(r => ({ category: r.category || 'Uncategorized', count: Number(r.count) }));
}

// ── Department Asset Distribution (Bar chart) ────────────────────────────────

export async function getDepartmentDistribution() {
  const db = getDb();
  const rows = await db.select({
    department: departments.name,
    count: count(),
  }).from(assets)
    .leftJoin(departments, eq(assets.departmentId, departments.id))
    .groupBy(departments.name);

  return rows.map(r => ({ department: r.department || 'Unassigned', count: Number(r.count) }));
}

// ── Maintenance Status Distribution ───────────────────────────────────────────

export async function getMaintenanceStatusDistribution() {
  const db = getDb();
  const rows = await db.select({
    status: maintenance.status,
    count: count(),
  }).from(maintenance).groupBy(maintenance.status);

  return rows.map(r => ({ status: r.status, count: Number(r.count) }));
}

// ── Booking Status Distribution ───────────────────────────────────────────────

export async function getBookingStatusDistribution() {
  const db = getDb();
  const rows = await db.select({
    status: bookings.status,
    count: count(),
  }).from(bookings).groupBy(bookings.status);

  return rows.map(r => ({ status: r.status, count: Number(r.count) }));
}

// ── Recent Activity (from activity_logs) ─────────────────────────────────────

export async function getRecentActivity({ limit = 10 } = {}) {
  const db = getDb();
  const rows = await db.select().from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

  return rows;
}

// ── Audit Summary ────────────────────────────────────────────────────────────

export async function getAuditSummary() {
  const db = getDb();
  const [openRes] = await db.select({ count: count() }).from(audits).where(eq(audits.status, 'open'));
  const [closedRes] = await db.select({ count: count() }).from(audits).where(eq(audits.status, 'closed'));
  const [verifiedRes] = await db.select({ count: count() }).from(auditItems).where(eq(auditItems.status, 'verified'));
  const [missingRes] = await db.select({ count: count() }).from(auditItems).where(eq(auditItems.status, 'missing'));
  const [damagedRes] = await db.select({ count: count() }).from(auditItems).where(eq(auditItems.status, 'damaged'));

  return {
    openAudits: Number(openRes?.count || 0),
    closedAudits: Number(closedRes?.count || 0),
    verifiedItems: Number(verifiedRes?.count || 0),
    missingItems: Number(missingRes?.count || 0),
    damagedItems: Number(damagedRes?.count || 0),
  };
}

// ── Utilization Rate ─────────────────────────────────────────────────────────

export async function getUtilizationRate() {
  const db = getDb();
  const [totalRes] = await db.select({ count: count() }).from(assets).where(ne(assets.status, 'retired'));
  const [allocatedRes] = await db.select({ count: count() }).from(assets).where(eq(assets.status, 'allocated'));
  const total = Number(totalRes?.count || 0);
  const allocated = Number(allocatedRes?.count || 0);
  return { total, allocated, utilizationRate: total > 0 ? Math.round((allocated / total) * 100) : 0 };
}

// ── Idle Assets (available, never allocated) ─────────────────────────────────

export async function getIdleAssets() {
  const db = getDb();
  const rows = await db.select({
    id: assets.id,
    name: assets.name,
    assetTag: assets.assetTag,
    status: assets.status,
    createdAt: assets.createdAt,
  }).from(assets)
    .where(eq(assets.status, 'available'))
    .orderBy(asc(assets.createdAt))
    .limit(20);

  return rows;
}

// ── Asset Lifecycle (status counts) ──────────────────────────────────────────

export async function getAssetLifecycle() {
  const db = getDb();
  const rows = await db.select({
    status: assets.status,
    count: count(),
  }).from(assets).groupBy(assets.status);

  const lifecycle = {};
  rows.forEach(r => { lifecycle[r.status] = Number(r.count); });
  return lifecycle;
}

// ── CSV Export Helper ────────────────────────────────────────────────────────

export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
  }
  return lines.join('\n');
}
