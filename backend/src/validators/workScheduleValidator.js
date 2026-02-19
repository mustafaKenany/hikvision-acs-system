import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating work schedule
 */
export const createWorkScheduleRules = [
  body('name')
    .notEmpty()
    .withMessage('اسم الجدول مطلوب')
    .isLength({ min: 3, max: 255 })
    .withMessage('اسم الجدول يجب أن يكون بين 3 و 255 حرف')
    .trim(),

  body('name_ar')
    .optional()
    .isLength({ max: 255 })
    .withMessage('الاسم بالعربي يجب أن لا يتجاوز 255 حرف')
    .trim(),

  body('start_time')
    .notEmpty()
    .withMessage('وقت البداية مطلوب')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('وقت البداية يجب أن يكون بصيغة HH:MM أو HH:MM:SS'),

  body('end_time')
    .notEmpty()
    .withMessage('وقت النهاية مطلوب')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('وقت النهاية يجب أن يكون بصيغة HH:MM أو HH:MM:SS'),

  body('work_days')
    .notEmpty()
    .withMessage('أيام العمل مطلوبة')
    .isArray()
    .withMessage('أيام العمل يجب أن تكون مصفوفة')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('يجب اختيار يوم عمل واحد على الأقل');
      }
      if (!value.every(day => Number.isInteger(day) && day >= 0 && day <= 6)) {
        throw new Error('أيام العمل يجب أن تكون أرقام بين 0 (الأحد) و 6 (السبت)');
      }
      return true;
    }),

  body('late_grace_minutes')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('فترة السماح للتأخير يجب أن تكون بين 0 و 120 دقيقة'),

  body('early_leave_grace_minutes')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('فترة السماح للخروج المبكر يجب أن تكون بين 0 و 120 دقيقة'),

  body('expected_hours')
    .notEmpty()
    .withMessage('ساعات العمل المطلوبة مطلوبة')
    .isFloat({ min: 1, max: 24 })
    .withMessage('ساعات العمل يجب أن تكون بين 1 و 24 ساعة'),

  body('break_minutes')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('وقت الاستراحة يجب أن يكون بين 0 و 480 دقيقة (8 ساعات)'),

  body('is_flexible')
    .optional()
    .isBoolean()
    .withMessage('نوع الدوام (ثابت/مرن) يجب أن يكون true أو false'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('الوصف يجب أن لا يتجاوز 1000 حرف')
    .trim(),

  body('organization_id')
    .notEmpty()
    .withMessage('معرف المنظمة مطلوب')
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),
];

/**
 * Validation rules for updating work schedule
 */
export const updateWorkScheduleRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجدول غير صحيح'),

  body('name')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('اسم الجدول يجب أن يكون بين 3 و 255 حرف')
    .trim(),

  body('name_ar')
    .optional()
    .isLength({ max: 255 })
    .withMessage('الاسم بالعربي يجب أن لا يتجاوز 255 حرف')
    .trim(),

  body('start_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('وقت البداية يجب أن يكون بصيغة HH:MM أو HH:MM:SS'),

  body('end_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('وقت النهاية يجب أن يكون بصيغة HH:MM أو HH:MM:SS'),

  body('work_days')
    .optional()
    .isArray()
    .withMessage('أيام العمل يجب أن تكون مصفوفة')
    .custom((value) => {
      if (value && (!Array.isArray(value) || value.length === 0)) {
        throw new Error('يجب اختيار يوم عمل واحد على الأقل');
      }
      if (value && !value.every(day => Number.isInteger(day) && day >= 0 && day <= 6)) {
        throw new Error('أيام العمل يجب أن تكون أرقام بين 0 (الأحد) و 6 (السبت)');
      }
      return true;
    }),

  body('late_grace_minutes')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('فترة السماح للتأخير يجب أن تكون بين 0 و 120 دقيقة'),

  body('early_leave_grace_minutes')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('فترة السماح للخروج المبكر يجب أن تكون بين 0 و 120 دقيقة'),

  body('expected_hours')
    .optional()
    .isFloat({ min: 1, max: 24 })
    .withMessage('ساعات العمل يجب أن تكون بين 1 و 24 ساعة'),

  body('break_minutes')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('وقت الاستراحة يجب أن يكون بين 0 و 480 دقيقة (8 ساعات)'),

  body('is_flexible')
    .optional()
    .isBoolean()
    .withMessage('نوع الدوام (ثابت/مرن) يجب أن يكون true أو false'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('الوصف يجب أن لا يتجاوز 1000 حرف')
    .trim(),
];

/**
 * Validation rules for getting work schedule by ID
 */
export const getWorkScheduleByIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجدول غير صحيح'),
];

/**
 * Validation rules for deleting work schedule
 */
export const deleteWorkScheduleRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجدول غير صحيح'),
];

/**
 * Validation rules for assigning employees to schedule
 */
export const assignEmployeesRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجدول غير صحيح'),

  body('employee_ids')
    .notEmpty()
    .withMessage('يجب اختيار موظف واحد على الأقل')
    .isArray()
    .withMessage('معرفات الموظفين يجب أن تكون مصفوفة')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('يجب اختيار موظف واحد على الأقل');
      }
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('معرفات الموظفين غير صحيحة');
      }
      return true;
    }),

  body('effective_from')
    .optional()
    .isISO8601()
    .withMessage('تاريخ البداية يجب أن يكون بصيغة ISO 8601'),

  body('effective_until')
    .optional()
    .isISO8601()
    .withMessage('تاريخ النهاية يجب أن يكون بصيغة ISO 8601')
    .custom((value, { req }) => {
      if (value && req.body.effective_from) {
        if (new Date(value) <= new Date(req.body.effective_from)) {
          throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        }
      }
      return true;
    }),
];

/**
 * Validation rules for listing work schedules
 */
export const listWorkSchedulesRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقم صحيح أكبر من 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('عدد النتائج يجب أن يكون بين 1 و 1000'),

  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المنظمة غير صحيح'),

  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),

  query('is_flexible')
    .optional()
    .isBoolean()
    .withMessage('نوع الدوام يجب أن يكون true أو false'),

  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('نص البحث يجب أن لا يتجاوز 255 حرف')
    .trim(),
];
