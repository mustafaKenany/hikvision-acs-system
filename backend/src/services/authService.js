/**
 * Authentication Service
 * منطق الأعمال للمصادقة والتوثيق
 */

import models from '../models/index.js';
import { hashPassword, comparePassword, generateRandomPassword } from '../utils/bcrypt.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import crypto from 'crypto';

const { User, Organization, AuditLog } = models;

class AuthService {
  /**
   * تسجيل دخول مستخدم
   */
  async login(email, password, ipAddress) {
    // البحث عن المستخدم
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'subscription_plan', 'subscription_end']
        }
      ]
    });

    // التحقق من وجود المستخدم
    if (!user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // التحقق من حالة الحساب
    if (!user.is_active) {
      throw new Error('حسابك معطل - يرجى التواصل مع الإدارة');
    }

    // التحقق من صلاحية الاشتراك
    if (user.organization && user.organization.subscription_end) {
      const now = new Date();
      const validUntil = new Date(user.organization.subscription_end);

      if (now > validUntil) {
        throw new Error('انتهت صلاحية اشتراك المؤسسة - يرجى التجديد');
      }
    }

    // إنشاء tokens
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    // تحديث last_login_at
    await user.update({
      last_login_at: new Date()
    });

    // تسجيل في audit_logs
    await AuditLog.create({
      user_id: user.id,
      organization_id: user.organization_id,
      action: 'login',
      resource_type: 'auth',
      resource_id: user.id,
      description: `تسجيل دخول بنجاح: ${user.email}`,
      new_values: { ip_address: ipAddress },
      ip_address: ipAddress
    });

    // إرجاع بيانات المستخدم و tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        custom_permissions: user.custom_permissions,
        organization: user.organization
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * تسجيل خروج مستخدم
   */
  async logout(userId, ipAddress) {
    // تسجيل في audit_logs
    const user = await User.findByPk(userId);

    if (user) {
      await AuditLog.create({
        user_id: userId,
        organization_id: user.organization_id,
        action: 'logout',
        resource_type: 'auth',
        resource_id: userId,
        description: `تسجيل خروج: ${user.email}`,
        new_values: { ip_address: ipAddress },
        ip_address: ipAddress
      });
    }

    // في المستقبل: إضافة token إلى blacklist (Redis)
    // await redis.set(`blacklist:${token}`, 'true', 'EX', JWT_EXPIRES_IN);

    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  /**
   * تجديد access token باستخدام refresh token
   */
  async refreshAccessToken(refreshToken) {
    // التحقق من refresh token تم في middleware
    // هنا نحتاج فقط userId من req.user

    // إنشاء access token جديد
    const user = await User.findByPk(req.user.id);

    if (!user || !user.is_active) {
      throw new Error('المستخدم غير موجود أو معطل');
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    });

    return { accessToken };
  }

  /**
   * طلب إعادة تعيين كلمة المرور
   */
  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // لا نكشف إذا كان البريد موجوداً أم لا (security)
      return { message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين' };
    }

    // إنشاء reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // حفظ في database
    await user.update({
      reset_token_hash: resetTokenHash,
      reset_token_expires_at: resetTokenExpires
    });

    // تسجيل في audit_logs
    await AuditLog.create({
      user_id: user.id,
      organization_id: user.organization_id,
      resource_type: 'auth',
      resource_id: user.id,
      description: `طلب إعادة تعيين كلمة المرور: ${user.email}`,
      new_valuy_id: user.id,
      changes: { email: user.email }
    });

    // في المستقبل: إرسال email مع الرابط
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'إعادة تعيين كلمة المرور', resetUrl);

    return {
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      resetToken // في المستقبل: لا نرجع هذا في production، فقط للتطوير
    };
  }

  /**
   * إعادة تعيين كلمة المرور
   */
  async resetPassword(token, newPassword) {
    // Hash token للبحث
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // البحث عن المستخدم
    const user = await User.findOne({
      where: {
        reset_token_hash: resetTokenHash
      }
    });

    if (!user) {
      throw new Error('رمز إعادة التعيين غير صالح');
    }

    // التحقق من صلاحية token
    if (user.reset_token_expires_at < new Date()) {
      throw new Error('رمز إعادة التعيين منتهي الصلاحية');
    }

    // Hash password جديد
    const hashedPassword = await hashPassword(newPassword);

    // تحديث password و حذف reset token
    await user.update({
      password: hashedPassword,
      reset_token_hash: null,
      reset_token_expires_at: null
    });

    // تسجيل في audit_logs
    await AuditLog.create({
      user_id: user.id,
      resource_type: 'auth',
      resource_id: user.id,
      description: `إعادة تعيين كلمة المرور بنجاح: ${user.email}`,
      new_valuy_type: 'auth',
      entity_id: user.id,
      changes: { success: true }
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /**
   * تغيير كلمة المرور (للمستخدم المسجل دخول)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // التحقق من كلمة المرور الحالية
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('كلمة المرور الحالية غير صحيحة');
    }

    // Hash password جديد
    const hashedPassword = await hashPassword(newPassword);

    // تحديث password
    await user.update({
      password: hashedPassword
    });

    // تسجيل في audit_logs
    await AuditLog.create({
      resource_type: 'auth',
      resource_id: user.id,
      description: `تغيير كلمة المرور بنجاح: ${user.email}`,
      new_valun: 'password_changed',
      entity_type: 'auth',
      entity_id: user.id,
      changes: { success: true }
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /**
   * جلب معلومات المستخدم الحالي
   */
  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'reset_token_hash', 'reset_token_expires_at'] },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'subscription_plan', 'subscription_end', 'max_employees', 'max_devices']
        }
      ]
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    return user;
  }
}

export default new AuthService();
