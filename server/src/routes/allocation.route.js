import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/allocation.service.js';

const router = Router();

// ── Allocations ───────────────────────────────────────────────────────────────

// List allocations (filter by assetId, userId, status)
router.get('/', verifyToken, authorize('admin', 'asset_manager', 'department_head'), async (req, res, next) => {
  try {
    const { assetId, userId, status, limit, offset } = req.query;
    const items = await svc.listAllocations({ assetId, userId, status, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// Allocate an asset — admin, asset_manager
router.post('/', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const item = await svc.allocateAsset({ ...req.body, actionedByUserId: req.auth.userId });
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// Return an asset — admin, asset_manager
router.patch('/:id/return', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const result = await svc.returnAsset(req.params.id, { ...req.body, actionedByUserId: req.auth.userId });
    return res.json(result);
  } catch (e) { return next(e); }
});

// Flag overdue — admin, asset_manager (could be cron-triggered too)
router.post('/flag-overdue', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const result = await svc.flagOverdueAllocations();
    return res.json(result);
  } catch (e) { return next(e); }
});

// ── Transfer Requests ─────────────────────────────────────────────────────────

// List transfer requests
router.get('/transfers', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const { assetId, status, limit, offset } = req.query;
    const items = await svc.listTransferRequests({ assetId, status, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// Create transfer request — any authenticated user can request
router.post('/transfers', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.createTransferRequest(req.body, req.auth.userId);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// Approve or reject transfer — admin, asset_manager
router.patch('/transfers/:id/action', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const { action } = req.body;
    const result = await svc.actionTransferRequest(req.params.id, action, req.auth.userId);
    return res.json(result);
  } catch (e) { return next(e); }
});

export default router;
