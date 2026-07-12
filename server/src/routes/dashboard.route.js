import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as svc from '../services/dashboard.service.js';
import { getDb } from '../db/index.js';
import { assets, maintenance, bookings } from '../db/schema/index.js';

const router = Router();

// ── KPIs ─────────────────────────────────────────────────────────────────────

router.get('/stats', verifyToken, async (req, res, next) => {
  try {
    const stats = await svc.getDashboardStats();
    return res.json({ stats });
  } catch (e) { return next(e); }
});

// ── Chart Data ───────────────────────────────────────────────────────────────

router.get('/charts/assets-by-status', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getAssetStatusDistribution();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/charts/assets-by-category', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getCategoryDistribution();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/charts/assets-by-department', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getDepartmentDistribution();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/charts/maintenance-status', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getMaintenanceStatusDistribution();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/charts/booking-status', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getBookingStatusDistribution();
    return res.json({ data });
  } catch (e) { return next(e); }
});

// ── Analytics ────────────────────────────────────────────────────────────────

router.get('/analytics/utilization', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getUtilizationRate();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/analytics/idle-assets', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getIdleAssets();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/analytics/asset-lifecycle', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getAssetLifecycle();
    return res.json({ data });
  } catch (e) { return next(e); }
});

router.get('/analytics/audit-summary', verifyToken, async (req, res, next) => {
  try {
    const data = await svc.getAuditSummary();
    return res.json({ data });
  } catch (e) { return next(e); }
});

// ── Activity ─────────────────────────────────────────────────────────────────

router.get('/activity', verifyToken, async (req, res, next) => {
  try {
    const { limit } = req.query;
    const items = await svc.getRecentActivity({ limit: Number(limit) || 10 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// ── CSV Export ───────────────────────────────────────────────────────────────

router.get('/export/assets', verifyToken, async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(assets);
    const csv = svc.toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assets.csv"');
    return res.send(csv);
  } catch (e) { return next(e); }
});

router.get('/export/maintenance', verifyToken, async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(maintenance);
    const csv = svc.toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance.csv"');
    return res.send(csv);
  } catch (e) { return next(e); }
});

router.get('/export/bookings', verifyToken, async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(bookings);
    const csv = svc.toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    return res.send(csv);
  } catch (e) { return next(e); }
});

export default router;
