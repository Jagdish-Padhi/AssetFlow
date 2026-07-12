export const AUDIT_STATUS_META = {
  open:   { label: 'Open',   variant: 'success' },
  closed: { label: 'Closed', variant: 'outline' },
};

export function auditStatusMeta(status) {
  return AUDIT_STATUS_META[status] || { label: status, variant: 'default' };
}

export const AUDIT_ITEM_STATUS_META = {
  verified: { label: 'Verified', variant: 'success' },
  missing:  { label: 'Missing',  variant: 'danger' },
  damaged:  { label: 'Damaged',  variant: 'warning' },
};

export function auditItemStatusMeta(status) {
  return AUDIT_ITEM_STATUS_META[status] || { label: status, variant: 'default' };
}

export const RESOLUTION_STATUS_META = {
  pending:   { label: 'Pending',   variant: 'warning' },
  resolved:  { label: 'Resolved',  variant: 'success' },
  no_action: { label: 'No Action', variant: 'secondary' },
};

export const AUDIT_ITEM_STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified' },
  { value: 'missing',  label: 'Missing' },
  { value: 'damaged',  label: 'Damaged' },
];

export const RESOLUTION_OPTIONS = [
  { value: 'resolved',  label: 'Resolved' },
  { value: 'no_action', label: 'No Action' },
];
