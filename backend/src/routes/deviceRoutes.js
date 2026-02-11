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
 * @route   POST /api/devices/:id/test-connection
 * @desc    Test connection to physical device
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/test-connection',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.testConnection
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

/**
 * @route   POST /api/devices/:id/live-capture/:employeeId
 * @desc    Activate live face capture mode on device camera
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/live-capture/:employeeId',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.activateLiveCapture
);

/**
 * @route   POST /api/devices/discover
 * @desc    Discover Hikvision devices on network
 * @access  Private - Admin, Manager
 */
router.post(
  '/discover',
  authorize(['super_admin', 'admin', 'manager']),
  deviceController.discoverDevices
);

/**
 * @route   GET /api/devices/:id/info
 * @desc    Get detailed device information including specs
 * @access  Private - All authenticated users
 */
router.get(
  '/:id/info',
  deviceIdValidator,
  deviceController.getDeviceInfo
);

/**
 * @route   POST /api/devices/:id/sync-time
 * @desc    Synchronize device time with server
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/sync-time',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.syncDeviceTime
);

/**
 * @route   POST /api/devices/:id/pull-logs
 * @desc    Pull access logs from device
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/pull-logs',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.pullDeviceLogs
);

/**
 * @route   POST /api/devices/:id/reboot
 * @desc    Reboot device
 * @access  Private - Admin only
 */
router.post(
  '/:id/reboot',
  authorize(['super_admin', 'admin']),
  deviceIdValidator,
  deviceController.rebootDevice
);

/**
 * @route   POST /api/devices/:id/clear-logs
 * @desc    Clear device logs from memory
 * @access  Private - Admin only
 */
router.post(
  '/:id/clear-logs',
  authorize(['super_admin', 'admin']),
  deviceIdValidator,
  deviceController.clearDeviceLogs
);

/**
 * @route   POST /api/devices/:id/open-door
 * @desc    Open door remotely
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/open-door',
  authorize(['super_admin', 'admin', 'manager']),
  deviceIdValidator,
  deviceController.openDoor
);

export default router;
