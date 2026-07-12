import {
  approveBooking,
  cancelBooking,
  createBooking,
  createRecurringBooking,
  getBookingById,
  listBookings,
  listDueReminders,
  rejectBooking,
  rescheduleBooking,
} from '../services/booking.service.js';

export async function listController(req, res, next) {
  try {
    const { resourceId, status, from, to, mine } = req.query;
    const items = await listBookings({
      resourceId: resourceId || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      mineUserId: mine === 'true' ? req.auth.userId : undefined,
    });
    return res.status(200).json({ items });
  } catch (e) {
    return next(e);
  }
}

export async function getOneController(req, res, next) {
  try {
    const item = await getBookingById(req.params.id);
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function createController(req, res, next) {
  try {
    if (req.body?.recurrence) {
      const result = await createRecurringBooking({ userId: req.auth.userId, payload: req.body });
      return res.status(201).json(result);
    }
    const item = await createBooking({ userId: req.auth.userId, payload: req.body });
    return res.status(201).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function rescheduleController(req, res, next) {
  try {
    const item = await rescheduleBooking({
      bookingId: req.params.id,
      userId: req.auth.userId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function cancelController(req, res, next) {
  try {
    const item = await cancelBooking({ bookingId: req.params.id, userId: req.auth.userId, reason: req.body?.reason });
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function approveController(req, res, next) {
  try {
    const item = await approveBooking({ bookingId: req.params.id, approverUserId: req.auth.userId });
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function rejectController(req, res, next) {
  try {
    const item = await rejectBooking({ bookingId: req.params.id, approverUserId: req.auth.userId, reason: req.body?.reason });
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function remindersController(req, res, next) {
  try {
    const withinMinutes = Number(req.query.withinMinutes) || 30;
    const items = await listDueReminders({ userId: req.auth.userId, withinMinutes });
    return res.status(200).json({ items });
  } catch (e) {
    return next(e);
  }
}
