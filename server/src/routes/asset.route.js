import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/resource.service.js';

const router = Router();

// List assets — all authenticated users
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { search, categoryId, departmentId, status, isBookable, limit, offset } = req.query;
    const items = await svc.listAssets({ search, categoryId, departmentId, status, isBookable, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// Get by tag (for QR scan)
router.get('/tag/:tag', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.getAssetByTag(req.params.tag);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Get single asset
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.getAssetById(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Create — admin, asset_manager
router.post('/', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const item = await svc.createAsset(req.body);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// Update metadata — admin, asset_manager
router.patch('/:id', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const item = await svc.updateAsset(req.params.id, req.body);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Transition lifecycle status — admin, asset_manager
router.patch('/:id/status', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await svc.updateAssetStatus(req.params.id, status);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Delete — admin only
router.delete('/:id', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const result = await svc.deleteAsset(req.params.id);
    return res.json(result);
  } catch (e) { return next(e); }
});

export default router;
