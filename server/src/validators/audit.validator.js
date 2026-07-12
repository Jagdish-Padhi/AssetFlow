function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidDateString(v) {
  if (!isNonEmptyString(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

export function validateCreateAudit(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.name)) errors.push('Audit name is required.');
  if (!isValidDateString(payload.startDate)) errors.push('A valid startDate is required.');
  if (payload.startDate && payload.endDate && new Date(payload.endDate) <= new Date(payload.startDate)) {
    errors.push('endDate must be after startDate.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAddAuditItem(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.assetId)) errors.push('assetId is required.');
  if (!isNonEmptyString(payload.auditorId)) errors.push('auditorId is required.');
  if (!['verified', 'missing', 'damaged'].includes(payload.status)) {
    errors.push('status must be "verified", "missing", or "damaged".');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAddAuditors(payload = {}) {
  const errors = [];
  if (!Array.isArray(payload.auditorIds) || payload.auditorIds.length === 0) {
    errors.push('auditorIds must be a non-empty array.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateResolveItem(payload = {}) {
  const errors = [];
  if (!['resolved', 'no_action'].includes(payload.resolutionStatus)) {
    errors.push('resolutionStatus must be "resolved" or "no_action".');
  }
  return { valid: errors.length === 0, errors };
}
