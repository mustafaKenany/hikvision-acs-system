/**
 * Organization Validator
 * التحقق من صحة بيانات المؤسسات
 */

import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new organization
 */
export const createOrganizationValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('اسم المؤسسة مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم المؤسسة يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('البريد الإلكتروني مطلوب')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\s()-]+$/)
    .withMessage('رقم الهاتف غير صالح')
    .isLength({ max: 20 })
    .withMessage('رقم الهاتف يجب ألا يتجاوز 20 حرف'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('العنوان يجب ألا يتجاوز 500 حرف'),
  
  body('subscription_plan')
    .optional()
    .isIn(['free', 'basic', 'pro', 'enterprise'])
    .withMessage('خطة الاشتراك يجب أن تكون: free, basic, pro, أو enterprise'),
  
  body('subscription_start')
    .optional()
    .isISO8601()
    .withMessage('تاريخ بداية الاشتراك غير صالح'),
  
  body('subscription_end')
    .optional()
    .isISO8601()
    .withMessage('تاريخ نهاية الاشتراك غير صالح')
    .custom((value, { req }) => {
      if (req.body.subscription_start && new Date(value) <= new Date(req.body.subscription_start)) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),
  
  body('max_employees')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('الحد الأقصى للموظفين يجب أن يكون بين 1 و 10000'),
  
  body('max_devices')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('الحد الأقصى للأجهزة يجب أن يكون بين 1 و 1000'),
  
  body('storage_limit_mb')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('حد التخزين يجب أن يكون بين 100 و 100000 MB'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('الإعدادات يجب أن تكون كائن JSON'),
  
  validate
];

/**
 * Validation for updating an organization
 */
export const updateOrganizationValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة غير صالح'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('اسم المؤسسة مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم المؤسسة يجب أن يكون بين 2 و 255 حرف'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\s()-]+$/)
    .withMessage('رقم الهاتف غير صالح')
    .isLength({ max: 20 })
    .withMessage('رقم الهاتف يجب ألا يتجاوز 20 حرف'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('العنوان يجب ألا يتجاوز 500 حرف'),
  
  body('subscription_plan')
    .optional()
    .isIn(['free', 'basic', 'pro', 'enterprise'])
    .withMessage('خطة الاشتراك يجب أن تكون: free, basic, pro, أو enterprise'),
  
  body('subscription_start')
    .optional()
    .isISO8601()
    .withMessage('تاريخ بداية الاشتراك غير صالح'),
  
  body('subscription_end')
    .optional()
    .isISO8601()
    .withMessage('تاريخ نهاية الاشتراك غير صالح'),
  
  body('max_employees')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('الحد الأقصى للموظفين يجب أن يكون بين 1 و 10000'),
  
  body('max_devices')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('الحد الأقصى للأجهزة يجب أن يكون بين 1 و 1000'),
  
  body('storage_limit_mb')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('حد التخزين يجب أن يكون بين 100 و 100000 MB'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('الإعدادات يجب أن تكون كائن JSON'),
  
  validate
];

/**
 * Validation for organization ID parameter
 */
export const organizationIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة غير صالح'),
  
  validate
];

/**
 * Validation for listing organizations
 */
export const listOrganizationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون أكبر من 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('حد العناصر يجب أن يكون بين 1 و 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('نص البحث يجب ألا يتجاوز 255 حرف'),
  
  query('subscription_plan')
    .optional()
    .isIn(['free', 'basic', 'pro', 'enterprise'])
    .withMessage('خطة الاشتراك يجب أن تكون: free, basic, pro, أو enterprise'),
  
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  query('sort_by')
    .optional()
    .isIn(['name', 'email', 'subscription_plan', 'created_at', 'updated_at'])
    .withMessage('حقل الترتيب غير صالح'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('اتجاه الترتيب يجب أن يكون ASC أو DESC'),
  
  validate
];

/**
 * Validation for updating subscription
 */
export const updateSubscriptionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة غير صالح'),
  
  body('subscription_plan')
    .notEmpty()
    .withMessage('خطة الاشتراك مطلوبة')
    .isIn(['free', 'basic', 'pro', 'enterprise'])
    .withMessage('خطة الاشتراك يجب أن تكون: free, basic, pro, أو enterprise'),
  
  body('subscription_start')
    .optional()
    .isISO8601()
    .withMessage('تاريخ بداية الاشتراك غير صالح'),
  
  body('subscription_end')
    .notEmpty()
    .withMessage('تاريخ نهاية الاشتراك مطلوب')
    .isISO8601()
    .withMessage('تاريخ نهاية الاشتراك غير صالح')
    .custom((value, { req }) => {
      const startDate = req.body.subscription_start ? new Date(req.body.subscription_start) : new Date();
      if (new Date(value) <= startDate) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      }
      return true;
    }),
  
  body('max_employees')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('الحد الأقصى للموظفين يجب أن يكون بين 1 و 10000'),
  
  body('max_devices')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('الحد الأقصى للأجهزة يجب أن يكون بين 1 و 1000'),
  
  body('storage_limit_mb')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('حد التخزين يجب أن يكون بين 100 و 100000 MB'),
  
  validate
];

/**
 * Validation for updating organization settings
 */
export const updateSettingsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة غير صالح'),
  
  body()
    .isObject()
    .withMessage('الإعدادات يجب أن تكون كائن JSON'),
  
  validate
];
