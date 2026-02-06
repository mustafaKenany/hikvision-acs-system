/**
 * Authentication Middleware
 * التحقق من JWT Token وتحميل بيانات المستخدم
 */

import { verifyToken } from '../utils/jwt.js';
import models from '../models/index.js';
import { AppError } from './errorHandler.js';
import asyncHandler from './asyncHandler.js';

const { User, Organization } = models;

/**
 * التحقق من وجود وصحة JWT token
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // 1. استخراج token من header
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. التحقق من وجود token
  if (!token) {
    throw new AppError('غير مصرح - يرجى تسجيل الدخول', 401);
  }

  try {
    // 3. التحقق من صحة token
    const decoded = verifyToken(token);

    // 4. جلب المستخدم من database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'reset_token_hash', 'reset_token_expires_at'] },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'subscription_plan', 'subscription_end']
        }
      ]
    });

    // 5. التحقق أن المستخدم موجود
    if (!user) {
      throw new AppError('المستخدم غير موجود أو تم حذفه', 401);
    }

    // 6. التحقق أن الحساب نشط
    if (!user.is_active) {
      throw new AppError('حسابك معطل - يرجى التواصل مع الإدارة', 403);
    }

    // 7. التحقق من صلاحية الاشتراك (للمؤسسة)
    if (user.organization && user.organization.subscription_end) {
      const now = new Date();
      const validUntil = new Date(user.organization.subscription_end);

      if (now > validUntil) {
        throw new AppError('انتهت صلاحية اشتراك المؤسسة - يرجى التجديد', 403);
      }
    }

    // 8. إضافة المستخدم إلى request object
    req.user = user;

    next();
  } catch (error) {
    // معالجة أخطاء JWT (token expired, invalid, etc.)
    if (error.name === 'TokenExpiredError') {
      throw new AppError('انتهت صلاحية رمز التوثيق - يرجى تسجيل الدخول مرة أخرى', 401);
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('رمز التوثيق غير صالح', 401);
    }

    // إعادة رمي الخطأ ليتم معالجته بواسطة error handler
    throw error;
  }
});

/**
 * التحقق من token (اختياري - لا يرمي خطأ إذا لم يكن موجوداً)
 * مفيد للـ endpoints التي تعمل مع وبدون authentication
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'reset_token_hash', 'reset_token_expires_at'] },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'subscription_type']
        }
      ]
    });

    if (user && user.is_active) {
      req.user = user;
    }
  } catch (error) {
    // نتجاهل الأخطاء في optional auth
    // ونستمر بدون user
  }

  next();
});

/**
 * Authorization middleware to check user roles
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      throw new AppError('غير مصرح - يرجى تسجيل الدخول', 401);
    }

    // Convert single role to array
    if (typeof roles === 'string') {
      roles = [roles];
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      throw new AppError('ليس لديك صلاحية للوصول إلى هذا المورد', 403);
    }

    next();
  };
};

export { authenticate, optionalAuth, authorize };
