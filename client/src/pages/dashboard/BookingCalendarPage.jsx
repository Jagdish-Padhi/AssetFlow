import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import Input from '../../components/Input.jsx';
import TextArea from '../../components/TextArea.jsx';
import Modal from '../../components/Modal.jsx';
import Toggle from '../../components/Toggle.jsx';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Spinner from '../../components/Spinner.jsx';
import ResourceCalendar, { addDays, startOfMonth, startOfWeek } from '../../components/booking/ResourceCalendar.jsx';
import { bookingStatusMeta } from '../../utils/bookingStatus.js';
import { formatDateShort, formatTimeRange, toDateTimeLocalValue } from '../../utils/formatDate.js';

const EMPTY_FORM = {
  title: '',
  notes: '',
  startTime: '',
  endTime: '',
  recurring: false,
  frequency: 'weekly',
  occurrences: 4,
};

function rangeForView(viewMode, viewDate) {
  if (viewMode === 'day') return { from: viewDate, to: addDays(viewDate, 1) };
  if (viewMode === 'week') { const s = startOfWeek(viewDate); return { from: s, to: addDays(s, 7) }; }
  const s = startOfMonth(viewDate);
  return { from: addDays(s, -7), to: addDays(s, 42) };
}

export default function BookingCalendarPage() {
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState('');
  const [viewMode, setViewMode] = useState('week');
  const [viewDate, setViewDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [detailBooking, setDetailBooking] = useState(null);

  const selectedResource = useMemo(() => resources.find((r) => r.id === resourceId), [resources, resourceId]);

  const loadResources = useCallback(async () => {
    try {
      const res = await api.get('/booking-resources', { params: { activeOnly: true } });
      const list = res.data.items || [];
      setResources(list);
      if (list.length && !resourceId) setResourceId(list[0].id);
    } catch {
      toast.error('Failed to load resources.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const loadBookings = useCallback(async () => {
    if (!resourceId) { setBookings([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { from, to } = rangeForView(viewMode, viewDate);
      const res = await api.get('/bookings', { params: { resourceId, from: from.toISOString(), to: to.toISOString() } });
      setBookings(res.data.items || []);
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [resourceId, viewMode, viewDate]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleNavigate = (dir) => {
    setViewDate((d) => {
      if (viewMode === 'day') return addDays(d, dir);
      if (viewMode === 'week') return addDays(d, dir * 7);
      return new Date(d.getFullYear(), d.getMonth() + dir, 1);
    });
  };

  const openBookingModal = (day) => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    setFormData({ ...EMPTY_FORM, startTime: toDateTimeLocalValue(start), endTime: toDateTimeLocalValue(end) });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!resourceId) return toast.error('Choose a resource first.');
    if (!formData.title.trim()) return toast.error('A title/purpose is required.');
    if (!formData.startTime || !formData.endTime) return toast.error('Start and end time are required.');

    setSaving(true);
    try {
      const payload = {
        resourceId,
        title: formData.title.trim(),
        notes: formData.notes.trim() || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };
      if (formData.recurring) {
        payload.recurrence = { frequency: formData.frequency, occurrences: Number(formData.occurrences) };
        const res = await api.post('/bookings', payload);
        const { created, skipped } = res.data;
        toast.success(`Created ${created.length} booking${created.length === 1 ? '' : 's'}${skipped.length ? `, skipped ${skipped.length} (overlap)` : ''}.`);
      } else {
        await api.post('/bookings', payload);
        toast.success(selectedResource?.requiresApproval ? 'Booking requested — awaiting approval.' : 'Booking confirmed.');
      }
      setModalOpen(false);
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.post(`/bookings/${booking.id}/cancel`, {});
      toast.success('Booking cancelled.');
      setDetailBooking(null);
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Book a Resource" subtitle="Reserve meeting rooms, vehicles, equipment, and labs by time slot." />

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-(--app-color-border) bg-white p-4">
        <div className="min-w-[220px]">
          <Select
            label="Resource"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            options={resources.map((r) => ({ value: r.id, label: r.name }))}
            placeholder={resources.length ? 'Choose a resource' : 'No active resources yet'}
          />
        </div>
        {selectedResource && (
          <div className="flex items-center gap-2 pb-2.5">
            {selectedResource.requiresApproval && <Badge variant="warning" size="sm">Requires approval</Badge>}
            {selectedResource.capacity != null && <Badge variant="secondary" size="sm">Capacity {selectedResource.capacity}</Badge>}
          </div>
        )}
        <div className="ml-auto pb-1">
          <Button onClick={() => openBookingModal(viewDate)} disabled={!resourceId}>
            <CalendarClock className="h-4 w-4" /> New Booking
          </Button>
        </div>
      </div>

      {resources.length === 0 ? (
        <EmptyState title="No bookable resources yet" message='Add one from the "Resources" page first.' />
      ) : loading ? (
        <div className="py-16"><Spinner label="Loading calendar..." /></div>
      ) : (
        <ResourceCalendar
          viewMode={viewMode}
          viewDate={viewDate}
          bookings={bookings}
          onNavigate={handleNavigate}
          onViewModeChange={setViewMode}
          onSlotClick={openBookingModal}
          onBookingClick={setDetailBooking}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Booking"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>Book</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Input label="Title / Purpose" required value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sprint Planning" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start" type="datetime-local" required value={formData.startTime} onChange={(e) => setFormData((f) => ({ ...f, startTime: e.target.value }))} />
            <Input label="End" type="datetime-local" required value={formData.endTime} onChange={(e) => setFormData((f) => ({ ...f, endTime: e.target.value }))} />
          </div>
          <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional" rows={2} />

          <div className="flex items-center justify-between rounded-lg border border-(--app-color-border) px-4 py-3">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-(--app-color-text-muted)" />
              <div>
                <p className="text-sm font-semibold text-(--app-color-text)">Recurring booking</p>
                <p className="text-xs text-(--app-color-text-muted)">Repeats the same time slot daily or weekly.</p>
              </div>
            </div>
            <Toggle checked={formData.recurring} onChange={(v) => setFormData((f) => ({ ...f, recurring: v }))} />
          </div>

          {formData.recurring && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Repeats"
                value={formData.frequency}
                onChange={(e) => setFormData((f) => ({ ...f, frequency: e.target.value }))}
                options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]}
              />
              <Input
                label="Number of occurrences"
                type="number"
                min="1"
                max="52"
                value={formData.occurrences}
                onChange={(e) => setFormData((f) => ({ ...f, occurrences: e.target.value }))}
              />
            </div>
          )}

          {selectedResource?.requiresApproval && (
            <p className="rounded-lg bg-(--app-color-primary-soft) px-3 py-2 text-xs font-medium text-(--app-color-primary)">
              This resource requires approval — your booking will be "Pending" until an approver confirms it.
            </p>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!detailBooking} onClose={() => setDetailBooking(null)} title={detailBooking?.title || 'Booking'}>
        {detailBooking && (
          <div className="space-y-3">
            <p className="text-sm text-(--app-color-text-muted)">{formatDateShort(detailBooking.startTime)} · {formatTimeRange(detailBooking.startTime, detailBooking.endTime)}</p>
            <Badge variant={bookingStatusMeta(detailBooking.status).variant}>{bookingStatusMeta(detailBooking.status).label}</Badge>
            {detailBooking.notes && <p className="text-sm text-(--app-color-text)">{detailBooking.notes}</p>}
            {!['cancelled', 'rejected', 'completed', 'expired'].includes(detailBooking.status) && (
              <Button variant="danger" size="sm" onClick={() => handleCancelBooking(detailBooking)}>Cancel Booking</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
