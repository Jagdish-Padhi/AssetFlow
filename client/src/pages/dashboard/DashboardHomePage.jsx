import { useState, useEffect } from 'react';
import useAuthStore from '../../store/auth.store.js';
import StatCard from '../../components/StatCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import api from '../../services/api.js';
import { ShieldAlert } from 'lucide-react';

const MOCK_ACTIVITY = [
  { id: 1, label: 'Laptop AST-MAC-001 allocated to Regular Employee', time: 'Just now', status: 'active' },
  { id: 2, label: 'Maintenance request raised for Delivery Van', time: '10 mins ago', status: 'pending' },
  { id: 3, label: 'Conference Room B booking confirmed', time: '1 hr ago', status: 'done' },
];

const STATUS_STYLES = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  done:    'bg-gray-100 text-gray-600',
};

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [activity] = useState(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenancePending: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    upcomingReturns: 0,
    overdueReturns: 0,
  });

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'User'} 👋`}
        subtitle="Here's a live snapshot of your organization's asset operations."
      />

      {/* Overdue Alert banner if overdue returns are greater than 0 */}
      {!loading && stats.overdueReturns > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm animate-pulse">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Critical: Overdue Returns Detected</h4>
            <p className="text-xs text-red-700">There are {stats.overdueReturns} active asset allocations that have passed their expected return date. Please check allocations to resolve them.</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="40%" height="2.25rem" className="mt-4" />
              <Skeleton width="80%" height="1rem" className="mt-4" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Assets Available" value={String(stats.assetsAvailable)} trend="+4" trendUp={true} trendLabel="ready to deploy" />
            <StatCard label="Assets Allocated" value={String(stats.assetsAllocated)} trend="+2" trendUp={true} trendLabel="in active use" />
            <StatCard label="Pending Maintenance" value={String(stats.maintenancePending)} trend="-1" trendUp={true} trendLabel="requests resolved" />
            <StatCard label="Active Bookings" value={String(stats.activeBookings)} trend="+5" trendUp={true} trendLabel="scheduled slots" />
            <StatCard label="Pending Transfers" value={String(stats.pendingTransfers)} trend="0" trendUp={true} trendLabel="no backlog" />
            <StatCard label="Upcoming Returns" value={String(stats.upcomingReturns)} trend="0" trendUp={true} trendLabel="returns pending" />
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[var(--app-color-text)]">Recent Activity</h3>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--app-color-border)] last:border-0">
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height="1.1rem" />
                  <Skeleton width="25%" height="0.8rem" />
                </div>
                <Skeleton width="60px" height="1.25rem" className="rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--app-color-border)]">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--app-color-text)]">{item.label}</p>
                  <p className="text-xs text-[var(--app-color-text-muted)]">{item.time}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[item.status] || STATUS_STYLES.done}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
