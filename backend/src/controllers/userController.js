import * as userService from '../services/userService.js';
import { success } from '../utils/response.js';

/**
 * Get all users with pagination and filters
 * @route GET /api/users
 */
export const getUsers = async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    role: req.query.role,
    is_active: req.query.is_active,
    sort_by: req.query.sort_by,
    sort_order: req.query.sort_order
  };

  const result = await userService.getAllUsers(req.user.id, filters);
  
  return success(res, result, 'تم جلب قائمة المستخدمين بنجاح');
};

/**
 * Get single user by ID
 * @route GET /api/users/:id
 */
export const getUser = async (req, res) => {
  const user = await userService.getUserById(req.user.id, req.params.id);
  
  return success(res, { user }, 'تم جلب بيانات المستخدم بنجاح');
};

/**
 * Create new user
 * @route POST /api/users
 */
export const createUser = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await userService.createUser(req.user.id, req.body, ipAddress);
  
  return success(res, { user }, 'تم إنشاء المستخدم بنجاح', 201);
};

/**
 * Update user
 * @route PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const user = await userService.updateUser(req.user.id, req.params.id, req.body, ipAddress);
  
  return success(res, { user }, 'تم تحديث بيانات المستخدم بنجاح');
};

/**
 * Delete user (soft delete)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const result = await userService.deleteUser(req.user.id, req.params.id, ipAddress);
  
  return success(res, result, 'تم حذف المستخدم بنجاح');
};

/**
 * Update user permissions
 * @route PUT /api/users/:id/permissions
 */
export const updatePermissions = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const { permissions } = req.body;
  
  const user = await userService.updateUserPermissions(req.user.id, req.params.id, permissions, ipAddress);
  
  return success(res, { user }, 'تم تحديث صلاحيات المستخدم بنجاح');
};

/**
 * Activate user account
 * @route POST /api/users/:id/activate
 */
export const activateUser = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const result = await userService.activateUser(req.user.id, req.params.id, ipAddress);
  
  return success(res, result, 'تم تفعيل حساب المستخدم بنجاح');
};

/**
 * Deactivate user account
 * @route POST /api/users/:id/deactivate
 */
export const deactivateUser = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const result = await userService.deactivateUser(req.user.id, req.params.id, ipAddress);
  
  return success(res, result, 'تم تعطيل حساب المستخدم بنجاح');
};
