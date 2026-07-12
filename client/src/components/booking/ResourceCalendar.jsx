import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import { bookingStatusMeta } from '../../utils/bookingStatus.js';
import { formatDateShort, formatTimeRange } from '../../utils/formatDate.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek(date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function bookingsOnDay(bookings, day) {
  return bookings
    .filter((b) => isSameDay(new Date(b.startTime), day))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

function BookingChip({ booking, onClick }) {
  const meta = bookingStatusMeta(booking.status);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="w-full text-left rounded-lg border border-(--app-color-border) bg-(--app-color-surface) px-2.5 py-1.5 hover:shadow-sm transition-shadow"
    >
      <p className="truncate text-xs font-semibold text-(--app-color-text)">{booking.title}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[11px] text-(--app-color-text-muted)">{formatTimeRange(booking.startTime, booking.endTime)}</span>
        <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
      </div>
    </button>
  );
}

function rangeLabel(viewMode, viewDate) {
  if (viewMode === 'day') {
    return viewDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (viewMode === 'week') {
    const start = startOfWeek(viewDate);
    const end = addDays(start, 6);
    return `${formatDateShort(start)} – ${formatDateShort(end)}`;
  }
  return viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function ResourceCalendar({
  viewMode = 'week',
  viewDate,
  bookings = [],
  onNavigate,
  onViewModeChange,
  onSlotClick,
  onBookingClick,
}) {
  return (
    <div className="rounded-2xl border border-(--app-color-border) bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate(-1)} className="rounded-lg border border-(--app-color-border) p-1.5 hover:bg-(--app-color-surface-elevated)" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate(1)} className="rounded-lg border border-(--app-color-border) p-1.5 hover:bg-(--app-color-surface-elevated)" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="ml-2 text-sm font-bold text-(--app-color-text)">{rangeLabel(viewMode, viewDate)}</h3>
        </div>
        <div className="flex gap-1 rounded-lg border border-(--app-color-border) p-1">
          {['day', 'week', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                viewMode === mode ? 'bg-(--app-color-primary) text-white' : 'text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated)'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'day' && (
        <div>
          <button
            onClick={() => onSlotClick(viewDate)}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-(--app-color-border) py-2 text-xs font-semibold text-(--app-color-text-muted) hover:border-(--app-color-primary) hover:text-(--app-color-primary)"
          >
            <Plus className="h-3.5 w-3.5" /> New booking on this day
          </button>
          <div className="space-y-2">
            {bookingsOnDay(bookings, viewDate).length === 0 && (
              <p className="py-6 text-center text-sm text-(--app-color-text-muted)">No bookings on this day.</p>
            )}
            {bookingsOnDay(bookings, viewDate).map((b) => (
              <BookingChip key={b.id} booking={b} onClick={onBookingClick} />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(viewDate), i)).map((day) => (
            <div key={day.toISOString()} className="rounded-xl border border-(--app-color-border) p-2">
              <button
                onClick={() => onSlotClick(day)}
                className="mb-2 flex w-full items-center justify-between rounded-md px-1 py-1 text-left hover:bg-(--app-color-surface-elevated)"
              >
                <span className="text-xs font-bold text-(--app-color-text)">{day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</span>
                <Plus className="h-3 w-3 text-(--app-color-text-muted)" />
              </button>
              <div className="space-y-1.5">
                {bookingsOnDay(bookings, day).map((b) => (
                  <BookingChip key={b.id} booking={b} onClick={onBookingClick} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wide text-(--app-color-text-muted)">{d}</div>
          ))}
          {Array.from({ length: 42 }, (_, i) => addDays(startOfWeek(startOfMonth(viewDate)), i)).map((day) => {
            const inMonth = day.getMonth() === viewDate.getMonth();
            const dayBookings = bookingsOnDay(bookings, day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onSlotClick(day)}
                className={`min-h-[80px] rounded-lg border border-(--app-color-border) p-1.5 text-left align-top hover:border-(--app-color-primary) ${
                  inMonth ? 'bg-white' : 'bg-(--app-color-surface-elevated) opacity-60'
                }`}
              >
                <span className="text-xs font-semibold text-(--app-color-text)">{day.getDate()}</span>
                <div className="mt-1 space-y-0.5">
                  {dayBookings.slice(0, 2).map((b) => (
                    <p key={b.id} className="truncate rounded bg-(--app-color-primary-soft) px-1 text-[10px] font-medium text-(--app-color-primary)">
                      {b.title}
                    </p>
                  ))}
                  {dayBookings.length > 2 && (
                    <p className="text-[10px] font-medium text-(--app-color-text-muted)">+{dayBookings.length - 2} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { startOfDay, startOfWeek, startOfMonth, addDays, isSameDay };
