import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/activityLog.service.js';

const router = Router();

// List audit logs — admin and asset_manager only
router.get('/', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const items = await svc.listActivityLogs({
      limit: Number(req.query.limit) || 100,
      offset: Number(req.query.offset) || 0,
    });
    return res.json({ items });
  } catch (e) {
    return next(e);
  }
});

export default router;
