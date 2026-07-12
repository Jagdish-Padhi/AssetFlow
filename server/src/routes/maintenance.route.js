import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/maintenance.service.js';

const router = Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { assetId, status, priority, limit, offset } = req.query;
    const items = await svc.listMaintenance({ assetId, status, priority, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

export default router;
