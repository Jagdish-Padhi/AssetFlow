/**
 * Route barrel
 * Mount new routers here as you add domain features.
 */

import { Router } from 'express';
import healthRouter     from './health.route.js';
import authRouter       from './auth.route.js';
import departmentRouter from './department.route.js';
import categoryRouter   from './category.route.js';
import employeeRouter   from './employee.route.js';
import assetRouter      from './asset.route.js';
import allocationRouter from './allocation.route.js';
import maintenanceRouter from './maintenance.route.js';
import bookingResourceRouter from "./bookingResource.route.js";
import bookingRouter from "./booking.route.js";
import dashboardRouter from "./dashboard.route.js";

const router = Router();

router.use(healthRouter);
router.use('/auth',        authRouter);
router.use('/departments', departmentRouter);
router.use('/categories',  categoryRouter);
router.use('/employees',   employeeRouter);
router.use('/assets',      assetRouter);
router.use('/allocations', allocationRouter);
router.use('/maintenance', maintenanceRouter);
router.use("/booking-resources", bookingResourceRouter);
router.use("/bookings", bookingRouter);
router.use("/dashboard", dashboardRouter);

export default router;
