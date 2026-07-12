const VALID_TYPES = ['meeting_room', 'projector', 'vehicle', 'equipment', 'lab', 'other'];

export function validateCreateBookingResource(payload = {}) {
  const errors = [];
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';

  if (!name) errors.push('Name is required.');
  if (payload.type !== undefined && !VALID_TYPES.includes(payload.type)) {
    errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}.`);
  }
  if (payload.capacity !== undefined && payload.capacity !== null && payload.capacity !== '') {
    const n = Number(payload.capacity);
    if (!Number.isFinite(n) || n < 0) errors.push('Capacity must be a non-negative number.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateBookingResource(payload = {}) {
  const errors = [];
  if (payload.name !== undefined && !payload.name?.trim()) errors.push('Name cannot be empty.');
  if (payload.type !== undefined && !VALID_TYPES.includes(payload.type)) {
    errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}.`);
  }
  if (payload.capacity !== undefined && payload.capacity !== null && payload.capacity !== '') {
    const n = Number(payload.capacity);
    if (!Number.isFinite(n) || n < 0) errors.push('Capacity must be a non-negative number.');
  }
  return { valid: errors.length === 0, errors };
}
