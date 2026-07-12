import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/audit.service.js';
import {
  validateCreateAudit,
  validateAddAuditItem,
  validateAddAuditors,
  validateResolveItem,
} from '../validators/audit.validator.js';

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
    const { status, departmentId, limit, offset } = req.query;
    const items = await svc.listAudits({
      status, departmentId,
      limit: Number(limit) || 50, offset: Number(offset) || 0,
    });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// ── Discrepancy report (must be before /:id) ─────────────────────────────────

router.get('/:id/report', verifyToken, async (req, res, next) => {
  try {
    const report = await svc.getDiscrepancyReport(req.params.id);
    return res.json({ report });
  } catch (e) { return next(e); }
});

// ── Audit items (must be before /:id) ────────────────────────────────────────

router.get('/:id/items', verifyToken, async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const items = await svc.getAuditItems(req.params.id, {
      status, limit: Number(limit) || 50, offset: Number(offset) || 0,
    });
    return res.json({ items });
  } catch (e) { return next(e); }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const item = await svc.getAuditById(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// ── Create Audit ─────────────────────────────────────────────────────────────

router.post('/', verifyToken, authorize('admin', 'asset_manager'), validate(validateCreateAudit), async (req, res, next) => {
  try {
    const item = await svc.createAudit(req.body);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// ── Close Audit ──────────────────────────────────────────────────────────────

router.patch('/:id/close', verifyToken, authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const result = await svc.closeAudit(req.params.id);
    return res.json(result);
  } catch (e) { return next(e); }
});

// ── Assign Auditors ──────────────────────────────────────────────────────────

router.post('/:id/auditors', verifyToken, authorize('admin', 'asset_manager'), validate(validateAddAuditors), async (req, res, next) => {
  try {
    const result = await svc.addAuditors(req.params.id, req.body.auditorIds);
    return res.json(result);
  } catch (e) { return next(e); }
});

// ── Add Audit Item (Verification) ────────────────────────────────────────────

router.post('/:id/items', verifyToken, authorize('admin', 'asset_manager', 'department_head'), validate(validateAddAuditItem), async (req, res, next) => {
  try {
    const item = await svc.addAuditItem(req.params.id, req.body);
    return res.status(201).json({ item });
  } catch (e) { return next(e); }
});

// ── Resolve Discrepancy ──────────────────────────────────────────────────────

router.patch('/items/:itemId/resolve', verifyToken, authorize('admin', 'asset_manager'), validate(validateResolveItem), async (req, res, next) => {
  try {
    const item = await svc.resolveAuditItem(req.params.itemId, req.body, req.auth.userId);
    return res.json({ item });
  } catch (e) { return next(e); }
});

export default router;
