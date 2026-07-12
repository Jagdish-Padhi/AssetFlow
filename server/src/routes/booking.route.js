import { Router } from 'express';
import {
  approveController,
  cancelController,
  createController,
  getOneController,
  listController,
  rejectController,
  remindersController,
  rescheduleController,
} from '../controllers/booking.controller.js';
import {
  validateCancel,
  validateCreateBooking,
  validateCreateRecurringBooking,
  validateReject,
  validateReschedule,
} from '../validators/booking.validator.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

function validate(fn) {
  return (req, res, next) => {
    const { valid, errors } = fn(req.body);
    if (!valid) return res.status(400).json({ message: 'Validation failed.', errors });
    return next();
  };
}

function validateCreate(req, res, next) {
  const fn = req.body?.recurrence ? validateCreateRecurringBooking : validateCreateBooking;
  return validate(fn)(req, res, next);
}

router.use(verifyToken);

router.get('/reminders/due', remindersController);
router.get('/', listController);
router.get('/:id', getOneController);
router.post('/', validateCreate, createController);
router.patch('/:id/reschedule', validate(validateReschedule), rescheduleController);
router.post('/:id/cancel', validate(validateCancel), cancelController);
router.post('/:id/approve', authorize('admin', 'asset_manager', 'department_head'), approveController);
router.post('/:id/reject', authorize('admin', 'asset_manager', 'department_head'), validate(validateReject), rejectController);

export default router;
