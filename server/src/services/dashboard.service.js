import { count, eq, and, lt } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { assets, allocations, maintenance } from '../db/schema/index.js';

export async function getDashboardStats() {
  const db = getDb();
  const now = new Date();

  // 1. Total Assets
  const [totalAssetsRes] = await db.select({ count: count() }).from(assets);
  const totalAssets = Number(totalAssetsRes?.count || 0);

  // 2. Active Allocations
  const [activeAllocationsRes] = await db
    .select({ count: count() })
    .from(allocations)
    .where(eq(allocations.status, 'active'));
  const activeAllocations = Number(activeAllocationsRes?.count || 0);

  // 3. Pending Maintenance
  const [pendingMaintenanceRes] = await db
    .select({ count: count() })
    .from(maintenance)
    .where(eq(maintenance.status, 'pending'));
  const pendingMaintenance = Number(pendingMaintenanceRes?.count || 0);

  // 4. Overdue Returns
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
    totalAssets,
    activeAllocations,
    pendingMaintenance,
    overdueReturns,
  };
}
