/**
 * Request Logger Middleware
 * تسجيل طلبات HTTP
 * 
 * يسجل معلومات عن كل طلب:
 * - Method, URL, Status Code
 * - Response Time
 * - IP Address, User Agent
 * - User ID (إذا مسجل دخول)
 */

import logger from '../utils/logger.js';

/**
 * HTTP Request Logger
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // تسجيل الطلب الوارد
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user?.id || 'unauthenticated'
  });

  // Capture response
  const originalSend = res.send;
  
  res.send = function (data) {
    const responseTime = Date.now() - startTime;

    // تسجيل الاستجابة
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    const statusEmoji = res.statusCode >= 500 ? '❌' : 
                       res.statusCode >= 400 ? '⚠️' : 
                       '✅';

    logger[logLevel](`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      user: req.user?.id || 'unauthenticated',
      contentLength: res.get('content-length')
    });

    // استدعاء الـ send الأصلي
    originalSend.apply(res, arguments);
  };

  next();
};

/**
 * Morgan-style request logger (اختياري)
 * يمكن استخدامه مع morgan package
 */
const morganLogger = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    '|',
    req.ip,
    '|',
    req.user?.id || 'unauthenticated'
  ].join(' ');
};

/**
 * Error Logger
 * تسجيل الأخطاء مع معلومات إضافية
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: req.user?.id || 'unauthenticated',
    body: req.body,
    params: req.params,
    query: req.query
  });

  next(err);
};

export { requestLogger, morganLogger, errorLogger };
