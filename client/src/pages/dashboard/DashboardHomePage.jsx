import { useState, useEffect } from 'react';
import useAuthStore from '../../store/auth.store.js';
import StatCard from '../../components/StatCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import api from '../../services/api.js';

// Placeholder activity — replace with /api/activity-logs when Phase 9 is built
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
  const [stats, setStats] = useState([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        const data = res.data.stats;
        setStats([
          { label: 'Total Assets', value: String(data.totalAssets), trend: '+14%', trendUp: true, trendLabel: 'this month' },
          { label: 'Active Allocations', value: String(data.activeAllocations), trend: '+8%', trendUp: true, trendLabel: 'this week' },
          { label: 'Pending Maintenance', value: String(data.pendingMaintenance), trend: '-25%', trendUp: true, trendLabel: 'cleared' },
          { label: 'Overdue Returns', value: String(data.overdueReturns), trend: data.overdueReturns > 0 ? 'critical' : '0%', trendUp: data.overdueReturns === 0, trendLabel: data.overdueReturns > 0 ? 'action required' : 'clear' },
        ]);
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

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="40%" height="2.25rem" className="mt-4" />
              <Skeleton width="80%" height="1rem" className="mt-4 animate-pulse" />
            </div>
          ))
        ) : (
          stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} trend={s.trend} trendUp={s.trendUp} trendLabel={s.trendLabel} />
          ))
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
