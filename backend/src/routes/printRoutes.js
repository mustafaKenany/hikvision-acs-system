/**
 * Print Routes
 * مسارات API الخاصة بعمليات الطباعة
 */

import express from 'express';
import printController from '../controllers/printController.js';
import { authenticate } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   POST /api/print/employee/:id
 * @desc    Log single employee print
 * @access  Private
 * @body    { print_type: 'بطاقة موظف' | 'تقرير موظف' | 'بيانات موظف' }
 */
router.post(
  '/employee/:id',
  printController.logEmployeePrint
);

/**
 * @route   POST /api/print/employees/batch
 * @desc    Log multiple employees print
 * @access  Private
 * @body    { employee_ids: [1,2,3], print_type: 'قائمة الموظفين' }
 */
router.post(
  '/employees/batch',
  printController.logEmployeesBatchPrint
);

/**
 * @route   POST /api/print/organization/:id
 * @desc    Log organization print
 * @access  Private - Super Admin only
 * @body    { print_type: 'بيانات المنظمة' | 'تقرير المنظمة' }
 */
router.post(
  '/organization/:id',
  printController.logOrganizationPrint
);

/**
 * @route   POST /api/print/device/:id
 * @desc    Log device print
 * @access  Private
 * @body    { print_type: 'بيانات الجهاز' | 'تقرير الجهاز' }
 */
router.post(
  '/device/:id',
  printController.logDevicePrint
);

/**
 * @route   POST /api/print/report
 * @desc    Log report print
 * @access  Private
 * @body    { report_type: 'نوع التقرير', report_data: { ... } }
 */
router.post(
  '/report',
  printController.logReportPrint
);

export default router;
