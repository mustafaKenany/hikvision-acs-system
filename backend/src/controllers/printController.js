/**
 * Print Controller
 * معالج طلبات API الخاصة بعمليات الطباعة
 */

import * as printService from '../services/printService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class PrintController {
  /**
   * POST /api/print/employee/:id
   * Log employee print
   */
  logEmployeePrint = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const employeeId = parseInt(req.params.id);
    const { print_type = 'بطاقة موظف' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await printService.logEmployeePrint(userId, employeeId, print_type, ipAddress);

    return success(res, result, 'تم تسجيل عملية الطباعة بنجاح', 200);
  });

  /**
   * POST /api/print/employees/batch
   * Log multiple employees print
   */
  logEmployeesBatchPrint = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { employee_ids, print_type = 'قائمة الموظفين' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await printService.logEmployeesBatchPrint(
      userId, 
      employee_ids, 
      print_type, 
      ipAddress
    );

    return success(res, result, 'تم تسجيل عملية الطباعة بنجاح', 200);
  });

  /**
   * POST /api/print/organization/:id
   * Log organization print
   */
  logOrganizationPrint = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);
    const { print_type = 'بيانات المنظمة' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await printService.logOrganizationPrint(
      userId, 
      organizationId, 
      print_type, 
      ipAddress
    );

    return success(res, result, 'تم تسجيل عملية الطباعة بنجاح', 200);
  });

  /**
   * POST /api/print/device/:id
   * Log device print
   */
  logDevicePrint = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);
    const { print_type = 'بيانات الجهاز' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await printService.logDevicePrint(userId, deviceId, print_type, ipAddress);

    return success(res, result, 'تم تسجيل عملية الطباعة بنجاح', 200);
  });

  /**
   * POST /api/print/report
   * Log report print
   */
  logReportPrint = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { report_type, report_data = {} } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await printService.logReportPrint(
      userId, 
      report_type, 
      report_data, 
      ipAddress
    );

    return success(res, result, 'تم تسجيل طباعة التقرير بنجاح', 200);
  });
}

export default new PrintController();
