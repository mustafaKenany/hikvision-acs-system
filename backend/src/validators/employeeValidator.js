import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new employee
 */
export const createEmployeeValidator = [
  // employee_no is auto-generated, no validation needed
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('اسم الموظف مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الموظف يجب أن يكون بين 2 و 255 حرف'),
  
  body('name_ar')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم بالعربي يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .optional({ checkFalsy: true })  // تجاهل القيم الفارغة
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional({ checkFalsy: true })  // تجاهل القيم الفارغة
    .matches(/^[\d\s\-\+\(\)]{7,20}$/)
    .withMessage('رقم الهاتف يجب أن يكون صالحاً (7-20 رقم)'),
  
  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القسم يجب ألا يزيد عن 100 حرف'),
  
  body('position')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('المسمى الوظيفي يجب ألا يزيد عن 100 حرف'),
  
  // photo_url is managed separately via /employees/:id/photo endpoint
  // No validation needed here
  
  body('hire_date')
    .optional({ checkFalsy: true })  // تجاهل القيم الفارغة
    .isISO8601()
    .withMessage('تاريخ التوظيف غير صالح'),
  
  body('organization_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('الملاحظات يجب ألا تزيد عن 5000 حرف'),
  
  body('metadata')
    .optional({ checkFalsy: true })
    .isObject()
    .withMessage('البيانات الإضافية يجب أن تكون كائن JSON'),
  
  body('is_active')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  validate
];

/**
 * Validation for updating an employee
 */
export const updateEmployeeValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الموظف غير صالح'),
  
  body('employee_no')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم الموظف يجب أن يكون بين 1 و 50 حرف'),
  
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الموظف يجب أن يكون بين 2 و 255 حرف'),
  
  body('name_ar')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم بالعربي يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s\-\+\(\)]{7,20}$/)
    .withMessage('رقم الهاتف يجب أن يكون صالحاً (7-20 رقم)'),
  
  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القسم يجب ألا يزيد عن 100 حرف'),
  
  body('position')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('المسمى الوظيفي يجب ألا يزيد عن 100 حرف'),
  
  // photo_url is managed separately via /employees/:id/photo endpoint
  // No validation needed here
  
  body('hire_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('تاريخ التوظيف غير صالح'),
  
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('الملاحظات يجب ألا تزيد عن 5000 حرف'),
  
  body('metadata')
    .optional({ checkFalsy: true })
    .isObject()
    .withMessage('البيانات الإضافية يجب أن تكون كائن JSON'),
  
  body('is_active')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  validate
];

/**
 * Validation for employee ID parameter
 */
export const employeeIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الموظف غير صالح'),
  
  validate
];

/**
 * Validation for listing employees
 */
export const listEmployeesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً موجباً'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('حد العرض يجب أن يكون بين 1 و 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('نص البحث يجب أن يكون بين 1 و 100 حرف'),
  
  query('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القسم يجب ألا يزيد عن 100 حرف'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  query('sort_by')
    .optional()
    .isIn(['created_at', 'name', 'employee_no', 'department', 'hire_date'])
    .withMessage('حقل الترتيب غير صالح'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('اتجاه الترتيب يجب أن يكون ASC أو DESC'),
  
  validate
];
