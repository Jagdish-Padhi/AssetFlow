function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isValidDateString(v) {
  if (!isNonEmptyString(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

export function validateCreateBooking(payload = {}) {
  const errors = [];
  if (!isNonEmptyString(payload.resourceId)) errors.push('resourceId is required.');
  if (!isNonEmptyString(payload.title)) errors.push('A title/purpose is required.');
  if (!isValidDateString(payload.startTime)) errors.push('A valid startTime is required.');
  if (!isValidDateString(payload.endTime)) errors.push('A valid endTime is required.');
  if (isValidDateString(payload.startTime) && isValidDateString(payload.endTime)) {
    if (new Date(payload.endTime) <= new Date(payload.startTime)) {
      errors.push('endTime must be after startTime.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCreateRecurringBooking(payload = {}) {
  const { errors } = validateCreateBooking(payload);
  const allErrors = [...errors];

  const recurrence = payload.recurrence || {};
  if (!['daily', 'weekly'].includes(recurrence.frequency)) {
    allErrors.push('recurrence.frequency must be "daily" or "weekly".');
  }
  const hasOccurrences = recurrence.occurrences !== undefined && recurrence.occurrences !== null && recurrence.occurrences !== '';
  const hasUntil = isNonEmptyString(recurrence.until);
  if (!hasOccurrences && !hasUntil) {
    allErrors.push('Provide recurrence.occurrences (a count) or recurrence.until (an end date).');
  }
  if (hasOccurrences && (!Number.isFinite(Number(recurrence.occurrences)) || Number(recurrence.occurrences) < 1)) {
    allErrors.push('recurrence.occurrences must be a positive number.');
  }
  if (hasUntil && Number.isNaN(new Date(recurrence.until).getTime())) {
    allErrors.push('recurrence.until must be a valid date.');
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

export function validateReschedule(payload = {}) {
  const errors = [];
  if (!isValidDateString(payload.startTime)) errors.push('A valid startTime is required.');
  if (!isValidDateString(payload.endTime)) errors.push('A valid endTime is required.');
  if (isValidDateString(payload.startTime) && isValidDateString(payload.endTime)) {
    if (new Date(payload.endTime) <= new Date(payload.startTime)) {
      errors.push('endTime must be after startTime.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCancel(payload = {}) {
  const errors = [];
  if (payload.reason !== undefined && typeof payload.reason !== 'string') {
    errors.push('reason must be a string.');
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
