import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new user
 */
export const createUserValidator = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/[A-Z]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير')
    .matches(/[a-z]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف صغير')
    .matches(/[0-9]/)
    .withMessage('كلمة المرور يجب أن تحتوي على رقم')
    .matches(/[@$!%*?&#]/)
    .withMessage('كلمة المرور يجب أن تحتوي على رمز خاص'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  
  body('phone')
    .optional()
    .matches(/^\+964[0-9]{10}$/)
    .withMessage('رقم الهاتف يجب أن يكون بصيغة عراقية: +964XXXXXXXXXX'),
  
  body('role')
    .isIn(['super_admin', 'admin', 'manager', 'viewer', 'custom'])
    .withMessage('الدور غير صالح'),
  
  body('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  body('custom_permissions')
    .optional()
    .isArray()
    .withMessage('الصلاحيات المخصصة يجب أن تكون مصفوفة'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  validate
];

/**
 * Validation for updating a user
 */
export const updateUserValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المستخدم غير صالح'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/[A-Z]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير')
    .matches(/[a-z]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف صغير')
    .matches(/[0-9]/)
    .withMessage('كلمة المرور يجب أن تحتوي على رقم')
    .matches(/[@$!%*?&#]/)
    .withMessage('كلمة المرور يجب أن تحتوي على رمز خاص'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  
  body('phone')
    .optional()
    .matches(/^\+964[0-9]{10}$/)
    .withMessage('رقم الهاتف يجب أن يكون بصيغة عراقية: +964XXXXXXXXXX'),
  
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'viewer', 'custom'])
    .withMessage('الدور غير صالح'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  validate
];

/**
 * Validation for user ID parameter
 */
export const userIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المستخدم غير صالح'),
  
  validate
];

/**
 * Validation for updating permissions
 */
export const updatePermissionsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف المستخدم غير صالح'),
  
  body('permissions')
    .isArray()
    .withMessage('الصلاحيات يجب أن تكون مصفوفة')
    .custom((value) => {
      // Validate each permission string
      const validPermissionPattern = /^[a-z_]+\.(create|read|update|delete|manage|all)$/;
      return value.every(perm => validPermissionPattern.test(perm));
    })
    .withMessage('صيغة الصلاحيات غير صالحة. مثال: users.create, devices.read'),
  
  validate
];

/**
 * Validation for query parameters (list users)
 */
export const listUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً موجباً'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('حد العناصر يجب أن يكون بين 1 و 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('نص البحث يجب أن يكون بين 1 و 100 حرف'),
  
  query('role')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'operator', 'viewer'])
    .withMessage('الدور المحدد غير صالح'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  query('sort_by')
    .optional()
    .isIn(['created_at', 'email', 'first_name', 'last_name', 'role'])
    .withMessage('حقل الترتيب غير صالح'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('اتجاه الترتيب يجب أن يكون ASC أو DESC'),
  
  validate
];
