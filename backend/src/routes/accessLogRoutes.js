/**
 * Access Log Routes
 * مسارات API الخاصة بسجلات الدخول والخروج
 */

import express from 'express';
import accessLogController from '../controllers/accessLogController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   GET /api/access-logs/stats
 * @desc    Get access logs statistics
 * @access  Private - All authenticated users
 */
router.get(
  '/stats',
  accessLogController.getAccessLogsStats
);

/**
 * @route   POST /api/access-logs/pull-all
 * @desc    Pull logs from all devices
 * @access  Private - Admin, Manager
 */
router.post(
  '/pull-all',
  authorize(['super_admin', 'admin', 'manager']),
  accessLogController.pullLogsFromAllDevices
);

/**
 * @route   GET /api/access-logs
 * @desc    Get all access logs with filtering and pagination
 * @access  Private - All authenticated users
 */
router.get(
  '/',
  accessLogController.getAccessLogs
);

/**
 * @route   GET /api/access-logs/:id
 * @desc    Get single access log by ID
 * @access  Private - All authenticated users
 */
router.get(
  '/:id',
  accessLogController.getAccessLog
);

/**
 * @route   POST /api/access-logs
 * @desc    Create access log manually
 * @access  Private - Admin, Manager
 */
router.post(
  '/',
  authorize(['super_admin', 'admin', 'manager']),
  accessLogController.createAccessLog
);

/**
 * @route   DELETE /api/access-logs/:id
 * @desc    Delete access log (soft delete)
 * @access  Private - Admin only
 */
router.delete(
  '/:id',
  authorize(['super_admin', 'admin']),
  accessLogController.deleteAccessLog
);

export default router;
