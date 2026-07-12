import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/category.service.js';

const router = Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const items = await svc.listCategories({ search: req.query.search, limit: Number(req.query.limit) || 50, offset: Number(req.query.offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.getCategoryById(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.post('/', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const item = await svc.createCategory(req.body);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const item = await svc.updateCategory(req.params.id, req.body);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const result = await svc.deleteCategory(req.params.id);
    return res.json(result);
  } catch (e) { return next(e); }
});

export default router;
