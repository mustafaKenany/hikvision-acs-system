/**
 * Security Middleware
 * حماية ضد XSS, SQL Injection, CSRF وغيرها
 */

import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Sanitize input to prevent XSS attacks
 * تنظيف المدخلات من أكواد XSS الخبيثة
 */
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Error in sanitizeInput middleware:', error);
    next();
  }
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
};

/**
 * Sanitize individual value
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove potential XSS code using regex
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/eval\(/gi, '') // Remove eval
      .trim();
  }
  return value;
};

/**
 * SQL Injection Protection
 * منع SQL Injection (استخدام Sequelize ORM يوفر حماية تلقائية)
 * هذا middleware إضافي للفحص
 */
export const preventSQLInjection = (req, res, next) => {
  try {
    const suspiciousPatterns = [
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(\bINSERT\b.*\bINTO\b)/gi,
      /(\bDROP\b.*\bTABLE\b)/gi,
      /(\bDELETE\b.*\bFROM\b)/gi,
      /(\bUPDATE\b.*\bSET\b)/gi,
      /(\bEXEC\b.*\()/gi,
      /(--|;|\/\*|\*\/|xp_)/gi
    ];

    const checkForSQLInjection = (value) => {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return true;
          }
        }
      }
      return false;
    };

    const checkObject = (obj) => {
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
          if (checkObject(value)) return true;
        } else {
          if (checkForSQLInjection(value)) return true;
        }
      }
      return false;
    };

    // Check all inputs
    if (
      checkObject(req.body || {}) ||
      checkObject(req.query || {}) ||
      checkObject(req.params || {})
    ) {
      logger.warn('Potential SQL injection attempt detected', {
        ip: req.ip,
        path: req.path,
        user: req.user?.id
      });

      return res.status(400).json({
        success: false,
        message: 'محاولة إدخال غير صالحة'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in preventSQLInjection middleware:', error);
    next();
  }
};

/**
 * NoSQL Injection Protection
 * منع NoSQL Injection (للاستخدام مع MongoDB إذا تم استخدامه)
 */
export const preventNoSQLInjection = (req, res, next) => {
  try {
    const checkForNoSQLInjection = (obj) => {
      if (typeof obj !== 'object' || obj === null) return false;

      for (const [key, value] of Object.entries(obj)) {
        // Check for MongoDB operators
        if (key.startsWith('$')) {
          return true;
        }

        // Recursively check nested objects
        if (typeof value === 'object' && value !== null) {
          if (checkForNoSQLInjection(value)) return true;
        }
      }

      return false;
    };

    if (
      checkForNoSQLInjection(req.body || {}) ||
      checkForNoSQLInjection(req.query || {}) ||
      checkForNoSQLInjection(req.params || {})
    ) {
      logger.warn('Potential NoSQL injection attempt detected', {
        ip: req.ip,
        path: req.path,
        user: req.user?.id
      });

      return res.status(400).json({
        success: false,
        message: 'محاولة إدخال غير صالحة'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in preventNoSQLInjection middleware:', error);
    next();
  }
};

/**
 * CSRF Protection for state-changing operations
 * حماية من CSRF للعمليات التي تغير البيانات
 */
export const csrfProtection = (req, res, next) => {
  try {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Check CSRF token
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken || req.user?.csrfToken;

    if (!csrfToken || csrfToken !== sessionToken) {
      logger.warn('CSRF token mismatch', {
        ip: req.ip,
        path: req.path,
        user: req.user?.id
      });

      return res.status(403).json({
        success: false,
        message: 'طلب غير صالح - CSRF token مفقود أو خاطئ'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in csrfProtection middleware:', error);
    next();
  }
};

/**
 * Block suspicious user agents
 * حظر user agents مشبوهة
 */
export const blockSuspiciousUserAgents = (req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'] || '';

    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /scanner/i,
      /bot(?!omator)/i, // Block bots except legitimate ones
      /crawl/i,
      /spider/i,
      /scraper/i
    ];

    // Whitelist legitimate bots
    const whitelistedBots = [
      /googlebot/i,
      /bingbot/i,
      /slackbot/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const isWhitelisted = whitelistedBots.some(pattern => pattern.test(userAgent));

    if (isSuspicious && !isWhitelisted) {
      logger.warn('Suspicious user agent blocked', {
        ip: req.ip,
        userAgent,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'محظور'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in blockSuspiciousUserAgents middleware:', error);
    next();
  }
};

/**
 * Prevent parameter pollution
 * منع تلويث المعاملات
 */
export const preventParameterPollution = (req, res, next) => {
  try {
    // Check for duplicate query parameters
    const queryKeys = Object.keys(req.query);
    const hasDuplicates = queryKeys.some(key => Array.isArray(req.query[key]));

    if (hasDuplicates) {
      logger.warn('Parameter pollution attempt detected', {
        ip: req.ip,
        path: req.path,
        query: req.query
      });

      // Keep only the first value
      for (const key of queryKeys) {
        if (Array.isArray(req.query[key])) {
          req.query[key] = req.query[key][0];
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Error in preventParameterPollution middleware:', error);
    next();
  }
};

/**
 * Validate content type for JSON APIs
 * التحقق من content type
 */
export const validateContentType = (req, res, next) => {
  try {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];

      if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
        return res.status(415).json({
          success: false,
          message: 'Content-Type يجب أن يكون application/json أو multipart/form-data'
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error in validateContentType middleware:', error);
    next();
  }
};

/**
 * Security headers middleware (additional to helmet)
 * إضافة security headers إضافية
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Log security events
 * تسجيل الأحداث الأمنية
 */
export const logSecurityEvent = (type, req, details = {}) => {
  logger.warn(`Security Event: ${type}`, {
    ip: req.ip,
    path: req.path,
    method: req.method,
    user: req.user?.id,
    userAgent: req.headers['user-agent'],
    ...details
  });
};

export default {
  sanitizeInput,
  preventSQLInjection,
  preventNoSQLInjection,
  csrfProtection,
  blockSuspiciousUserAgents,
  preventParameterPollution,
  validateContentType,
  additionalSecurityHeaders,
  logSecurityEvent
};
