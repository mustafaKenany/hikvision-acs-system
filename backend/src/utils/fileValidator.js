/**
 * File Validation Utilities
 * Provides validation functions for uploaded files
 */

import path from 'path';
import fs from 'fs';
import AppError from './appError.js';

/**
 * Allowed file types configuration
 */
export const ALLOWED_FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimetypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    mimetypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  },
  csv: {
    extensions: ['.csv'],
    mimetypes: ['text/csv', 'application/vnd.ms-excel', 'text/plain']
  },
  archives: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    mimetypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip'
    ]
  }
};

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  employeePhoto: 5 * 1024 * 1024,      // 5MB
  organizationLogo: 2 * 1024 * 1024,   // 2MB
  document: 10 * 1024 * 1024,          // 10MB
  csv: 10 * 1024 * 1024,               // 10MB
  archive: 50 * 1024 * 1024            // 50MB
};

/**
 * Validate file extension
 */
export const validateFileExtension = (filename, allowedExtensions) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      message: `امتداد الملف غير مدعوم. الامتدادات المسموحة: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Validate file mimetype
 */
export const validateFileMimetype = (mimetype, allowedMimetypes) => {
  if (!allowedMimetypes.includes(mimetype)) {
    return {
      valid: false,
      message: `نوع الملف غير مدعوم`
    };
  }

  return { valid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (fileSize, maxSize) => {
  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      message: `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`
    };
  }

  return { valid: true };
};

/**
 * Comprehensive file validation
 */
export const validateFile = (file, fileType = 'images', maxSize = FILE_SIZE_LIMITS.document) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    throw new AppError('لا يوجد ملف مرفق', 400);
  }

  // Get allowed types
  const allowedTypes = ALLOWED_FILE_TYPES[fileType];
  if (!allowedTypes) {
    throw new AppError('نوع الملف غير معروف', 400);
  }

  // Validate extension
  const extValidation = validateFileExtension(file.originalname, allowedTypes.extensions);
  if (!extValidation.valid) {
    errors.push(extValidation.message);
  }

  // Validate mimetype
  const mimeValidation = validateFileMimetype(file.mimetype, allowedTypes.mimetypes);
  if (!mimeValidation.valid) {
    errors.push(mimeValidation.message);
  }

  // Validate size
  const sizeValidation = validateFileSize(file.size, maxSize);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.message);
  }

  if (errors.length > 0) {
    // Delete uploaded file if validation fails
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new AppError(errors.join('. '), 400);
  }

  return { valid: true };
};

/**
 * Validate image file
 */
export const validateImageFile = (file, maxSize = FILE_SIZE_LIMITS.employeePhoto) => {
  return validateFile(file, 'images', maxSize);
};

/**
 * Validate CSV file
 */
export const validateCSVFile = (file, maxSize = FILE_SIZE_LIMITS.csv) => {
  return validateFile(file, 'csv', maxSize);
};

/**
 * Validate document file
 */
export const validateDocumentFile = (file, maxSize = FILE_SIZE_LIMITS.document) => {
  return validateFile(file, 'documents', maxSize);
};

/**
 * Sanitize filename
 * Remove special characters and limit length
 */
export const sanitizeFilename = (filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  
  // Remove special characters, keep only alphanumeric, dash, underscore
  const sanitized = name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `${sanitized}${ext}`;
};

/**
 * Check if path is safe (prevent path traversal attacks)
 */
export const isSafePath = (filepath) => {
  const normalized = path.normalize(filepath);
  
  // Check for path traversal attempts
  if (normalized.includes('..') || normalized.includes('~')) {
    return false;
  }
  
  return true;
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Check if file exists
 */
export const fileExists = (filepath) => {
  try {
    return fs.existsSync(filepath);
  } catch (error) {
    return false;
  }
};

/**
 * Delete file safely
 */
export const deleteFile = (filepath) => {
  try {
    if (!isSafePath(filepath)) {
      console.error('Unsafe file path:', filepath);
      return false;
    }
    
    if (fileExists(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Validate multiple files
 */
export const validateFiles = (files, fileType = 'images', maxSize = FILE_SIZE_LIMITS.document, maxFiles = 5) => {
  if (!files || files.length === 0) {
    throw new AppError('لا توجد ملفات مرفقة', 400);
  }

  if (files.length > maxFiles) {
    throw new AppError(`عدد الملفات كبير جداً. الحد الأقصى: ${maxFiles} ملفات`, 400);
  }

  files.forEach((file, index) => {
    try {
      validateFile(file, fileType, maxSize);
    } catch (error) {
      // Delete all uploaded files if any validation fails
      files.forEach(f => {
        if (f.path && fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
      throw new AppError(`خطأ في الملف ${index + 1}: ${error.message}`, 400);
    }
  });

  return { valid: true };
};

/**
 * Middleware: Validate uploaded image
 */
export const validateImageMiddleware = (maxSize = FILE_SIZE_LIMITS.employeePhoto) => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('لا يوجد ملف مرفق', 400));
      }
      
      validateImageFile(req.file, maxSize);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware: Validate uploaded CSV
 */
export const validateCSVMiddleware = (maxSize = FILE_SIZE_LIMITS.csv) => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('لا يوجد ملف CSV مرفق', 400));
      }
      
      validateCSVFile(req.file, maxSize);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware: Validate uploaded documents
 */
export const validateDocumentsMiddleware = (maxSize = FILE_SIZE_LIMITS.document, maxFiles = 5) => {
  return (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next(new AppError('لا توجد مستندات مرفقة', 400));
      }
      
      validateFiles(req.files, 'documents', maxSize, maxFiles);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  validateFile,
  validateImageFile,
  validateCSVFile,
  validateDocumentFile,
  validateFiles,
  sanitizeFilename,
  isSafePath,
  formatFileSize,
  fileExists,
  deleteFile,
  validateImageMiddleware,
  validateCSVMiddleware,
  validateDocumentsMiddleware
};
