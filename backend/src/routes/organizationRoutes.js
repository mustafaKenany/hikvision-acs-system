/**
 * Organization Routes
 * مسارات API الخاصة بإدارة المؤسسات
 */

import express from 'express';
import organizationController from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  organizationIdValidator,
  listOrganizationsValidator,
  updateSubscriptionValidator,
  updateSettingsValidator
} from '../validators/organizationValidator.js';
import { uploadOrganizationLogo as uploadLogo, setUploadPath } from '../middlewares/upload.js';
import { processOrganizationLogoMiddleware } from '../middlewares/imageProcessor.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(generalLimiter);

/**
 * @route   GET /api/organizations
 * @desc    Get all organizations with filtering and pagination
 * @access  Private - Super Admin only
 */
router.get(
  '/',
  authorize(['super_admin']),
  listOrganizationsValidator,
  organizationController.getOrganizations
);

/**
 * @route   GET /api/organizations/:id
 * @desc    Get single organization by ID
 * @access  Private - Super Admin or own organization
 */
router.get(
  '/:id',
  organizationIdValidator,
  organizationController.getOrganization
);

/**
 * @route   GET /api/organizations/:id/stats
 * @desc    Get organization statistics
 * @access  Private - Super Admin or own organization
 */
router.get(
  '/:id/stats',
  organizationIdValidator,
  organizationController.getOrganizationStats
);

/**
 * @route   GET /api/organizations/:id/settings
 * @desc    Get organization settings
 * @access  Private - Admin or Super Admin
 */
router.get(
  '/:id/settings',
  authorize(['super_admin', 'admin']),
  organizationIdValidator,
  organizationController.getOrganizationSettings
);

/**
 * @route   POST /api/organizations
 * @desc    Create new organization
 * @access  Private - Super Admin only
 */
router.post(
  '/',
  authorize(['super_admin']),
  createOrganizationValidator,
  organizationController.createOrganization
);

/**
 * @route   PUT /api/organizations/:id
 * @desc    Update organization
 * @access  Private - Super Admin or own organization (admin)
 */
router.put(
  '/:id',
  authorize(['super_admin', 'admin']),
  organizationIdValidator,
  updateOrganizationValidator,
  organizationController.updateOrganization
);

/**
 * @route   PUT /api/organizations/:id/subscription
 * @desc    Update organization subscription
 * @access  Private - Super Admin only
 */
router.put(
  '/:id/subscription',
  authorize(['super_admin']),
  updateSubscriptionValidator,
  organizationController.updateSubscription
);

/**
 * @route   PUT /api/organizations/:id/settings
 * @desc    Update organization settings
 * @access  Private - Admin or Super Admin
 */
router.put(
  '/:id/settings',
  authorize(['super_admin', 'admin']),
  organizationIdValidator,
  updateSettingsValidator,
  organizationController.updateOrganizationSettings
);

/**
 * @route   POST /api/organizations/:id/activate
 * @desc    Activate organization
 * @access  Private - Super Admin only
 */
router.post(
  '/:id/activate',
  authorize(['super_admin']),
  organizationIdValidator,
  organizationController.activateOrganization
);

/**
 * @route   POST /api/organizations/:id/deactivate
 * @desc    Deactivate organization
 * @access  Private - Super Admin only
 */
router.post(
  '/:id/deactivate',
  authorize(['super_admin']),
  organizationIdValidator,
  organizationController.deactivateOrganization
);

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Delete organization (soft delete by deactivating)
 * @access  Private - Super Admin only
 */
router.delete(
  '/:id',
  authorize(['super_admin']),
  organizationIdValidator,
  organizationController.deleteOrganization
);

/**
 * @route   POST /api/organizations/:id/logo
 * @desc    Upload organization logo
 * @access  Private - Super Admin or Admin
 */
router.post(
  '/:id/logo',
  authorize(['super_admin', 'admin']),
  organizationIdValidator,
  setUploadPath('organizations/logos'),
  uploadLogo,
  processOrganizationLogoMiddleware,
  organizationController.uploadOrganizationLogo
);

/**
 * @route   GET /api/organizations/:id/logo
 * @desc    Get organization logo
 * @access  Private
 */
router.get(
  '/:id/logo',
  organizationIdValidator,
  organizationController.getOrganizationLogo
);

/**
 * @route   DELETE /api/organizations/:id/logo
 * @desc    Delete organization logo
 * @access  Private - Super Admin or Admin
 */
router.delete(
  '/:id/logo',
  authorize(['super_admin', 'admin']),
  organizationIdValidator,
  organizationController.deleteOrganizationLogo
);

export default router;
