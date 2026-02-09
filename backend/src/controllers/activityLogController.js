import asyncHandler from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';
import * as activityLogService from '../services/activityLogService.js';

/**
 * @desc    Get employee activity logs (attendance logs)
 * @route   GET /api/employees/:id/activity-logs
 * @access  Private (admin+, manager+, employees.read)
 */
export const getEmployeeActivityLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  
  // Filters
  const filters = {
    page: req.query.page || 1,
    limit: req.query.limit || 50,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    event_type: req.query.event_type,
    device_id: req.query.device_id,
    sort_by: req.query.sort_by || 'event_time',
    sort_order: req.query.sort_order || 'DESC'
  };

  const result = await activityLogService.getEmployeeActivityLogs(userId, employeeId, filters);
  
  success(res, result, 'تم جلب سجل النشاطات بنجاح', 200);
});

/**
 * @desc    Get all attendance logs (for access logs page)
 * @route   GET /api/attendance-logs
 * @access  Private (admin+, manager+)
 */
export const getAllAttendanceLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Filters
  const filters = {
    page: req.query.page || 1,
    limit: req.query.limit || 50,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    event_type: req.query.event_type,
    employee_id: req.query.employee_id,
    device_id: req.query.device_id,
    verification_method: req.query.verification_method,
    is_successful: req.query.is_successful,
    sort_by: req.query.sort_by || 'event_time',
    sort_order: req.query.sort_order || 'DESC'
  };

  const result = await activityLogService.getAllAttendanceLogs(userId, filters);
  
  success(res, result, 'تم جلب سجلات الحضور بنجاح', 200);
});

/**
 * @desc    Get attendance log statistics
 * @route   GET /api/attendance-logs/stats
 * @access  Private (admin+, manager+)
 */
export const getAttendanceStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    employee_id: req.query.employee_id,
    device_id: req.query.device_id
  };

  const stats = await activityLogService.getAttendanceStats(userId, filters);
  
  success(res, stats, 'تم جلب إحصائيات الحضور بنجاح', 200);
});
