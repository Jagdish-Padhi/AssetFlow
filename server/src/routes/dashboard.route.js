import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as svc from '../services/dashboard.service.js';

const router = Router();

router.get('/stats', verifyToken, async (req, res, next) => {
  try {
    const stats = await svc.getDashboardStats();
    return res.json({ stats });
  } catch (e) {
    return next(e);
  }
});

export default router;
