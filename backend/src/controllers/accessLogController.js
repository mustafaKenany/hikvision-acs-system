/**
 * Access Log Controller
 * معالج API سجلات الدخول والخروج
 */

import asyncHandler from '../middlewares/asyncHandler.js';
import * as accessLogService from '../services/accessLogService.js';
import { success } from '../utils/response.js';

class AccessLogController {
  /**
   * GET /api/access-logs
   * Get all access logs with filtering and pagination
   */
  getAccessLogs = asyncHandler(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      deviceId: req.query.deviceId,
      employeeId: req.query.employeeId,
      employeeNo: req.query.employeeNo,
      logType: req.query.logType,
      verificationMethod: req.query.verificationMethod,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await accessLogService.getAllAccessLogs(filters);

    return success(res, result, 'تم جلب السجلات بنجاح', 200);
  });

  /**
   * GET /api/access-logs/stats
   * Get access logs statistics
   */
  getAccessLogsStats = asyncHandler(async (req, res) => {
    const result = await accessLogService.getAccessLogsStats();

    return success(res, result, 'تم جلب الإحصائيات بنجاح', 200);
  });

  /**
   * GET /api/access-logs/:id
   * Get single access log by ID
   */
  getAccessLog = asyncHandler(async (req, res) => {
    const logId = parseInt(req.params.id);

    const result = await accessLogService.getAccessLogById(logId);

    return success(res, result, 'تم جلب السجل بنجاح', 200);
  });

  /**
   * POST /api/access-logs
   * Create access log manually
   */
  createAccessLog = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const logData = req.body;

    const result = await accessLogService.createAccessLog(userId, logData);

    return success(res, result, 'تم إنشاء السجل بنجاح', 201);
  });

  /**
   * DELETE /api/access-logs/:id
   * Delete access log (soft delete)
   */
  deleteAccessLog = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const logId = parseInt(req.params.id);

    const result = await accessLogService.deleteAccessLog(userId, logId);

    return success(res, result, 'تم حذف السجل بنجاح', 200);
  });

  /**
   * POST /api/access-logs/pull-all
   * Pull logs from all devices
   */
  pullLogsFromAllDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.body; // {startDate, endDate}

    const result = await accessLogService.pullLogsFromAllDevices(userId, filters);

    return success(res, result, `تم سحب ${result.totalNewLogs} سجل جديد من ${result.totalDevices} جهاز`, 200);
  });
}

export default new AccessLogController();
