/**
 * Authentication Controller
 * معالجات طلبات المصادقة
 */

import authService from '../services/authService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { AppError } from '../middlewares/errorHandler.js';

class AuthController {
  /**
   * POST /api/auth/login
   * تسجيل الدخول
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
const ipAddress = req.ip;

    const result = await authService.login(email, password, ipAddress);

    return success(res, result, 'تم تسجيل الدخول بنجاح');
  });

  /**
   * POST /api/auth/logout
   * تسجيل الخروج
   */
  logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const ipAddress = req.ip;

    const result = await authService.logout(userId, ipAddress);

    return success(res, result, 'تم تسجيل الخروج بنجاح');
  });

  /**
   * POST /api/auth/refresh-token
   * تجديد access token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(req.user);

    return success(res, result, 'تم تجديد رمز التوثيق بنجاح');
  });

  /**
   * GET /api/auth/me
   * جلب معلومات المستخدم الحالي
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    return success(res, user);
  });

  /**
   * POST /api/auth/forgot-password
   * طلب إعادة تعيين كلمة المرور
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return success(res, result);
  });

  /**
   * POST /api/auth/reset-password
   * إعادة تعيين كلمة المرور
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    return success(res, result);
  });

  /**
   * POST /api/auth/change-password
   * تغيير كلمة المرور (للمستخدم المسجل دخول)
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return success(res, result);
  });
}

export default new AuthController();
