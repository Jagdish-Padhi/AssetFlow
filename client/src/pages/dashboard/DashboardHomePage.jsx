import { useState } from 'react';
import useAuthStore from '../../store/auth.store.js';
import StatCard from '../../components/StatCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
// import api from '../../services/api.js'; // uncomment when wiring real API

// Placeholder stats — replace with /api/dashboard/stats when Phase 8 is built
const MOCK_STATS = [
  { label: 'Total Assets',      value: '—', change: '+0',  trend: 'up' },
  { label: 'Active Allocations',value: '—', change: '+0',  trend: 'up' },
  { label: 'Pending Maintenance',value: '—', change: '0',  trend: 'neutral' },
  { label: 'Overdue Returns',   value: '—', change: '-0',  trend: 'down' },
];

// Placeholder activity — replace with /api/activity-logs when Phase 9 is built
const MOCK_ACTIVITY = [
  { id: 1, label: 'Laptop AST-001 allocated to Ravi Kumar',        time: 'Just now',   status: 'active' },
  { id: 2, label: 'Maintenance request raised for Projector #3',   time: '10 mins ago', status: 'pending' },
  { id: 3, label: 'Conference Room B booking confirmed',            time: '1 hr ago',   status: 'done' },
];

const STATUS_STYLES = {
  active:  'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  done:    'bg-gray-100 text-gray-600',
};

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [stats] = useState(MOCK_STATS);
  const [activity] = useState(MOCK_ACTIVITY);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'User'} 👋`}
        subtitle="Here's a live snapshot of your organization's asset operations."
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} change={s.change} trend={s.trend} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-(--app-color-text)">Recent Activity</h3>
        <ul className="divide-y divide-(--app-color-border)">
          {activity.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-(--app-color-text)">{item.label}</p>
                <p className="text-xs text-(--app-color-text-muted)">{item.time}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[item.status] || STATUS_STYLES.done}`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
