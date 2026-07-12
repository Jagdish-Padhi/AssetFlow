import { count, eq, and, lt, gte } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { assets, allocations, maintenance, bookings, transferRequests } from '../db/schema/index.js';

export async function getDashboardStats() {
  const db = getDb();
  const now = new Date();

  // 1. Assets Available
  const [availRes] = await db.select({ count: count() }).from(assets).where(eq(assets.status, 'available'));
  const assetsAvailable = Number(availRes?.count || 0);

  // 2. Assets Allocated
  const [allocRes] = await db.select({ count: count() }).from(assets).where(eq(assets.status, 'allocated'));
  const assetsAllocated = Number(allocRes?.count || 0);

  // 3. Maintenance Today (Pending / Active requests)
  const [maintRes] = await db.select({ count: count() }).from(maintenance).where(eq(maintenance.status, 'pending'));
  const maintenancePending = Number(maintRes?.count || 0);

  // 4. Active Bookings (Upcoming / Ongoing)
  const [bookingsRes] = await db
    .select({ count: count() })
    .from(bookings)
    .where(and(eq(bookings.status, 'upcoming')));
  const activeBookings = Number(bookingsRes?.count || 0);

  // 5. Pending Transfers
  const [transfersRes] = await db
    .select({ count: count() })
    .from(transferRequests)
    .where(eq(transferRequests.status, 'pending'));
  const pendingTransfers = Number(transfersRes?.count || 0);

  // 6. Upcoming Returns
  const [upcomingReturnsRes] = await db
    .select({ count: count() })
    .from(allocations)
    .where(
      and(
        eq(allocations.status, 'active'),
        gte(allocations.expectedReturnDate, now)
      )
    );
  const upcomingReturns = Number(upcomingReturnsRes?.count || 0);

  // 7. Overdue Returns (Expected date in past)
  const [overdueReturnsRes] = await db
    .select({ count: count() })
    .from(allocations)
    .where(
      and(
        eq(allocations.status, 'active'),
        lt(allocations.expectedReturnDate, now)
      )
    );
  const overdueReturns = Number(overdueReturnsRes?.count || 0);

  return {
    assetsAvailable,
    assetsAllocated,
    maintenancePending,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
  };
}
