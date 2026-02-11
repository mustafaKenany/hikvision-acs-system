/**
 * Device Controller
 * معالج طلبات API الخاصة بإدارة الأجهزة
 */

import deviceService from '../services/deviceService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class DeviceController {
  /**
   * GET /api/devices
   * Get all devices with filtering and pagination
   */
  getDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.query;

    const result = await deviceService.getAllDevices(userId, filters);

    return success(res, result, 'تم جلب قائمة الأجهزة بنجاح', 200);
  });

  /**
   * GET /api/devices/:id
   * Get single device by ID
   */
  getDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.getDeviceById(userId, deviceId);

    return success(res, result, 'تم جلب بيانات الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices
   * Create new device
   */
  createDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = req.body;

    const result = await deviceService.createDevice(userId, data);

    return success(res, result, 'تم تسجيل الجهاز بنجاح', 201);
  });

  /**
   * PUT /api/devices/:id
   * Update device
   */
  updateDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);
    const data = req.body;

    const result = await deviceService.updateDevice(userId, deviceId, data);

    return success(res, result, 'تم تحديث بيانات الجهاز بنجاح', 200);
  });

  /**
   * DELETE /api/devices/:id
   * Delete device (soft delete)
   */
  deleteDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.deleteDevice(userId, deviceId);

    return success(res, result, 'تم حذف الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/activate
   * Activate device
   */
  activateDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.activateDevice(userId, deviceId);

    return success(res, result, 'تم تفعيل الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/deactivate
   * Deactivate device
   */
  deactivateDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.deactivateDevice(userId, deviceId);

    return success(res, result, 'تم تعطيل الجهاز بنجاح', 200);
  });

  /**
   * GET /api/devices/stats/overview
   * Get device statistics
   */
  getDeviceStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await deviceService.getDeviceStats(userId);

    return success(res, result, 'تم جلب إحصائيات الأجهزة بنجاح', 200);
  });

  /**
   * GET /api/devices/:id/status
   * Get device online/offline status
   */
  getDeviceStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.getDeviceStatus(userId, deviceId);

    return success(res, result, 'تم جلب حالة الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/test-connection
   * Test connection to physical device
   */
  testConnection = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.testConnection(userId, deviceId);

    return success(res, result, 'تم اختبار الاتصال بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/sync
   * Sync device data
   */
  syncDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.syncDevice(userId, deviceId);

    return success(res, result, 'تمت مزامنة الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/live-capture/:employeeId
   * Activate live face capture mode
   */
  activateLiveCapture = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);
    const employeeId = parseInt(req.params.employeeId);

    const result = await deviceService.activateLiveFaceCapture(userId, deviceId, employeeId);

    return success(res, result, 'تم تفعيل وضع التقاط الوجه', 200);
  });

  /**
   * POST /api/devices/discover
   * Discover Hikvision devices on network
   */
  discoverDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const config = req.body; // {ipStart, ipEnd, port, timeout}

    const result = await deviceService.discoverDevices(userId, config);

    return success(res, result, `تم اكتشاف ${result.length} جهاز`, 200);
  });

  /**
   * GET /api/devices/:id/info
   * Get detailed device information
   */
  getDeviceInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.getDeviceInfo(userId, deviceId);

    return success(res, result, 'تم جلب معلومات الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/sync-time
   * Synchronize device time with server
   */
  syncDeviceTime = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.syncDeviceTime(userId, deviceId);

    return success(res, result, 'تم مزامنة وقت الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/pull-logs
   * Pull access logs from device
   */
  pullDeviceLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);
    const filters = req.body; // {startTime, endTime}

    const result = await deviceService.pullDeviceLogs(userId, deviceId, filters);

    return success(res, result, `تم جلب ${result.newLogs} سجل جديد من الجهاز`, 200);
  });

  /**
   * POST /api/devices/:id/reboot
   * Reboot device
   */
  rebootDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.rebootDevice(userId, deviceId);

    return success(res, result, 'تم إعادة تشغيل الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/clear-logs
   * Clear device logs from memory
   */
  clearDeviceLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);

    const result = await deviceService.clearDeviceLogs(userId, deviceId);

    return success(res, result, 'تم مسح سجلات الجهاز بنجاح', 200);
  });

  /**
   * POST /api/devices/:id/open-door
   * Open door remotely
   */
  openDoor = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deviceId = parseInt(req.params.id);
    const { doorNumber = 1, duration = 5 } = req.body;

    const result = await deviceService.openDoor(userId, deviceId, doorNumber, duration);

    return success(res, result, 'تم فتح الباب بنجاح', 200);
  });
}

export default new DeviceController();
