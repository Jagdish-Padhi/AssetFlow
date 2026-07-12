import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Package, Users, Wrench, CalendarCheck, ArrowRightLeft, Clock, Download, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
import StatCard from '../../components/StatCard.jsx';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import api from '../../services/api.js';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const STATUS_LABELS = {
  available: 'Available', allocated: 'Allocated', reserved: 'Reserved',
  under_maintenance: 'Under Maintenance', lost: 'Lost', retired: 'Retired', disposed: 'Disposed',
};

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [assetStatus, setAssetStatus] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [maintStatus, setMaintStatus] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [activity, setActivity] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, as, cd, dd, ms, au, ut, ac] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts/assets-by-status'),
        api.get('/dashboard/charts/assets-by-category'),
        api.get('/dashboard/charts/assets-by-department'),
        api.get('/dashboard/charts/maintenance-status'),
        api.get('/dashboard/analytics/audit-summary'),
        api.get('/dashboard/analytics/utilization'),
        api.get('/dashboard/activity').catch(() => ({ data: { items: [] } })),
      ]);
      setStats(s.data.stats);
      setAssetStatus(as.data.data);
      setCategoryDist(cd.data.data);
      setDeptDist(dd.data.data);
      setMaintStatus(ms.data.data);
      setAuditSummary(au.data.data);
      setUtilization(ut.data.data);
      setActivity(ac.data.items || []);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/dashboard/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type} exported successfully.`);
    } catch {
      toast.error(`Failed to export ${type}.`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'User'} 👋`}
        subtitle="Here's a live snapshot of your organization's asset operations."
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleExport('assets')}><Download className="h-4 w-4" /> Assets CSV</Button>
            <Button size="sm" variant="secondary" onClick={() => handleExport('maintenance')}><Download className="h-4 w-4" /> Maintenance CSV</Button>
            <Button size="sm" variant="secondary" onClick={() => handleExport('bookings')}><Download className="h-4 w-4" /> Bookings CSV</Button>
          </div>
        }
      />

      {/* Overdue Alert */}
      {!loading && stats.overdueReturns > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm animate-pulse">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Critical: Overdue Returns Detected</h4>
            <p className="text-xs text-red-700">There are {stats.overdueReturns} active asset allocations past their expected return date.</p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="40%" height="2.25rem" className="mt-4" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Total Assets" value={String(stats.totalAssets || 0)} icon={Package} subtitle={`${stats.assetsAvailable} available`} />
            <StatCard label="Active Allocations" value={String(stats.assetsAllocated || 0)} icon={Users} subtitle={`${stats.upcomingReturns} upcoming returns`} />
            <StatCard label="Pending Maintenance" value={String(stats.maintenancePending || 0)} icon={Wrench} subtitle="requests awaiting action" />
            <StatCard label="Active Bookings" value={String(stats.activeBookings || 0)} icon={CalendarCheck} subtitle="scheduled resources" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Status Pie Chart */}
        <Card title="Assets by Status">
          {loading ? <Skeleton height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}>
                  {assetStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Category Distribution Bar */}
        <Card title="Assets by Category">
          {loading ? <Skeleton height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryDist}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--app-color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Distribution */}
        <Card title="Assets by Department">
          {loading ? <Skeleton height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptDist} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="department" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Maintenance Status */}
        <Card title="Maintenance Overview">
          {loading ? <Skeleton height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={maintStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                  {maintStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Bottom Row: Utilization + Audit + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Utilization */}
        <Card title="Utilization Rate">
          {loading ? <Skeleton height="120px" /> : utilization ? (
            <div className="text-center py-4">
              <p className="text-5xl font-black text-[var(--app-color-primary)]">{utilization.utilizationRate}%</p>
              <p className="text-sm text-[var(--app-color-text-muted)] mt-2">{utilization.allocated} of {utilization.total} assets in use</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div className="bg-[var(--app-color-primary)] h-3 rounded-full transition-all" style={{ width: `${utilization.utilizationRate}%` }} />
              </div>
            </div>
          ) : <p className="text-sm text-(--app-color-text-muted)">No data</p>}
        </Card>

        {/* Audit Summary */}
        <Card title="Audit Summary">
          {loading ? <Skeleton height="120px" /> : auditSummary ? (
            <div className="space-y-3 py-2">
              <div className="flex justify-between"><span className="text-sm text-(--app-color-text-muted)">Open Audits</span><Badge variant="success" size="sm">{auditSummary.openAudits}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-(--app-color-text-muted)">Closed Audits</span><Badge variant="outline" size="sm">{auditSummary.closedAudits}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-(--app-color-text-muted)">Verified Items</span><Badge variant="success" size="sm">{auditSummary.verifiedItems}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-(--app-color-text-muted)">Missing Items</span><Badge variant="danger" size="sm">{auditSummary.missingItems}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-(--app-color-text-muted)">Damaged Items</span><Badge variant="warning" size="sm">{auditSummary.damagedItems}</Badge></div>
            </div>
          ) : <p className="text-sm text-(--app-color-text-muted)">No audits yet</p>}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="2.5rem" />)}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-(--app-color-text-muted) py-4 text-center">No recent activity</p>
          ) : (
            <ul className="divide-y divide-[var(--app-color-border)] max-h-[280px] overflow-y-auto">
              {activity.map((item) => (
                <li key={item.id} className="py-2">
                  <p className="text-sm font-medium text-[var(--app-color-text)]">{item.action}</p>
                  <p className="text-xs text-[var(--app-color-text-muted)]">{item.entityType} • {new Date(item.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
