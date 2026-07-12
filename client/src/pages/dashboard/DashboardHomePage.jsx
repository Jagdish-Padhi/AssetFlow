import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Package, Users, Wrench, CalendarCheck, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
import StatCard from '../../components/StatCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import Button from '../../components/Button.jsx';
import api from '../../services/api.js';

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, ac] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity').catch(() => ({ data: { items: [] } })),
      ]);
      setStats(s.data.stats);
      setActivity(ac.data.items || []);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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

      {/* Primary KPI Stats */}
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

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[var(--app-color-text)]">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => navigate('/dashboard/assets')}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-[var(--app-color-border)] hover:border-[var(--app-color-primary)] hover:bg-slate-50 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-cyan-50 text-[var(--app-color-primary)] group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-semibold text-sm text-[var(--app-color-text)]">Register Asset</span>
            <span className="text-xs text-[var(--app-color-text-muted)]">Add a new physical asset to inventory</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-[var(--app-color-border)] hover:border-[var(--app-color-primary)] hover:bg-slate-50 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="font-semibold text-sm text-[var(--app-color-text)]">Book Resource</span>
            <span className="text-xs text-[var(--app-color-text-muted)]">Reserve a shared space or equipment</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/maintenance')}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-[var(--app-color-border)] hover:border-[var(--app-color-primary)] hover:bg-slate-50 transition-all text-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="font-semibold text-sm text-[var(--app-color-text)]">Request Maintenance</span>
            <span className="text-xs text-[var(--app-color-text-muted)]">Report a damaged asset needing repair</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-[var(--app-color-border)] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[var(--app-color-text)]">Recent Activity Log</h3>
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
        ) : activity.length === 0 ? (
          <p className="text-sm text-[var(--app-color-text-muted)] py-4 text-center">No recent activity logged.</p>
        ) : (
          <ul className="divide-y divide-[var(--app-color-border)]">
            {activity.slice(0, 5).map((item) => (
              <li key={item.id} className="py-3">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-[var(--app-color-text)]">{item.action}</p>
                  <span className="text-[10px] text-[var(--app-color-text-muted)]">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--app-color-text-muted)] capitalize">
                  Entity: {item.entityType} ({item.entityId?.slice(0, 8) || 'N/A'})
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
