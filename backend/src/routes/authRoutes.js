/**
 * Authentication Routes
 * مسارات API للمصادقة
 */

import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { loginLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
} from '../validators/authValidator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    تسجيل الدخول
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  loginValidator,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    تسجيل الخروج
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    تجديد access token
 * @access  Private (requires refresh token)
 */
router.post(
  '/refresh-token',
  authenticate, // في المستقبل: استخدام middleware خاص بـ refresh token
  authController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    جلب معلومات المستخدم الحالي
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    طلب إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidator,
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post(
  '/reset-password',
  resetPasswordValidator,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/change-password
 * @desc    تغيير كلمة المرور (للمستخدم المسجل دخول)
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  changePasswordValidator,
  authController.changePassword
);

export default router;
