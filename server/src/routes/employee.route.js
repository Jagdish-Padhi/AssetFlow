import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as svc from '../services/employee.service.js';

const router = Router();

// List all employees — admin, asset_manager, department_head can view
router.get('/', verifyToken, authorize('admin', 'asset_manager', 'department_head'), async (req, res, next) => {
  try {
    const { search, role, status, departmentId, limit, offset } = req.query;
    const items = await svc.listEmployees({ search, role, status, departmentId, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    return res.json({ items });
  } catch (e) { return next(e); }
});

// Get one employee
router.get('/:id', verifyToken, authorize('admin', 'asset_manager', 'department_head'), async (req, res, next) => {
  try {
    const item = await svc.getEmployeeById(req.params.id);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Promote/demote role — admin only
router.patch('/:id/role', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const item = await svc.updateEmployeeRole(req.params.id, role);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Assign to department — admin only
router.patch('/:id/department', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const { departmentId } = req.body;
    const item = await svc.assignEmployeeDepartment(req.params.id, departmentId);
    return res.json({ item });
  } catch (e) { return next(e); }
});

// Activate / deactivate — admin only
router.patch('/:id/status', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await svc.updateEmployeeStatus(req.params.id, status);
    return res.json({ item });
  } catch (e) { return next(e); }
});

export default router;
