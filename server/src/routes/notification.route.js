import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as svc from '../services/notification.service.js';

const router = Router();

// Get logged-in user's notifications
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const items = await svc.listUserNotifications(req.auth.userId, {
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
    });
    return res.json({ items });
  } catch (e) {
    return next(e);
  }
});

// Mark single notification as read
router.patch('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.markNotificationAsRead(req.params.id, req.auth.userId);
    return res.json({ item });
  } catch (e) {
    return next(e);
  }
});

// Mark all as read
router.post('/read-all', verifyToken, async (req, res, next) => {
  try {
    const result = await svc.markAllNotificationsRead(req.auth.userId);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

export default router;
