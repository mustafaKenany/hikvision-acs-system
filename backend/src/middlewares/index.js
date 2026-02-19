/**
 * Centralized Middleware Exports
 * تصدير جميع middlewares من مكان واحد
 */

// Error Handling
export { errorHandler, notFoundHandler, AppError } from './errorHandler.js';

// Async Handler
export { default as asyncHandler } from './asyncHandler.js';

// Authentication & Authorization
export { authenticate, optionalAuth } from './auth.js';
export { authorize, checkOrganization, checkOwnership } from './authorize.js';

// Validation
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
} from './validate.js';

// Rate Limiting
export {
  generalLimiter,
  loginLimiter,
  uploadLimiter,
  passwordResetLimiter,
  strictLimiter,
  readLimiter,
  deviceLimiter,
  createRateLimiter
} from './rateLimiter.js';

// Request Logging
export { requestLogger, morganLogger, errorLogger } from './requestLogger.js';

// Cache Middleware
export {
  cacheMiddleware,
  clearCacheByPattern,
  clearOrganizationCache,
  clearUserCache,
  clearCacheAfterMutation,
  getCacheStats,
  flushAllCache,
  CACHE_TTL
} from './cache.js';

// Security Middleware
export {
  sanitizeInput,
  preventSQLInjection,
  preventNoSQLInjection,
  csrfProtection,
  blockSuspiciousUserAgents,
  preventParameterPollution,
  validateContentType,
  additionalSecurityHeaders,
  logSecurityEvent
} from './security.js';
