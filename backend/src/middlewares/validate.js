/**
 * Validation Middleware
 * التحقق من صحة البيانات باستخدام express-validator
 */

import { validationResult, body, param, query } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * معالج نتائج التحقق
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    throw new AppError('خطأ في التحقق من البيانات', 400, formattedErrors);
  }

  next();
};

/**
 * Validation Rules للحقول الشائعة
 */

// Email validation
const emailValidation = () => 
  body('email')
    .trim()
    .isEmail().withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail();

// Password validation (قوي)
const passwordValidation = (field = 'password') => 
  body(field)
    .isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/[A-Z]/).withMessage('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .matches(/[a-z]/).withMessage('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .matches(/[0-9]/).withMessage('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
    .matches(/[@$!%*?&#]/).withMessage('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (@$!%*?&#)');

// Phone validation (عراقي)
const phoneValidation = (field = 'phone', required = false) => {
  const validation = body(field)
    .trim();

  if (required) {
    validation.notEmpty().withMessage('رقم الهاتف مطلوب');
  } else {
    validation.optional();
  }

  return validation
    .matches(/^\+964[0-9]{10}$/).withMessage('رقم الهاتف يجب أن يكون بصيغة +964XXXXXXXXXX');
};

// ID validation (في params)
const idValidation = (paramName = 'id') =>
  param(paramName)
    .isInt({ min: 1 }).withMessage(`${paramName} يجب أن يكون رقماً صحيحاً موجباً`)
    .toInt();

// Required string validation
const requiredString = (field, minLength = 1, maxLength = 255) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} مطلوب`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} يجب أن يكون بين ${minLength} و ${maxLength} حرف`);

// Optional string validation
const optionalString = (field, minLength = 1, maxLength = 255) =>
  body(field)
    .optional()
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} يجب أن يكون بين ${minLength} و ${maxLength} حرف`);

// Boolean validation
const booleanValidation = (field, required = false) => {
  const validation = body(field);
  
  if (required) {
    validation.notEmpty().withMessage(`${field} مطلوب`);
  } else {
    validation.optional();
  }

  return validation
    .isBoolean().withMessage(`${field} يجب أن يكون true أو false`)
    .toBoolean();
};

// Date validation
const dateValidation = (field, required = false) => {
  const validation = body(field);

  if (required) {
    validation.notEmpty().withMessage(`${field} مطلوب`);
  } else {
    validation.optional();
  }

  return validation
    .isISO8601().withMessage(`${field} يجب أن يكون تاريخ صالح بصيغة ISO 8601`)
    .toDate();
};

// IP Address validation
const ipAddressValidation = (field = 'ip_address') =>
  body(field)
    .trim()
    .notEmpty().withMessage('عنوان IP مطلوب')
    .isIP().withMessage('عنوان IP غير صالح');

// MAC Address validation
const macAddressValidation = (field = 'mac_address') =>
  body(field)
    .optional()
    .trim()
    .matches(/^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/)
    .withMessage('عنوان MAC غير صالح (الصيغة الصحيحة: AA:BB:CC:DD:EE:FF)');

// Port validation
const portValidation = (field = 'port') =>
  body(field)
    .optional()
    .isInt({ min: 1, max: 65535 }).withMessage('رقم المنفذ يجب أن يكون بين 1 و 65535')
    .toInt();

// Role validation
const roleValidation = () =>
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'operator', 'viewer'])
    .withMessage('الدور غير صالح (super_admin, admin, manager, operator, viewer)');

// Pagination validation
const paginationValidation = () => [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقماً موجباً')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('الحد الأقصى للعناصر يجب أن يكون بين 1 و 100')
    .toInt()
];

// Array validation
const arrayValidation = (field, itemType = 'string') => {
  const validation = body(field)
    .optional()
    .isArray().withMessage(`${field} يجب أن يكون مصفوفة`);

  // التحقق من نوع العناصر
  if (itemType === 'string') {
    validation.custom((value) => {
      return value.every(item => typeof item === 'string');
    }).withMessage(`جميع عناصر ${field} يجب أن تكون نصوص`);
  } else if (itemType === 'number') {
    validation.custom((value) => {
      return value.every(item => typeof item === 'number');
    }).withMessage(`جميع عناصر ${field} يجب أن تكون أرقام`);
  }

  return validation;
};

/**
 * Sanitization helpers
 */
const sanitize = {
  // إزالة HTML tags
  stripTags: (value) => {
    return value.replace(/<[^>]*>/g, '');
  },

  // إزالة المسافات الزائدة
  trimSpaces: (value) => {
    return value.trim().replace(/\s+/g, ' ');
  },

  // تحويل إلى lowercase
  toLowerCase: (value) => {
    return value.toLowerCase();
  }
};

export {
  validate,
  emailValidation,
  passwordValidation,
  phoneValidation,
  idValidation,
  requiredString,
  optionalString,
  booleanValidation,
  dateValidation,
  ipAddressValidation,
  macAddressValidation,
  portValidation,
  roleValidation,
  paginationValidation,
  arrayValidation,
  sanitize
};
