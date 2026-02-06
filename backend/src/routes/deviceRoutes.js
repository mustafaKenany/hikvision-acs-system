/**
 * Device Routes
 * مسارات API الخاصة بإدارة الأجهزة
 */

import express from 'express';
import deviceController from '../controllers/deviceController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  createDeviceValidator,
  updateDeviceValidator,
  deviceIdValidator,
  listDevicesValidator
} from '../validators/deviceValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   GET /api/devices/stats/overview
 * @desc    Get device statistics
 * @access  Private - All authenticated users
 */
router.get(
  '/stats/overview',
  deviceController.getDeviceStats
);

/**
 * @route   GET /api/devices
 * @desc    Get all devices with filtering and pagination
 * @access  Private - All authenticated users
 */
router.get(
  '/',
  listDevicesValidator,
  deviceController.getDevices
);

/**
 * @route   GET /api/devices/:id
 * @desc    Get single device by ID
 * @access  Private - All authenticated users
 */
router.get(
  '/:id',
  deviceIdValidator,
  deviceController.getDevice
);

/**
 * @route   POST /api/devices
 * @desc    Create new device (register device)
 * @access  Private - Admin only
 */
router.post(
  '/',
  authorize(['super_admin', 'admin']),
  createDeviceValidator,
  deviceController.createDevice
);

/**
 * @route   PUT /api/devices/:id
 * @desc    Update device configuration
 * @access  Private - Admin, Manager
 */
router.put(
  '/:id',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  updateDeviceValidator,
  deviceController.updateDevice
);

/**
 * @route   POST /api/devices/:id/activate
 * @desc    Activate device
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/activate',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.activateDevice
);

/**
 * @route   POST /api/devices/:id/deactivate
 * @desc    Deactivate device
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/deactivate',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.deactivateDevice
);

/**
 * @route   DELETE /api/devices/:id
 * @desc    Delete device (soft delete)
 * @access  Private - Admin only
 */
router.delete(
  '/:id',
  authorize(['super_admin', 'admin']),
  deviceIdValidator,
  deviceController.deleteDevice
);

/**
 * @route   GET /api/devices/:id/status
 * @desc    Get device online/offline status
 * @access  Private - All authenticated users
 */
router.get(
  '/:id/status',
  deviceIdValidator,
  deviceController.getDeviceStatus
);

/**
 * @route   POST /api/devices/:id/sync
 * @desc    Sync device data with HikVision device
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/sync',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.syncDevice
);

export default router;
