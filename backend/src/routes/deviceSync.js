/**
 * Device Sync Routes
 * مسارات مزامنة الأجهزة
 */

import express from 'express';
import { 
  syncEmployeesFromDevice, 
  syncEmployeesFromAllDevices,
  getSyncStatus 
} from '../services/deviceSyncService.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/devices/:deviceId/sync
 * مزامنة الموظفين من جهاز واحد
 */
router.post('/:deviceId/sync', authenticate, async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;

    console.log(`[API] Sync request for device ${deviceId} by user ${userId}`);

    const result = await syncEmployeesFromDevice(userId, deviceId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/devices/sync-all
 * مزامنة الموظفين من كل الأجهزة
 */
router.post('/sync-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organization_id;

    console.log(`[API] Sync all devices for organization ${organizationId}`);

    const result = await syncEmployeesFromAllDevices(userId, organizationId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/devices/:deviceId/sync-status
 * الحصول على حالة المزامنة لجهاز
 */
router.get('/:deviceId/sync-status', authenticate, async (req, res, next) => {
  try {
    const { deviceId } = req.params;

    const status = await getSyncStatus(deviceId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    next(error);
  }
});

export default router;
