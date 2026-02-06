/**
 * ENTITY Validator Template
 * قالب جاهز لإنشاء validator جديد
 * 
 * HOW TO USE:
 * 1. Replace "ENTITY" with your entity name (e.g., "Device", "Door", "Biometric")
 * 2. Replace "entity" with lowercase version
 * 3. Add/modify validation rules based on your model fields
 * 4. Update error messages
 * 5. Remove validators you don't need
 */

import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.js';

/**
 * Validation for creating a new ENTITY
 */
export const createENTITYValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب ألا يتجاوز 500 حرف'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  body('organization_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('معرف المؤسسة يجب أن يكون رقماً صحيحاً'),
  
  // Add more field validations here based on your model
  
  validate
];

/**
 * Validation for updating an ENTITY
 */
export const updateENTITYValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف ENTITY غير صالح'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 255 })
    .withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب ألا يتجاوز 500 حرف'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  // Add more field validations here
  
  validate
];

/**
 * Validation for ENTITY ID parameter
 */
export const entityIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('معرف ENTITY غير صالح'),
  
  validate
];

/**
 * Validation for listing ENTITYs with filters
 */
export const listENTITYsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقماً صحيحاً أكبر من 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('حد العناصر يجب أن يكون بين 1 و 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('نص البحث يجب ألا يتجاوز 100 حرف'),
  
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('حالة التفعيل يجب أن تكون true أو false'),
  
  query('sort_by')
    .optional()
    .isIn(['id', 'name', 'created_at', 'updated_at'])
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

/**
 * Custom validation for specific ENTITY fields
 * Example: For Device API, you might validate IP address format
 */
export const customENTITYValidator = [
  body('custom_field')
    .optional()
    .custom((value) => {
      // Add custom validation logic here
      // Throw error if validation fails
      // Return true if validation passes
      return true;
    })
    .withMessage('Custom field validation failed'),
  
  validate
];

// Export all validators
export default {
  createENTITYValidator,
  updateENTITYValidator,
  entityIdValidator,
  listENTITYsValidator,
  customENTITYValidator
};
