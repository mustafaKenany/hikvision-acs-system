import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  getAllAttendanceLogs,
  getAttendanceStats
} from '../controllers/activityLogController.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

/**
 * @route   GET /api/attendance-logs/stats
 * @desc    Get attendance statistics
 * @access  Private (admin+, manager+)
 */
router.get(
  '/stats',
  authorize(['super_admin', 'admin', 'manager'], ['attendance.read']),
  getAttendanceStats
);

/**
 * @route   GET /api/attendance-logs
 * @desc    Get all attendance logs (access logs page)
 * @access  Private (admin+, manager+)
 */
router.get(
  '/',
  authorize(['super_admin', 'admin', 'manager'], ['attendance.read']),
  getAllAttendanceLogs
);

export default router;
