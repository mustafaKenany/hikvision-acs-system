/**
 * ENTITY Controller Template
 * قالب جاهز لإنشاء controller جديد
 * 
 * HOW TO USE:
 * 1. Replace "ENTITY" with your entity name (e.g., "Device", "Door", "Biometric")
 * 2. Replace "entity" with lowercase version
 * 3. Update service import
 * 4. Modify success messages as needed
 * 5. Add/remove methods based on requirements
 */

import entityService from '../services/entityService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class ENTITYController {
  /**
   * GET /api/entitys
   * Get all ENTITYs with filtering and pagination
   */
  getENTITYs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.query;

    const result = await entityService.getAllENTITYs(userId, filters);

    return success(res, result, 'تم جلب قائمة ENTITYs بنجاح', 200);
  });

  /**
   * GET /api/entitys/:id
   * Get single ENTITY by ID
   */
  getENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const entityId = parseInt(req.params.id);

    const result = await entityService.getENTITYById(userId, entityId);

    return success(res, result, 'تم جلب ENTITY بنجاح', 200);
  });

  /**
   * POST /api/entitys
   * Create new ENTITY
   */
  createENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = req.body;

    const result = await entityService.createENTITY(userId, data);

    return success(res, result, 'تم إنشاء ENTITY بنجاح', 201);
  });

  /**
   * PUT /api/entitys/:id
   * Update ENTITY
   */
  updateENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const entityId = parseInt(req.params.id);
    const data = req.body;

    const result = await entityService.updateENTITY(userId, entityId, data);

    return success(res, result, 'تم تحديث ENTITY بنجاح', 200);
  });

  /**
   * DELETE /api/entitys/:id
   * Delete ENTITY (soft delete)
   */
  deleteENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const entityId = parseInt(req.params.id);

    const result = await entityService.deleteENTITY(userId, entityId);

    return success(res, result, 'تم حذف ENTITY بنجاح', 200);
  });

  /**
   * POST /api/entitys/:id/activate
   * Activate ENTITY
   */
  activateENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const entityId = parseInt(req.params.id);

    const result = await entityService.activateENTITY(userId, entityId);

    return success(res, result, 'تم تفعيل ENTITY بنجاح', 200);
  });

  /**
   * POST /api/entitys/:id/deactivate
   * Deactivate ENTITY
   */
  deactivateENTITY = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const entityId = parseInt(req.params.id);

    const result = await entityService.deactivateENTITY(userId, entityId);

    return success(res, result, 'تم تعطيل ENTITY بنجاح', 200);
  });

  /**
   * GET /api/entitys/stats/overview
   * Get ENTITY statistics
   */
  getENTITYStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await entityService.getENTITYStats(userId);

    return success(res, result, 'تم جلب الإحصائيات بنجاح', 200);
  });
}

export default new ENTITYController();
