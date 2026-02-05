/**
 * Standard API Response utility
 * Provides consistent response format across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Validation errors or additional error info
 */
export const error = (res, message = 'Error occurred', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
export const created = (res, data = null, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
export const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
export const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const unauthorized = (res, message = 'Unauthorized access') => {
  return error(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
export const forbidden = (res, message = 'Access forbidden') => {
  return error(res, message, 403);
};

/**
 * Validation error response (422)
 * @param {Object} res - Express response object
 * @param {*} errors - Validation errors
 * @param {string} message - Error message
 */
export const validationError = (res, errors, message = 'Validation failed') => {
  return error(res, message, 422, errors);
};

/**
 * Internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const serverError = (res, message = 'Internal server error') => {
  return error(res, message, 500);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Success message
 */
export const paginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  });
};

export default {
  success,
  error,
  created,
  noContent,
  notFound,
  unauthorized,
  forbidden,
  validationError,
  serverError,
  paginated
};
