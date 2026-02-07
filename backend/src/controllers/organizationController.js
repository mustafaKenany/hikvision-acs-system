/**
 * Organization Controller
 * معالج طلبات API الخاصة بإدارة المؤسسات
 */

import * as organizationService from '../services/organizationService.js';
import { success } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

class OrganizationController {
  /**
   * GET /api/organizations
   * Get all organizations with filtering and pagination
   * Super admin only
   */
  getOrganizations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.query;

    const result = await organizationService.getAllOrganizations(userId, filters);

    return success(res, result, 'تم جلب قائمة المؤسسات بنجاح', 200);
  });

  /**
   * GET /api/organizations/:id
   * Get single organization by ID
   */
  getOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.getOrganizationById(userId, organizationId);

    return success(res, result, 'تم جلب بيانات المؤسسة بنجاح', 200);
  });

  /**
   * POST /api/organizations
   * Create new organization
   * Super admin only
   */
  createOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = req.body;

    const result = await organizationService.createOrganization(userId, data);

    return success(res, result, 'تم إنشاء المؤسسة بنجاح', 201);
  });

  /**
   * PUT /api/organizations/:id
   * Update organization
   */
  updateOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);
    const data = req.body;

    const result = await organizationService.updateOrganization(userId, organizationId, data);

    return success(res, result, 'تم تحديث بيانات المؤسسة بنجاح', 200);
  });

  /**
   * DELETE /api/organizations/:id
   * Delete organization (soft delete by deactivating)
   * Super admin only
   */
  deleteOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.deleteOrganization(userId, organizationId);

    return success(res, result, 'تم حذف المؤسسة بنجاح', 200);
  });

  /**
   * GET /api/organizations/:id/stats
   * Get organization statistics
   */
  getOrganizationStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.getOrganizationStats(userId, organizationId);

    return success(res, result, 'تم جلب إحصائيات المؤسسة بنجاح', 200);
  });

  /**
   * PUT /api/organizations/:id/subscription
   * Update organization subscription
   * Super admin only
   */
  updateSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);
    const subscriptionData = req.body;

    const result = await organizationService.updateSubscription(userId, organizationId, subscriptionData);

    return success(res, result, 'تم تحديث الاشتراك بنجاح', 200);
  });

  /**
   * POST /api/organizations/:id/activate
   * Activate organization
   * Super admin only
   */
  activateOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.activateOrganization(userId, organizationId);

    return success(res, result, 'تم تفعيل المؤسسة بنجاح', 200);
  });

  /**
   * POST /api/organizations/:id/deactivate
   * Deactivate organization
   * Super admin only
   */
  deactivateOrganization = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.deactivateOrganization(userId, organizationId);

    return success(res, result, 'تم تعطيل المؤسسة بنجاح', 200);
  });

  /**
   * GET /api/organizations/:id/settings
   * Get organization settings
   */
  getOrganizationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);

    const result = await organizationService.getOrganizationSettings(userId, organizationId);

    return success(res, result, 'تم جلب إعدادات المؤسسة بنجاح', 200);
  });

  /**
   * PUT /api/organizations/:id/settings
   * Update organization settings
   */
  updateOrganizationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const organizationId = parseInt(req.params.id);
    const settings = req.body;

    const result = await organizationService.updateOrganizationSettings(userId, organizationId, settings);

    return success(res, result, 'تم تحديث إعدادات المؤسسة بنجاح', 200);
  });
}

export default new OrganizationController();
