/**
 * Audit Log Routes
 * مسارات API الخاصة بسجل المراجعة
 */

import express from 'express';
import auditLogController from '../controllers/auditLogController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private - Super Admin only
 */
router.get(
  '/',
  authorize(['super_admin']),
  auditLogController.getAuditLogs
);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get single audit log by ID
 * @access  Private - Super Admin only
 */
router.get(
  '/:id',
  authorize(['super_admin']),
  auditLogController.getAuditLog
);

/**
 * @route   GET /api/audit-logs/resource/:resourceType/:resourceId
 * @desc    Get audit logs for a specific resource
 * @access  Private - Super Admin only
 */
router.get(
  '/resource/:resourceType/:resourceId',
  authorize(['super_admin']),
  auditLogController.getResourceAuditLogs
);

export default router;
