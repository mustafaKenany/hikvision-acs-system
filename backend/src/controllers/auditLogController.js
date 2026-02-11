/**
 * Audit Log Controller
 * معالج طلبات API الخاصة بسجل المراجعة
 */

import * as auditLogService from '../services/auditLogService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class AuditLogController {
  /**
   * GET /api/audit-logs
   * Get all audit logs with filtering and pagination
   * Super admin only
   */
  getAuditLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.query;

    const result = await auditLogService.getAllAuditLogs(userId, filters);

    return success(res, result, 'تم جلب سجل المراجعة بنجاح', 200);
  });

  /**
   * GET /api/audit-logs/:id
   * Get single audit log by ID
   * Super admin only
   */
  getAuditLog = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const logId = parseInt(req.params.id);

    const result = await auditLogService.getAuditLogById(userId, logId);

    return success(res, result, 'تم جلب السجل بنجاح', 200);
  });

  /**
   * GET /api/audit-logs/resource/:resourceType/:resourceId
   * Get audit logs for a specific resource
   */
  getResourceAuditLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { resourceType, resourceId } = req.params;
    const filters = req.query;

    const result = await auditLogService.getResourceAuditLogs(
      userId, 
      resourceType, 
      parseInt(resourceId),
      filters
    );

    return success(res, result, 'تم جلب سجل العمليات بنجاح', 200);
  });
}

export default new AuditLogController();
