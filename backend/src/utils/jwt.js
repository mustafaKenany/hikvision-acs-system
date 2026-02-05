import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 * @param {Object} payload - Data to encode in token
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Data to encode in token
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
