import { body, param, query } from 'express-validator';

/**
 * Validation rules for daily report
 */
export const dailyReportRules = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('التاريخ يجب أن يكون بصيغة ISO 8601'),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('status')
    .optional()
    .isIn(['present', 'late', 'absent', 'half_day', 'holiday', 'leave'])
    .withMessage('حالة الحضور غير صحيحة'),
];

/**
 * Validation rules for monthly employee report
 */
export const monthlyEmployeeReportRules = [
  param('employeeId')
    .isInt({ min: 1 })
    .withMessage('معرف الموظف غير صحيح'),

  query('year')
    .notEmpty()
    .withMessage('السنة مطلوبة')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('السنة يجب أن تكون بين 2020 و 2100'),

  query('month')
    .notEmpty()
    .withMessage('الشهر مطلوب')
    .isInt({ min: 1, max: 12 })
    .withMessage('الشهر يجب أن يكون بين 1 و 12'),
];

/**
 * Validation rules for monthly report
 */
export const monthlyReportRules = [
  query('year')
    .notEmpty()
    .withMessage('السنة مطلوبة')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('السنة يجب أن تكون بين 2020 و 2100'),

  query('month')
    .notEmpty()
    .withMessage('الشهر مطلوب')
    .isInt({ min: 1, max: 12 })
    .withMessage('الشهر يجب أن يكون بين 1 و 12'),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('department')
    .optional()
    .isLength({ max: 255 })
    .withMessage('اسم القسم يجب أن لا يتجاوز 255 حرف'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقم صحيح أكبر من 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('عدد النتائج يجب أن يكون بين 1 و 1000'),
];

/**
 * Validation rules for late arrivals report
 */
export const lateArrivalsReportRules = [
  query('start_date')
    .notEmpty()
    .withMessage('تاريخ البداية مطلوب')
    .isISO8601()
    .withMessage('تاريخ البداية يجب أن يكون بصيغة ISO 8601'),

  query('end_date')
    .notEmpty()
    .withMessage('تاريخ النهاية مطلوب')
    .isISO8601()
    .withMessage('تاريخ النهاية يجب أن يكون بصيغة ISO 8601')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.start_date)) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('department')
    .optional()
    .isLength({ max: 255 })
    .withMessage('اسم القسم يجب أن لا يتجاوز 255 حرف'),

  query('min_late_minutes')
    .optional()
    .isInt({ min: 1, max: 240 })
    .withMessage('الحد الأدنى لدقائق التأخير يجب أن يكون بين 1 و 240'),
];

/**
 * Validation rules for overtime report
 */
export const overtimeReportRules = [
  query('start_date')
    .notEmpty()
    .withMessage('تاريخ البداية مطلوب')
    .isISO8601()
    .withMessage('تاريخ البداية يجب أن يكون بصيغة ISO 8601'),

  query('end_date')
    .notEmpty()
    .withMessage('تاريخ النهاية مطلوب')
    .isISO8601()
    .withMessage('تاريخ النهاية يجب أن يكون بصيغة ISO 8601')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.start_date)) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('department')
    .optional()
    .isLength({ max: 255 })
    .withMessage('اسم القسم يجب أن لا يتجاوز 255 حرف'),

  query('min_overtime_hours')
    .optional()
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('الحد الأدنى لساعات الإضافي يجب أن يكون بين 0.1 و 24'),
];

/**
 * Validation rules for absence report
 */
export const absenceReportRules = [
  query('start_date')
    .notEmpty()
    .withMessage('تاريخ البداية مطلوب')
    .isISO8601()
    .withMessage('تاريخ البداية يجب أن يكون بصيغة ISO 8601'),

  query('end_date')
    .notEmpty()
    .withMessage('تاريخ النهاية مطلوب')
    .isISO8601()
    .withMessage('تاريخ النهاية يجب أن يكون بصيغة ISO 8601')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.start_date)) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('department')
    .optional()
    .isLength({ max: 255 })
    .withMessage('اسم القسم يجب أن لا يتجاوز 255 حرف'),
];

/**
 * Validation rules for calculate attendance
 */
export const calculateAttendanceRules = [
  body('employee_id')
    .notEmpty()
    .withMessage('معرف الموظف مطلوب')
    .isInt({ min: 1 })
    .withMessage('معرف الموظف غير صحيح'),

  body('date')
    .notEmpty()
    .withMessage('التاريخ مطلوب')
    .isISO8601()
    .withMessage('التاريخ يجب أن يكون بصيغة ISO 8601'),
];

/**
 * Validation rules for recalculate attendance range
 */
export const recalculateRangeRules = [
  body('employee_id')
    .notEmpty()
    .withMessage('معرف الموظف مطلوب')
    .isInt({ min: 1 })
    .withMessage('معرف الموظف غير صحيح'),

  body('start_date')
    .notEmpty()
    .withMessage('تاريخ البداية مطلوب')
    .isISO8601()
    .withMessage('تاريخ البداية يجب أن يكون بصيغة ISO 8601'),

  body('end_date')
    .notEmpty()
    .withMessage('تاريخ النهاية مطلوب')
    .isISO8601()
    .withMessage('تاريخ النهاية يجب أن يكون بصيغة ISO 8601')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.start_date)) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),
];
