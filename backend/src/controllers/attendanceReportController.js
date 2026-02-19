import asyncHandler from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorHandler.js';
import * as attendanceReportService from '../services/attendanceReportService.js';
import * as attendanceCalculationService from '../services/attendanceCalculationService.js';

/**
 * @desc    Get daily attendance report
 * @route   GET /api/reports/attendance/daily
 * @access  Private (admin+, manager+, viewer+)
 */
export const getDailyReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    date: req.query.date,
    organization_id: req.query.organization_id,
    status: req.query.status,
  };

  const report = await attendanceReportService.getDailyReport(userId, filters);

  success(res, report, 'تم جلب التقرير اليومي بنجاح', 200);
});

/**
 * @desc    Get monthly attendance report for specific employee
 * @route   GET /api/reports/attendance/employee/:employeeId
 * @access  Private (admin+, manager+, viewer+)
 */
export const getMonthlyEmployeeReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const employeeId = req.params.employeeId;
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  const report = await attendanceReportService.getMonthlyEmployeeReport(
    userId,
    employeeId,
    year,
    month
  );

  success(res, report, 'تم جلب التقرير الشهري للموظف بنجاح', 200);
});

/**
 * @desc    Get monthly attendance report for all employees
 * @route   GET /api/reports/attendance/monthly
 * @access  Private (admin+, manager+, viewer+)
 */
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    year: parseInt(req.query.year),
    month: parseInt(req.query.month),
    organization_id: req.query.organization_id,
    department: req.query.department,
    page: req.query.page,
    limit: req.query.limit,
  };

  const report = await attendanceReportService.getMonthlyReport(userId, filters);

  success(res, report, 'تم جلب التقرير الشهري بنجاح', 200);
});

/**
 * @desc    Get late arrivals report
 * @route   GET /api/reports/late-arrivals
 * @access  Private (admin+, manager+, viewer+)
 */
export const getLateArrivalsReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    organization_id: req.query.organization_id,
    department: req.query.department,
    min_late_minutes: req.query.min_late_minutes,
  };

  const report = await attendanceReportService.getLateArrivalsReport(userId, filters);

  success(res, report, 'تم جلب تقرير التأخيرات بنجاح', 200);
});

/**
 * @desc    Get overtime report
 * @route   GET /api/reports/overtime
 * @access  Private (admin+, manager+, viewer+)
 */
export const getOvertimeReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    organization_id: req.query.organization_id,
    department: req.query.department,
    min_overtime_hours: req.query.min_overtime_hours,
  };

  const report = await attendanceReportService.getOvertimeReport(userId, filters);

  success(res, report, 'تم جلب تقرير ساعات الإضافي بنجاح', 200);
});

/**
 * @desc    Get absence report
 * @route   GET /api/reports/absences
 * @access  Private (admin+, manager+, viewer+)
 */
export const getAbsenceReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    organization_id: req.query.organization_id,
    department: req.query.department,
  };

  const report = await attendanceReportService.getAbsenceReport(userId, filters);

  success(res, report, 'تم جلب تقرير الغياب بنجاح', 200);
});

/**
 * @desc    Calculate attendance for specific employee and date
 * @route   POST /api/reports/attendance/calculate
 * @access  Private (admin+, manager+)
 */
export const calculateAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { employee_id, date } = req.body;

  const result = await attendanceCalculationService.calculateDailyAttendance(employee_id, date);

  success(res, result, 'تم حساب الحضور بنجاح', 200);
});

/**
 * @desc    Recalculate attendance for date range
 * @route   POST /api/reports/attendance/recalculate
 * @access  Private (admin+)
 */
export const recalculateAttendanceRange = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { employee_id, start_date, end_date } = req.body;

  const results = await attendanceCalculationService.recalculateAttendanceRange(
    employee_id,
    start_date,
    end_date
  );

  success(
    res,
    { processed: results.length, results },
    'تم إعادة حساب الحضور بنجاح',
    200
  );
});
