/**
 * Rate Limiter Middleware
 * الحماية من الطلبات الكثيرة (Rate Limiting)
 * 
 * يستخدم express-rate-limit لتحديد عدد الطلبات المسموحة
 */

import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * معالج عند تجاوز الحد
 */
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    user: req.user?.id || 'unauthenticated'
  });

  return res.status(429).json({
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات - يرجى المحاولة لاحقاً',
    retryAfter: res.getHeader('Retry-After')
  });
};

/**
 * Rate limiter عام للـ API
 * 100 طلب كل دقيقة
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'تم تجاوز الحد المسموح من الطلبات',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: rateLimitHandler,
  skip: (req) => {
    // تجاوز rate limiting للـ super_admin (اختياري)
    return req.user?.role === 'super_admin';
  }
});

/**
 * Rate limiter للـ Login
 * 5 محاولات كل 15 دقيقة (حماية من brute force)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: 'تم تجاوز عدد محاولات تسجيل الدخول المسموحة - يرجى المحاولة بعد 15 دقيقة',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // لا نحسب المحاولات الناجحة
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // استخدام IP + email للتتبع
    return `${req.ip}-${req.body.email || 'unknown'}`;
  }
});

/**
 * Rate limiter لرفع الملفات
 * 10 طلبات كل دقيقة (لحماية السيرفر من الحمل الزائد)
 */
const uploadLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
  message: 'تم تجاوز الحد المسموح لرفع الملفات - يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Rate limiter لإعادة تعيين كلمة المرور
 * 3 طلبات كل ساعة (حماية من spam)
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'تم تجاوز عدد طلبات إعادة تعيين كلمة المرور - يرجى المحاولة بعد ساعة',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return `${req.ip}-${req.body.email || 'unknown'}`;
  }
});

/**
 * Rate limiter للـ API endpoints الحساسة
 * 20 طلب كل دقيقة
 */
const strictLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20,
  message: 'تم تجاوز الحد المسموح من الطلبات لهذا الإجراء',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Rate limiter خفيف للـ GET requests
 * 200 طلب كل دقيقة
 */
const readLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 200,
  message: 'تم تجاوز الحد المسموح من طلبات القراءة',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // تجاوز للمستخدمين المصادق عليهم
    return !!req.user;
  }
});

/**
 * Rate limiter للـ Device APIs
 * 50 طلب كل دقيقة (الأجهزة قد ترسل طلبات كثيرة)
 */
const deviceLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 50,
  message: 'تم تجاوز الحد المسموح من طلبات الجهاز',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // استخدام device IP أو MAC address
    return req.body.device_ip || req.ip;
  }
});

/**
 * Create custom rate limiter
 * @param {Number} windowMinutes - Window size in minutes
 * @param {Number} maxRequests - Max requests per window
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (windowMinutes, maxRequests) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
  });
};

export {
  generalLimiter,
  loginLimiter,
  uploadLimiter,
  passwordResetLimiter,
  strictLimiter,
  readLimiter,
  deviceLimiter,
  createRateLimiter
};
