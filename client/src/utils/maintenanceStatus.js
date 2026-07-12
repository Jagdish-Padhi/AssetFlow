export const MAINTENANCE_STATUS_META = {
  pending:     { label: 'Pending',     variant: 'warning' },
  approved:    { label: 'Approved',    variant: 'info' },
  rejected:    { label: 'Rejected',    variant: 'danger' },
  assigned:    { label: 'Assigned',    variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'success' },
  resolved:    { label: 'Resolved',    variant: 'secondary' },
  closed:      { label: 'Closed',      variant: 'outline' },
};

export function maintenanceStatusMeta(status) {
  return MAINTENANCE_STATUS_META[status] || { label: status, variant: 'default' };
}

export const PRIORITY_META = {
  low:    { label: 'Low',    variant: 'outline' },
  medium: { label: 'Medium', variant: 'warning' },
  high:   { label: 'High',   variant: 'danger' },
};

export const ISSUE_TYPE_OPTIONS = [
  { value: 'hardware',    label: 'Hardware' },
  { value: 'software',    label: 'Software' },
  { value: 'electrical',  label: 'Electrical' },
  { value: 'mechanical',  label: 'Mechanical' },
  { value: 'cosmetic',    label: 'Cosmetic' },
  { value: 'other',       label: 'Other' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];
