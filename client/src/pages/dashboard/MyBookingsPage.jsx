import { useCallback, useEffect, useState } from 'react';
import { CalendarX2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Table from '../../components/Table.jsx';
import Tabs from '../../components/Tabs.jsx';
import Modal from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { bookingStatusMeta } from '../../utils/bookingStatus.js';
import { formatDateShort, formatTimeRange, toDateTimeLocalValue } from '../../utils/formatDate.js';

const ACTIVE_STATUSES = new Set(['pending', 'upcoming', 'ongoing']);

function BookingActions({ booking, onCancel, onReschedule }) {
  if (!ACTIVE_STATUSES.has(booking.status)) return <span className="text-xs text-(--app-color-text-muted)">—</span>;
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="secondary" onClick={() => onReschedule(booking)}>Reschedule</Button>
      <Button size="sm" variant="danger" onClick={() => onCancel(booking)}>Cancel</Button>
    </div>
  );
}

export default function MyBookingsPage() {
  const [myBookings, setMyBookings] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mineRes, pendingRes] = await Promise.all([
        api.get('/bookings', { params: { mine: true } }),
        api.get('/bookings', { params: { status: 'pending' } }),
      ]);
      setMyBookings(mineRes.data.items || []);
      setPending(pendingRes.data.items || []);
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCancel = async (booking) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${booking.id}/cancel`, {});
      toast.success('Booking cancelled.');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const openReschedule = (booking) => {
    setRescheduleTarget(booking);
    setRescheduleForm({ startTime: toDateTimeLocalValue(booking.startTime), endTime: toDateTimeLocalValue(booking.endTime) });
  };

  const submitReschedule = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${rescheduleTarget.id}/reschedule`, {
        startTime: new Date(rescheduleForm.startTime).toISOString(),
        endTime: new Date(rescheduleForm.endTime).toISOString(),
      });
      toast.success('Booking rescheduled.');
      setRescheduleTarget(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (booking) => {
    try {
      await api.post(`/bookings/${booking.id}/approve`);
      toast.success('Booking approved.');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async (booking) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    try {
      await api.post(`/bookings/${booking.id}/reject`, { reason });
      toast.success('Booking rejected.');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject booking.');
    }
  };

  const myColumns = [
    { key: 'title', label: 'Booking' },
    { key: 'startTime', label: 'When', render: (v, row) => (
      <div>
        <p>{formatDateShort(v)}</p>
        <p className="text-xs text-(--app-color-text-muted)">{formatTimeRange(row.startTime, row.endTime)}</p>
      </div>
    ) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={bookingStatusMeta(v).variant} size="sm">{bookingStatusMeta(v).label}</Badge> },
    { key: 'id', label: '', render: (_, row) => <BookingActions booking={row} onCancel={handleCancel} onReschedule={openReschedule} /> },
  ];

  const approvalColumns = [
    { key: 'title', label: 'Booking' },
    { key: 'startTime', label: 'When', render: (v, row) => (
      <div>
        <p>{formatDateShort(v)}</p>
        <p className="text-xs text-(--app-color-text-muted)">{formatTimeRange(row.startTime, row.endTime)}</p>
      </div>
    ) },
    { key: 'id', label: '', render: (_, row) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="success" onClick={() => handleApprove(row)}><Check className="h-4 w-4" /> Approve</Button>
        <Button size="sm" variant="danger" onClick={() => handleReject(row)}><X className="h-4 w-4" /> Reject</Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" subtitle="Bookings you've made, and any requests waiting on approval." />

      <Tabs
        tabs={[
          {
            label: 'My Bookings',
            content: myBookings.length === 0 && !loading ? (
              <EmptyState icon={CalendarX2} title="No bookings yet" message="Reserve a resource from the Book a Resource page." />
            ) : (
              <Table columns={myColumns} data={myBookings} isLoading={loading} emptyMessage="No bookings yet." />
            ),
          },
          {
            label: `Approvals${pending.length ? ` (${pending.length})` : ''}`,
            content: pending.length === 0 && !loading ? (
              <EmptyState title="Nothing to approve" message="Pending booking requests will show up here." />
            ) : (
              <Table columns={approvalColumns} data={pending} isLoading={loading} emptyMessage="No pending requests." />
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Booking"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button onClick={submitReschedule} loading={saving}>Save New Time</Button>
          </>
        )}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start" type="datetime-local" value={rescheduleForm.startTime} onChange={(e) => setRescheduleForm((f) => ({ ...f, startTime: e.target.value }))} />
          <Input label="End" type="datetime-local" value={rescheduleForm.endTime} onChange={(e) => setRescheduleForm((f) => ({ ...f, endTime: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
