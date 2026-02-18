/**
 * Biometric Routes
 * مسارات API الخاصة بالبيانات البيومترية (Face & Card Registration)
 */

import express from 'express';
import biometricController from '../controllers/biometricController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload (face images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط الصور مسموحة'), false);
    }
  }
});

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   POST /api/biometrics/face/register
 * @desc    Register employee face to device
 * @access  Private - Admin, Manager
 */
router.post(
  '/face/register',
  authorize(['super_admin', 'admin', 'manager']),
  upload.single('face_image'),
  biometricController.registerFace
);

/**
 * @route   DELETE /api/biometrics/face/:employeeId
 * @desc    Delete employee face from device
 * @access  Private - Admin, Manager
 */
router.delete(
  '/face/:employeeId',
  authorize(['super_admin', 'admin', 'manager']),
  biometricController.deleteFace
);

/**
 * @route   GET /api/biometrics/face/:employeeId
 * @desc    Get employee face status from device
 * @access  Private - All authenticated users
 */
router.get(
  '/face/:employeeId',
  biometricController.getFaceStatus
);

/**
 * @route   POST /api/biometrics/card/register
 * @desc    Register employee card to device
 * @access  Private - Admin, Manager
 */
router.post(
  '/card/register',
  authorize(['super_admin', 'admin', 'manager']),
  biometricController.registerCard
);

/**
 * @route   DELETE /api/biometrics/card/:employeeId
 * @desc    Delete employee card from device
 * @access  Private - Admin, Manager
 */
router.delete(
  '/card/:employeeId',
  authorize(['super_admin', 'admin', 'manager']),
  biometricController.deleteCard
);

/**
 * @route   GET /api/biometrics/card/:employeeId
 * @desc    Get employee card status from device
 * @access  Private - All authenticated users
 */
router.get(
  '/card/:employeeId',
  biometricController.getCardStatus
);

/**
 * @route   POST /api/biometrics/sync/:employeeId
 * @desc    Sync all biometric data for employee to all devices
 * @access  Private - Admin, Manager
 */
router.post(
  '/sync/:employeeId',
  authorize(['super_admin', 'admin', 'manager']),
  biometricController.syncEmployeeBiometrics
);

/**
 * @route   GET /api/biometrics/status/:employeeId
 * @desc    Get complete biometric status for employee
 * @access  Private - All authenticated users
 */
router.get(
  '/status/:employeeId',
  biometricController.getBiometricStatus
);

export default router;
