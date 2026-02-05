/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
export const isValidPassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is valid' };
};

/**
 * Validate phone number (Iraqi format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
export const isValidPhone = (phone) => {
  // Iraqi phone formats: 07XXXXXXXXX or +9647XXXXXXXXX
  const phoneRegex = /^(\+964|0)?7[3-9]\d{8}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
};

/**
 * Validate IP address
 * @param {string} ip - IP address to validate
 * @returns {boolean} - True if valid IP
 */
export const isValidIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
};

/**
 * Validate MAC address
 * @param {string} mac - MAC address to validate
 * @returns {boolean} - True if valid MAC
 */
export const isValidMAC = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

/**
 * Validate serial number format
 * @param {string} serial - Serial number to validate
 * @returns {boolean} - True if valid serial
 */
export const isValidSerialNumber = (serial) => {
  // HikVision serial format: Usually alphanumeric, 12-20 chars
  const serialRegex = /^[A-Z0-9]{12,20}$/i;
  return serialRegex.test(serial);
};

/**
 * Validate employee number
 * @param {string} empNo - Employee number to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmployeeNo = (empNo) => {
  // Alphanumeric, 1-50 chars
  const empNoRegex = /^[A-Z0-9-_]{1,50}$/i;
  return empNoRegex.test(empNo);
};

/**
 * Sanitize string input (remove dangerous characters)
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input) return '';
  return input.toString()
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Validate date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {boolean} - True if valid range
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return start <= end;
};

/**
 * Validate port number
 * @param {number} port - Port number to validate
 * @returns {boolean} - True if valid port
 */
export const isValidPort = (port) => {
  const portNum = parseInt(port);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidIP,
  isValidMAC,
  isValidSerialNumber,
  isValidEmployeeNo,
  sanitizeString,
  isValidDateRange,
  isValidPort
};
