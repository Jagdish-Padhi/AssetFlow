import { CalendarCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Resource Bookings" subtitle="Reserve meeting rooms, vehicles, equipment and shared resources." />
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-10 text-center shadow-sm">
        <CalendarCheck className="mx-auto mb-4 h-12 w-12 text-(--app-color-primary) opacity-40" />
        <p className="text-sm text-(--app-color-text-muted)">Booking calendar coming soon — Phase 5 UI</p>
      </div>
    </div>
  );
}
