import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  getDailyReport,
  getMonthlyEmployeeReport,
  getMonthlyReport,
  getLateArrivalsReport,
  getOvertimeReport,
  getAbsenceReport,
  calculateAttendance,
  recalculateAttendanceRange,
} from '../controllers/attendanceReportController.js';
import {
  dailyReportRules,
  monthlyEmployeeReportRules,
  monthlyReportRules,
  lateArrivalsReportRules,
  overtimeReportRules,
  absenceReportRules,
  calculateAttendanceRules,
  recalculateRangeRules,
} from '../validators/attendanceReportValidator.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

/**
 * @route   GET /api/reports/attendance/daily
 * @desc    Get daily attendance report
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/attendance/daily',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  dailyReportRules,
  getDailyReport
);

/**
 * @route   GET /api/reports/attendance/monthly
 * @desc    Get monthly attendance report for all employees
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/attendance/monthly',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  monthlyReportRules,
  getMonthlyReport
);

/**
 * @route   GET /api/reports/attendance/employee/:employeeId
 * @desc    Get monthly attendance report for specific employee
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/attendance/employee/:employeeId',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  monthlyEmployeeReportRules,
  getMonthlyEmployeeReport
);

/**
 * @route   GET /api/reports/late-arrivals
 * @desc    Get late arrivals report
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/late-arrivals',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  lateArrivalsReportRules,
  getLateArrivalsReport
);

/**
 * @route   GET /api/reports/overtime
 * @desc    Get overtime report
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/overtime',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  overtimeReportRules,
  getOvertimeReport
);

/**
 * @route   GET /api/reports/absences
 * @desc    Get absence report
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/absences',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['report.read']),
  absenceReportRules,
  getAbsenceReport
);

/**
 * @route   POST /api/reports/attendance/calculate
 * @desc    Calculate attendance for specific employee and date
 * @access  Private (admin+, manager+)
 */
router.post(
  '/attendance/calculate',
  authorize(['super_admin', 'admin', 'manager'], ['report.create']),
  calculateAttendanceRules,
  calculateAttendance
);

/**
 * @route   POST /api/reports/attendance/recalculate
 * @desc    Recalculate attendance for date range
 * @access  Private (admin+)
 */
router.post(
  '/attendance/recalculate',
  authorize(['super_admin', 'admin'], ['report.create']),
  recalculateRangeRules,
  recalculateAttendanceRange
);

export default router;
