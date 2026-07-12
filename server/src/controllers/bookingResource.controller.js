import {
  createBookingResource,
  deactivateBookingResource,
  getBookingResourceById,
  listBookingResources,
  updateBookingResource,
} from '../services/bookingResource.service.js';

export async function listController(req, res, next) {
  try {
    const { search, type, activeOnly } = req.query;
    const items = await listBookingResources({ search, type, activeOnly: activeOnly === 'true' });
    return res.status(200).json({ items });
  } catch (e) {
    return next(e);
  }
}

export async function getOneController(req, res, next) {
  try {
    const item = await getBookingResourceById(req.params.id);
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function createController(req, res, next) {
  try {
    const item = await createBookingResource({ userId: req.auth.userId, payload: req.body });
    return res.status(201).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function updateController(req, res, next) {
  try {
    const item = await updateBookingResource({ resourceId: req.params.id, payload: req.body });
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}

export async function deactivateController(req, res, next) {
  try {
    const item = await deactivateBookingResource(req.params.id);
    return res.status(200).json({ item });
  } catch (e) {
    return next(e);
  }
}
