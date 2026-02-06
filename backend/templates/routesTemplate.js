/**
 * ENTITY Routes Template
 * قالب جاهز لإنشاء routes جديد
 * 
 * HOW TO USE:
 * 1. Replace "ENTITY" with your entity name (e.g., "Device", "Door", "Biometric")
 * 2. Replace "entity" with lowercase version (e.g., "device", "door", "biometric")
 * 3. Update imports
 * 4. Add/remove routes based on requirements
 * 5. Adjust permissions and rate limiters
 */

import express from 'express';
import entityController from '../controllers/entityController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';
import {
  createENTITYValidator,
  updateENTITYValidator,
  entityIdValidator,
  listENTITYsValidator
} from '../validators/entityValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/entitys/stats/overview
 * @desc    Get ENTITY statistics
 * @access  Private - All authenticated users
 */
router.get(
  '/stats/overview',
  entityController.getENTITYStats
);

/**
 * @route   GET /api/entitys
 * @desc    Get all ENTITYs with filtering and pagination
 * @access  Private - All authenticated users
 */
router.get(
  '/',
  listENTITYsValidator,
  entityController.getENTITYs
);

/**
 * @route   GET /api/entitys/:id
 * @desc    Get single ENTITY by ID
 * @access  Private - All authenticated users
 */
router.get(
  '/:id',
  entityIdValidator,
  entityController.getENTITY
);

/**
 * @route   POST /api/entitys
 * @desc    Create new ENTITY
 * @access  Private - Admin, Manager
 */
router.post(
  '/',
  authorize(['super_admin', 'admin', 'manager']),
  createENTITYValidator,
  entityController.createENTITY
);

/**
 * @route   PUT /api/entitys/:id
 * @desc    Update ENTITY
 * @access  Private - Admin, Manager
 */
router.put(
  '/:id',
  authorize(['super_admin', 'admin', 'manager']),
  entityIdValidator,
  updateENTITYValidator,
  entityController.updateENTITY
);

/**
 * @route   POST /api/entitys/:id/activate
 * @desc    Activate ENTITY
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/activate',
  authorize(['super_admin', 'admin', 'manager']),
  entityIdValidator,
  entityController.activateENTITY
);

/**
 * @route   POST /api/entitys/:id/deactivate
 * @desc    Deactivate ENTITY
 * @access  Private - Admin, Manager
 */
router.post(
  '/:id/deactivate',
  authorize(['super_admin', 'admin', 'manager']),
  entityIdValidator,
  entityController.deactivateENTITY
);

/**
 * @route   DELETE /api/entitys/:id
 * @desc    Delete ENTITY (soft delete)
 * @access  Private - Admin only
 */
router.delete(
  '/:id',
  authorize(['super_admin', 'admin']),
  entityIdValidator,
  entityController.deleteENTITY
);

/**
 * ADD CUSTOM ROUTES HERE
 * Example: For Devices API, you might add:
 * - GET /api/devices/:id/status (get device online/offline status)
 * - POST /api/devices/:id/sync (sync device data)
 * - GET /api/devices/:id/logs (get device logs)
 */

export default router;
