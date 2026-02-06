import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import * as userController from '../controllers/userController.js';
import * as userValidator from '../validators/userValidator.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(generalLimiter);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Private (admin and above)
 */
router.get(
  '/',
  authorize(['super_admin', 'admin', 'manager'], ['users.read']),
  userValidator.listUsersValidator,
  asyncHandler(userController.getUsers)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private (admin and above, or own profile)
 */
router.get(
  '/:id',
  authorize(['super_admin', 'admin', 'manager'], ['users.read']),
  userValidator.userIdValidator,
  asyncHandler(userController.getUser)
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (admin and above)
 */
router.post(
  '/',
  authorize(['super_admin', 'admin'], ['users.create']),
  userValidator.createUserValidator,
  asyncHandler(userController.createUser)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (admin and above)
 */
router.put(
  '/:id',
  authorize(['super_admin', 'admin'], ['users.update']),
  userValidator.updateUserValidator,
  asyncHandler(userController.updateUser)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (admin and above)
 */
router.delete(
  '/:id',
  authorize(['super_admin', 'admin'], ['users.delete']),
  userValidator.userIdValidator,
  asyncHandler(userController.deleteUser)
);

/**
 * @route   PUT /api/users/:id/permissions
 * @desc    Update user custom permissions
 * @access  Private (super_admin and admin only)
 */
router.put(
  '/:id/permissions',
  authorize(['super_admin', 'admin'], ['users.manage']),
  userValidator.updatePermissionsValidator,
  asyncHandler(userController.updatePermissions)
);

/**
 * @route   POST /api/users/:id/activate
 * @desc    Activate user account
 * @access  Private (admin and above)
 */
router.post(
  '/:id/activate',
  authorize(['super_admin', 'admin'], ['users.update']),
  userValidator.userIdValidator,
  asyncHandler(userController.activateUser)
);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (admin and above)
 */
router.post(
  '/:id/deactivate',
  authorize(['super_admin', 'admin'], ['users.update']),
  userValidator.userIdValidator,
  asyncHandler(userController.deactivateUser)
);

export default router;
