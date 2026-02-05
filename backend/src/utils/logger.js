/**
 * Simple Logger Utility
 * For production, consider using winston or pino
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m'
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {*} data - Additional data
 * @returns {string} - Formatted log message
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level] || LOG_COLORS.RESET;
  const reset = LOG_COLORS.RESET;
  
  let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
  
  if (data !== null && data !== undefined) {
    logMessage += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return logMessage;
};

/**
 * Check if logging is enabled for the level
 * @param {string} level - Log level to check
 * @returns {boolean} - True if logging is enabled
 */
const isLevelEnabled = (level) => {
  const currentLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  return levels.indexOf(level) >= levels.indexOf(currentLevel);
};

/**
 * Debug log
 * @param {string} message - Log message
 * @param {*} data - Additional data
 */
export const debug = (message, data = null) => {
  if (isLevelEnabled(LOG_LEVELS.DEBUG)) {
    console.log(formatMessage(LOG_LEVELS.DEBUG, message, data));
  }
};

/**
 * Info log
 * @param {string} message - Log message
 * @param {*} data - Additional data
 */
export const info = (message, data = null) => {
  if (isLevelEnabled(LOG_LEVELS.INFO)) {
    console.log(formatMessage(LOG_LEVELS.INFO, message, data));
  }
};

/**
 * Warning log
 * @param {string} message - Log message
 * @param {*} data - Additional data
 */
export const warn = (message, data = null) => {
  if (isLevelEnabled(LOG_LEVELS.WARN)) {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, data));
  }
};

/**
 * Error log
 * @param {string} message - Log message
 * @param {Error|*} error - Error object or additional data
 */
export const error = (message, error = null) => {
  if (isLevelEnabled(LOG_LEVELS.ERROR)) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(formatMessage(LOG_LEVELS.ERROR, message, errorData));
  }
};

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 */
export const logRequest = (req) => {
  if (isLevelEnabled(LOG_LEVELS.DEBUG)) {
    const data = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    debug('HTTP Request', data);
  }
};

/**
 * Log HTTP response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in ms
 */
export const logResponse = (req, res, responseTime) => {
  if (isLevelEnabled(LOG_LEVELS.INFO)) {
    const data = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    };
    info('HTTP Response', data);
  }
};

export default {
  debug,
  info,
  warn,
  error,
  logRequest,
  logResponse
};
