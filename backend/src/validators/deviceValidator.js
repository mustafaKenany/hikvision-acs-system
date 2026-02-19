/**
 * Device Validator
 * التحقق من صحة بيانات الأجهزة
 */

import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new device
 */
export const createDeviceValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('اسم الجهاز مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الجهاز يجب أن يكون بين 2 و 255 حرف'),
  
  body('device_type')
    .notEmpty()
    .withMessage('نوع الجهاز مطلوب')
    .isIn(['face_recognition', 'card_reader', 'fingerprint', 'hybrid'])
    .withMessage('نوع الجهاز يجب أن يكون: face_recognition, card_reader, fingerprint, أو hybrid'),
  
  body('ip_address')
    .notEmpty()
    .withMessage('عنوان IP مطلوب')
    .isIP()
    .withMessage('عنوان IP غير صالح'),
  
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('رقم البورت يجب أن يكون بين 1 و 65535'),
  
  body('username')
    .notEmpty()
    .withMessage('اسم المستخدم مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المستخدم يجب أن يكون بين 2 و 100 حرف'),
  
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 4, max: 255 })
    .withMessage('كلمة المرور يجب أن تكون بين 4 و 255 حرف'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('موديل الجهاز يجب ألا يتجاوز 100 حرف'),
  
  body('serial_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('الرقم التسلسلي يجب ألا يتجاوز 100 حرف'),
  
  body('mac_address')
    .optional()
    .trim()
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    .withMessage('عنوان MAC غير صالح (مثال: 00:11:22:33:44:55)'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('الموقع يجب ألا يتجاوز 255 حرف'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب ألا يتجاوز 500 حرف'),
  
  body('firmware_version')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('إصدار الفيرموير يجب ألا يتجاوز 50 حرف'),
  
  body('max_faces')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى للوجوه يجب أن يكون رقماً صحيحاً'),
  
  body('max_cards')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى للبطاقات يجب أن يكون رقماً صحيحاً'),
  
  body('max_fingerprints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى لبصمات الأصابع يجب أن يكون رقماً صحيحاً'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  body('capabilities')
    .optional()
    .isObject()
    .withMessage('القدرات يجب أن تكون كائن JSON'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('الإعدادات يجب أن تكون كائن JSON'),
  
  body('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  validate
];

/**
 * Validation for updating a device
 */
export const updateDeviceValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجهاز غير صالح'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('اسم الجهاز مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('اسم الجهاز يجب أن يكون بين 2 و 255 حرف'),
  
  body('device_type')
    .optional()
    .isIn(['face_recognition', 'card_reader', 'fingerprint', 'hybrid'])
    .withMessage('نوع الجهاز يجب أن يكون: face_recognition, card_reader, fingerprint, أو hybrid'),
  
  body('ip_address')
    .optional()
    .isIP()
    .withMessage('عنوان IP غير صالح'),
  
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('رقم البورت يجب أن يكون بين 1 و 65535'),
  
  body('username')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المستخدم يجب أن يكون بين 2 و 100 حرف'),
  
  body('password')
    .optional()
    .isLength({ min: 4, max: 255 })
    .withMessage('كلمة المرور يجب أن تكون بين 4 و 255 حرف'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('موديل الجهاز يجب ألا يتجاوز 100 حرف'),
  
  body('serial_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('الرقم التسلسلي يجب ألا يتجاوز 100 حرف'),
  
  body('mac_address')
    .optional()
    .trim()
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    .withMessage('عنوان MAC غير صالح (مثال: 00:11:22:33:44:55)'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('الموقع يجب ألا يتجاوز 255 حرف'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب ألا يتجاوز 500 حرف'),
  
  body('firmware_version')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('إصدار الفيرموير يجب ألا يتجاوز 50 حرف'),
  
  body('max_faces')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى للوجوه يجب أن يكون رقماً صحيحاً'),
  
  body('max_cards')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى للبطاقات يجب أن يكون رقماً صحيحاً'),
  
  body('max_fingerprints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الحد الأقصى لبصمات الأصابع يجب أن يكون رقماً صحيحاً'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  body('capabilities')
    .optional()
    .isObject()
    .withMessage('القدرات يجب أن تكون كائن JSON'),
  
  body('settings')
    .optional()
    .isObject()
    .withMessage('الإعدادات يجب أن تكون كائن JSON'),
  
  validate
];

/**
 * Validation for device ID parameter
 */
export const deviceIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف الجهاز غير صالح'),
  
  validate
];

/**
 * Validation for listing devices with filters
 */
export const listDevicesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً أكبر من 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('حد العناصر يجب أن يكون بين 1 و 10000'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('نص البحث يجب ألا يتجاوز 100 حرف'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  query('is_online')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('حالة الاتصال يجب أن تكون true أو false'),
  
  query('device_type')
    .optional()
    .isIn(['face_recognition', 'card_reader', 'fingerprint', 'hybrid'])
    .withMessage('نوع الجهاز يجب أن يكون: face_recognition, card_reader, fingerprint, أو hybrid'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('الموقع يجب ألا يتجاوز 255 حرف'),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'name', 'ip_address', 'location', 'device_type', 'is_online', 'created_at', 'updated_at'])
    .withMessage('حقل الترتيب غير صالح'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('اتجاه الترتيب يجب أن يكون ASC أو DESC'),
  
  query('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  validate
];

// Export all validators
export default {
  createDeviceValidator,
  updateDeviceValidator,
  deviceIdValidator,
  listDevicesValidator
};
