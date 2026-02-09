/**
 * Global Error Handler Middleware
 * معالج الأخطاء العام للتطبيق
 * 
 * يعالج جميع أنواع الأخطاء:
 * - Sequelize errors (Validation, Unique, Foreign Key)
 * - JWT errors (Token expired, Invalid token)
 * - Custom application errors
 * - 404 Not Found
 */

import logger from '../utils/logger.js';
import { serverError, validationError as validationErrorResponse } from '../utils/response.js';

// Sequelize error names
const SEQUELIZE_ERRORS = {
  ValidationError: 'SequelizeValidationError',
  UniqueConstraintError: 'SequelizeUniqueConstraintError',
  ForeignKeyConstraintError: 'SequelizeForeignKeyConstraintError',
  DatabaseError: 'SequelizeDatabaseError'
};

/**
 * معالجة أخطاء Sequelize Validation
 */
const handleValidationError = (err) => {
  const errors = err.errors?.map(e => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));

  return {
    statusCode: 400,
    message: 'خطأ في التحقق من البيانات',
    errors
  };
};

/**
 * معالجة أخطاء Unique Constraint
 */
const handleUniqueConstraintError = (err) => {
  const field = err.errors?.[0]?.path || 'unknown';
  const value = err.errors?.[0]?.value;

  return {
    statusCode: 409,
    message: `القيمة ${value} موجودة مسبقاً في حقل ${field}`,
    errors: [{
      field,
      message: `${field} must be unique`,
      value
    }]
  };
};

/**
 * معالجة أخطاء Foreign Key
 */
const handleForeignKeyError = (err) => {
  return {
    statusCode: 400,
    message: 'خطأ في العلاقة بين الجداول - البيانات المرتبطة غير موجودة',
    errors: [{
      message: err.message
    }]
  };
};

/**
 * معالجة أخطاء JWT
 */
const handleJWTError = (err) => {
  const jwtErrors = {
    'JsonWebTokenError': {
      statusCode: 401,
      message: 'رمز التوثيق غير صالح'
    },
    'TokenExpiredError': {
      statusCode: 401,
      message: 'رمز التوثيق منتهي الصلاحية'
    },
    'NotBeforeError': {
      statusCode: 401,
      message: 'رمز التوثيق غير نشط بعد'
    }
  };

  return jwtErrors[err.name] || {
    statusCode: 401,
    message: 'خطأ في رمز التوثيق'
  };
};

/**
 * معالج الأخطاء العام
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'unauthenticated'
  });

  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'حدث خطأ في الخادم',
    errors: err.errors || [],
    details: err.details || err.errors || []  // Support both details and errors
  };

  // Sequelize Validation Error
  if (err.name === SEQUELIZE_ERRORS.ValidationError) {
    error = handleValidationError(err);
  }
  
  // Sequelize Unique Constraint Error
  else if (err.name === SEQUELIZE_ERRORS.UniqueConstraintError) {
    error = handleUniqueConstraintError(err);
  }
  
  // Sequelize Foreign Key Error
  else if (err.name === SEQUELIZE_ERRORS.ForeignKeyConstraintError) {
    error = handleForeignKeyError(err);
  }
  
  // JWT Errors
  else if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name)) {
    error = handleJWTError(err);
  }

  // في production: لا نكشف تفاصيل الأخطاء الداخلية
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'حدث خطأ في الخادم';
    error.errors = [];
  }

  // إرسال الاستجابة
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    details: error.details,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

/**
 * معالج 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`الصفحة غير موجودة - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.details = null;  // يمكن تعيينها لاحقاً
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, notFoundHandler, AppError };
