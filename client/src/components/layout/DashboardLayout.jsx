import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Package, Users, Building2, Tag, Wrench, CalendarCheck, FileSearch, CalendarClock, ListChecks, Bell, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';
import { formatTimeRange } from '../../utils/formatDate.js';

const navigationItems = [
  { label: 'Overview',            path: '/dashboard',               icon: LayoutDashboard },
  { label: 'Assets',              path: '/dashboard/assets',        icon: Package },
  { label: 'Allocations',         path: '/dashboard/allocations',   icon: ListChecks },
  { label: 'Bookings',            path: '/dashboard/bookings',      icon: CalendarCheck },
  { label: 'Maintenance',         path: '/dashboard/maintenance',   icon: Wrench },
  { label: 'Audits',              path: '/dashboard/audits',        icon: FileSearch },
  { label: 'Reports & Analytics', path: '/dashboard/reports',       icon: BarChart3 },
  { label: 'Notifications',       path: '/dashboard/notifications', icon: Bell },
  { label: 'Employees',           path: '/dashboard/employees',     icon: Users },
  { label: 'Departments',         path: '/dashboard/departments',   icon: Building2 },
  { label: 'Categories',          path: '/dashboard/categories',    icon: Tag },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out.');
    navigate('/login');
  };

  useEffect(() => {
    let cancelled = false;
    async function checkReminders() {
      try {
        const res = await api.get('/bookings/reminders/due', { params: { withinMinutes: 30 } });
        if (cancelled) return;
        (res.data.items || []).forEach((booking) => {
          toast(`Starting soon: "${booking.title}" (${formatTimeRange(booking.startTime, booking.endTime)})`, { icon: '⏰' });
        });
      } catch { /* silent */ }
    }
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="flex min-h-screen print:block print:bg-white print:min-h-0" style={{ background: 'var(--app-gradient-shell)' }}>
      <aside className="print:hidden sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-(--app-color-border) bg-white/90 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 px-6 py-5 hover:opacity-80">
          <img src="/logo.png" alt="AssetFlow Logo" className="h-8 w-8 object-contain" />
          <span className="text-sm font-black uppercase tracking-widest text-(--app-color-text)">AssetFlow</span>
        </Link>

        {/* Role badge */}
        {user?.role && (
          <div className="mx-4 mb-2 rounded-lg bg-(--app-color-primary-soft) px-3 py-1.5 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-(--app-color-primary)">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {navigationItems.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-(--app-color-primary-soft) text-(--app-color-primary)'
                    : 'text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated) hover:text-(--app-color-text)'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-(--app-color-border) p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-color-primary-soft) text-xs font-black text-(--app-color-primary)">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-(--app-color-text)">{user?.name ?? 'User'}</p>
              <p className="truncate text-[10px] text-(--app-color-text-muted)">{user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-(--app-color-text-muted) hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
