/**
 * File Upload Middleware using Multer
 * Handles file uploads with validation and storage configuration
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist
const uploadBasePath = path.join(__dirname, '../../uploads');

const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/employees/photos',
    'uploads/organizations/logos',
    'uploads/temp',
    'uploads/documents',
    'uploads/csv'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Create directories on startup
createUploadDirs();

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.uploadPath || 'temp';
    const fullPath = path.join(uploadBasePath, uploadPath);
    
    // Ensure directory exists
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex.ext
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-') // Sanitize filename
      .substring(0, 50); // Limit length
    
    const filename = `${baseName}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

/**
 * File filter for images
 */
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedExts = /\.(jpg|jpeg|png|gif)$/i;
  
  const mimetypeValid = allowedMimes.includes(file.mimetype);
  const extnameValid = allowedExts.test(path.extname(file.originalname));
  
  if (mimetypeValid && extnameValid) {
    cb(null, true);
  } else {
    cb(new AppError('نوع الملف غير مدعوم. يُسمح فقط بـ: JPEG, PNG, GIF', 400), false);
  }
};

/**
 * File filter for CSV files
 */
const csvFilter = (req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
  const allowedExts = /\.csv$/i;
  
  const mimetypeValid = allowedMimes.includes(file.mimetype);
  const extnameValid = allowedExts.test(path.extname(file.originalname));
  
  if (mimetypeValid && extnameValid) {
    cb(null, true);
  } else {
    cb(new AppError('نوع الملف غير مدعوم. يُسمح فقط بملفات CSV', 400), false);
  }
};

/**
 * File filter for documents (PDF, DOCX, etc.)
 */
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  const allowedExts = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
  
  const mimetypeValid = allowedMimes.includes(file.mimetype);
  const extnameValid = allowedExts.test(path.extname(file.originalname));
  
  if (mimetypeValid && extnameValid) {
    cb(null, true);
  } else {
    cb(new AppError('نوع الملف غير مدعوم. يُسمح بـ: PDF, DOC, DOCX, JPG, PNG', 400), false);
  }
};

/**
 * Upload middleware for employee photos
 */
export const uploadEmployeePhoto = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
}).single('photo');

/**
 * Upload middleware for organization logos
 */
export const uploadOrganizationLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  }
}).single('logo');

/**
 * Upload middleware for CSV bulk imports
 */
export const uploadCSV = multer({
  storage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
}).single('csvFile');

/**
 * Upload middleware for documents
 */
export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  }
}).array('documents', 5);

/**
 * Generic upload middleware with custom options
 */
export const createUploadMiddleware = (options = {}) => {
  const {
    fileFilter = imageFilter,
    maxSize = 5 * 1024 * 1024,
    maxFiles = 1,
    fieldName = 'file'
  } = options;

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: maxFiles
    }
  }).single(fieldName);
};

/**
 * Middleware to set upload path dynamically
 * Usage: setUploadPath('employees/photos')
 */
export const setUploadPath = (uploadPath) => {
  return (req, res, next) => {
    req.uploadPath = uploadPath;
    next();
  };
};

/**
 * Cleanup old temporary files (run as cron job)
 */
export const cleanupTempFiles = () => {
  const tempPath = path.join(uploadBasePath, 'temp');
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (fs.existsSync(tempPath)) {
    const files = fs.readdirSync(tempPath);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(tempPath, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old temp file: ${file}`);
      }
    });
  }
};

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export default {
  uploadEmployeePhoto,
  uploadOrganizationLogo,
  uploadCSV,
  uploadDocument,
  createUploadMiddleware,
  setUploadPath,
  cleanupTempFiles,
  deleteUploadedFile
};
