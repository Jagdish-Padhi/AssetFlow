import { Router } from 'express';
import {
  createController,
  deactivateController,
  getOneController,
  listController,
  updateController,
} from '../controllers/bookingResource.controller.js';
import { validateCreateBookingResource, validateUpdateBookingResource } from '../validators/bookingResource.validator.js';
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

router.use(verifyToken);

router.get('/', listController);
router.get('/:id', getOneController);
router.post('/', authorize('admin', 'asset_manager'), validate(validateCreateBookingResource), createController);
router.patch('/:id', authorize('admin', 'asset_manager'), validate(validateUpdateBookingResource), updateController);
router.delete('/:id', authorize('admin', 'asset_manager'), deactivateController);

export default router;
