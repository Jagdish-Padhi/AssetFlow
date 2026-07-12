/**
 * AppRoutes — all dashboard routes registered here.
 * Private routes (behind PrivateRoute) require a valid JWT session.
 * Unknown paths stay inside /dashboard layout instead of redirecting to landing.
 */
import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import DashboardLayout      from '../components/layout/DashboardLayout.jsx';
import GlobalLoader         from '../components/loaders/GlobalLoader.jsx';

import LandingPage          from '../pages/landing/LandingPage.jsx';
import LoginPage            from '../pages/auth/LoginPage.jsx';
import RegisterPage         from '../pages/auth/RegisterPage.jsx';

import DashboardHomePage    from '../pages/dashboard/DashboardHomePage.jsx';
import AssetsPage           from '../pages/dashboard/AssetsPage.jsx';
import AllocationsPage      from '../pages/dashboard/AllocationsPage.jsx';
import BookingsPage         from '../pages/dashboard/BookingsPage.jsx';
import MaintenancePage      from '../pages/dashboard/MaintenancePage.jsx';
import AuditsPage           from '../pages/dashboard/AuditsPage.jsx';
import DepartmentsPage      from '../pages/dashboard/DepartmentsPage.jsx';
import CategoriesPage       from '../pages/dashboard/CategoriesPage.jsx';
import NotificationsPage    from '../pages/dashboard/NotificationsPage.jsx';
import EmployeesPage        from '../pages/dashboard/EmployeesPage.jsx';
import ReportsPage          from '../pages/dashboard/ReportsPage.jsx';
import BookingResourcesPage from '../pages/dashboard/BookingResourcesPage.jsx';
import BookingCalendarPage from '../pages/dashboard/BookingCalendarPage.jsx';
import MyBookingsPage from '../pages/dashboard/MyBookingsPage.jsx';


import useAuthStore from '../store/auth.store.js';

function PrivateRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRoles, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function AppRoutes() {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isTransitioning = useAuthStore((s) => s.isTransitioning);
  const isExiting = useAuthStore((s) => s.isExiting);
  const transitionShowTagline = useAuthStore((s) => s.transitionShowTagline);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);
  const setExiting = useAuthStore((s) => s.setExiting);

  useEffect(() => {
    if (isTransitioning && !isExiting) {
      const t1 = setTimeout(() => {
        setExiting(true);
        setTimeout(() => setTransitioning(false), 600);
      }, 300);
      return () => clearTimeout(t1);
    }
  }, [location.pathname, isTransitioning, isExiting]);

  if (!hydrated) return <GlobalLoader showTagline={false} />;

  return (
    <>
      {(isTransitioning || isExiting) && (
        <GlobalLoader showTagline={transitionShowTagline} isExiting={isExiting} />
      )}
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — all /dashboard/* routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"             element={<DashboardHomePage />} />
            <Route path="/dashboard/assets"      element={<AssetsPage />} />
            <Route path="/dashboard/allocations" element={<AllocationsPage />} />
            <Route path="/dashboard/bookings"    element={<BookingsPage />} />
            <Route path="/dashboard/maintenance" element={<MaintenancePage />} />
            <Route path="/dashboard/audits"      element={<RoleRoute allowedRoles={['technician', 'asset_manager', 'admin']}><AuditsPage /></RoleRoute>} />
            <Route path="/dashboard/departments" element={<RoleRoute allowedRoles={['asset_manager', 'admin']}><DepartmentsPage /></RoleRoute>} />
            <Route path="/dashboard/categories"  element={<RoleRoute allowedRoles={['asset_manager', 'admin']}><CategoriesPage /></RoleRoute>} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/employees" element={<RoleRoute allowedRoles={['department_head', 'asset_manager', 'admin']}><EmployeesPage /></RoleRoute>} />
            <Route path="/dashboard/reports" element={<RoleRoute allowedRoles={['asset_manager', 'admin']}><ReportsPage /></RoleRoute>} />
            {/* Unknown dashboard sub-paths → overview */}
            <Route path="/dashboard/*"           element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Any other unknown path → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
