export const BOOKING_STATUS_META = {
  pending: { label: 'Pending Approval', variant: 'warning' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  ongoing: { label: 'Ongoing', variant: 'success' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
  rejected: { label: 'Rejected', variant: 'danger' },
  expired: { label: 'Expired', variant: 'outline' },
};

export function bookingStatusMeta(status) {
  return BOOKING_STATUS_META[status] || { label: status, variant: 'default' };
}

export const RESOURCE_TYPE_LABELS = {
  meeting_room: 'Meeting Room',
  projector: 'Projector',
  vehicle: 'Vehicle',
  equipment: 'Equipment',
  lab: 'Lab',
  other: 'Other',
};

export const RESOURCE_TYPE_OPTIONS = Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
