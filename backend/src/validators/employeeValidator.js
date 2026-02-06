import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new employee
 */
export const createEmployeeValidator = [
  body('employee_no')
    .trim()
    .notEmpty()
    .withMessage('رقم الموظف مطلوب')
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم الموظف يجب أن يكون بين 1 و 50 حرف'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('اسم الموظف مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الموظف يجب أن يكون بين 2 و 255 حرف'),
  
  body('name_ar')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم بالعربي يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,20}$/)
    .withMessage('رقم الهاتف يجب أن يتكون من 10-20 رقم'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القسم يجب ألا يزيد عن 100 حرف'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('المسمى الوظيفي يجب ألا يزيد عن 100 حرف'),
  
  body('photo_url')
    .optional()
    .isURL()
    .withMessage('رابط الصورة غير صالح'),
  
  body('hire_date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ التوظيف غير صالح'),
  
  body('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('الملاحظات يجب ألا تزيد عن 5000 حرف'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('البيانات الإضافية يجب أن تكون كائن JSON'),
  
  body('is_active')
    .optional()
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
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم الموظف يجب أن يكون بين 1 و 50 حرف'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الموظف يجب أن يكون بين 2 و 255 حرف'),
  
  body('name_ar')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم بالعربي يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,20}$/)
    .withMessage('رقم الهاتف يجب أن يتكون من 10-20 رقم'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القسم يجب ألا يزيد عن 100 حرف'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('المسمى الوظيفي يجب ألا يزيد عن 100 حرف'),
  
  body('photo_url')
    .optional()
    .isURL()
    .withMessage('رابط الصورة غير صالح'),
  
  body('hire_date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ التوظيف غير صالح'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('الملاحظات يجب ألا تزيد عن 5000 حرف'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('البيانات الإضافية يجب أن تكون كائن JSON'),
  
  body('is_active')
    .optional()
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
