/**
 * Authentication Validators
 * قواعد التحقق من صحة بيانات المصادقة
 */

import { body } from 'express-validator';
import { 
  emailValidation,
  passwordValidation,
  validate 
} from '../middlewares/validate.js';

/**
 * Login validation
 */
const loginValidator = [
  emailValidation(),
  body('password')
    .trim()
    .notEmpty().withMessage('كلمة المرور مطلوبة'),
  validate
];

/**
 * Forgot password validation
 */
const forgotPasswordValidator = [
  emailValidation(),
  validate
];

/**
 * Reset password validation
 */
const resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty().withMessage('رمز إعادة التعيين مطلوب')
    .isLength({ min: 32, max: 128 }).withMessage('رمز إعادة التعيين غير صالح'),
  
  passwordValidation('newPassword'),
  
  validate
];

/**
 * Change password validation
 */
const changePasswordValidator = [
  body('currentPassword')
    .trim()
    .notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  
  passwordValidation('newPassword'),
  
  body('newPassword').custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
    }
    return true;
  }),
  
  validate
];

export {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
};
