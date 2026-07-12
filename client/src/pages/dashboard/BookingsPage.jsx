import PageHeader from '../../components/PageHeader.jsx';
import Tabs from '../../components/Tabs.jsx';
import BookingCalendarPage from './BookingCalendarPage.jsx';
import MyBookingsPage from './MyBookingsPage.jsx';
import BookingResourcesPage from './BookingResourcesPage.jsx';
import useAuthStore from '../../store/auth.store.js';

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';

  const tabs = [
    {
      label: 'Calendar / Book',
      content: <BookingCalendarPage hideHeader={true} />,
    },
    {
      label: 'My Bookings & Approvals',
      content: <MyBookingsPage hideHeader={true} />,
    },
  ];

  if (isAdminOrManager) {
    tabs.push({
      label: 'Manage Resources',
      content: <BookingResourcesPage hideHeader={true} />,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Bookings"
        subtitle="Reserve meeting rooms, vehicles, equipment, and shared resources."
      />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
