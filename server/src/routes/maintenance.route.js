import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/maintenance.service.js';
import {
  validateCreateMaintenance,
  validateAssignTechnician,
  validateResolve,
  validateReject,
} from '../validators/maintenance.validator.js';

function validate(fn) {
  return (req, res, next) => {
    const { valid, errors } = fn(req.body);
    if (!valid) return res.status(400).json({ message: 'Validation failed.', errors });
    return next();
  };
}

const router = Router();

// ── List & Get ───────────────────────────────────────────────────────────────

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { assetId, status, priority, requestedById, limit, offset } = req.query;
    const items = await svc.listMaintenance({
      assetId, status, priority, requestedById,
      limit: Number(limit) || 50, offset: Number(offset) || 0,
    });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// ── Asset History (must be before /:id to avoid route shadowing) ─────────────

router.get('/history/:assetId', verifyToken, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const items = await svc.getMaintenanceHistory(req.params.assetId, {
      limit: Number(limit) || 50, offset: Number(offset) || 0,
    });
    return res.json({ items });
  } catch (e) { return next(e); }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.getMaintenanceById(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// ── Create Request ───────────────────────────────────────────────────────────

router.post('/', verifyToken, validate(validateCreateMaintenance), async (req, res, next) => {
  try {
    const item = await svc.createMaintenanceRequest(req.body, req.auth.userId);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// ── Workflow Actions ─────────────────────────────────────────────────────────

router.patch('/:id/approve', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const item = await svc.approveMaintenance(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id/reject', verifyToken, authorize('admin', 'asset_manager'), validate(validateReject), async (req, res, next) => {
  try {
    const item = await svc.rejectMaintenance(req.params.id, req.body.reason);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id/assign', verifyToken, authorize('admin', 'asset_manager'), validate(validateAssignTechnician), async (req, res, next) => {
  try {
    const item = await svc.assignTechnician(req.params.id, req.body.assignedTechnicianId);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id/start', verifyToken, authorize('admin', 'asset_manager', 'technician'), async (req, res, next) => {
  try {
    const item = await svc.startProgress(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id/resolve', verifyToken, authorize('admin', 'asset_manager', 'technician'), validate(validateResolve), async (req, res, next) => {
  try {
    const item = await svc.resolveMaintenance(req.params.id, req.body.completionNotes);
    return res.json({ item });
  } catch (e) { return next(e); }
});

router.patch('/:id/close', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const item = await svc.closeMaintenance(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

export default router;
