function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function validateCreateMaintenance(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.assetId)) errors.push('assetId is required.');
  if (!isNonEmptyString(payload.description)) errors.push('Description is required.');
  if (payload.priority && !['low', 'medium', 'high'].includes(payload.priority)) {
    errors.push('Priority must be "low", "medium", or "high".');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAssignTechnician(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.assignedTechnicianId)) errors.push('assignedTechnicianId is required.');
  return { valid: errors.length === 0, errors };
}

export function validateResolve(payload = {}) {
  const errors = [];
  if (payload.completionNotes !== undefined && payload.completionNotes !== null && !isNonEmptyString(payload.completionNotes)) {
    errors.push('completionNotes must be a non-empty string if provided.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateReject(payload = {}) {
  const errors = [];
  if (payload.reason !== undefined && typeof payload.reason !== 'string') {
    errors.push('reason must be a string.');
  }
  return { valid: errors.length === 0, errors };
}
