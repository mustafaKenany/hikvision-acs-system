import models from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { hashPassword } from '../utils/bcrypt.js';
import { Op } from 'sequelize';

const { User, Organization, AuditLog } = models;

/**
 * Get all users with pagination, search and filters
 */
export const getAllUsers = async (userId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    role = '',
    is_active = '',
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = filters;

  // Get current user to check organization
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Build where clause
  const whereClause = {};

  // Organization isolation - users can only see users from their organization
  // Exception: super_admin can see all users
  if (currentUser.role !== 'super_admin') {
    whereClause.organization_id = currentUser.organization_id;
  }

  // Search in name, email
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Filter by role
  if (role) {
    whereClause.role = role;
  }

  // Filter by active status
  if (is_active !== '') {
    whereClause.is_active = is_active === 'true' || is_active === true;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Valid sort fields
  const validSortFields = ['created_at', 'email', 'name', 'role'];
  const orderBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Fetch users
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan', 'subscription_end']
      }
    ],
    attributes: { exclude: ['password'] },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[orderBy, order]]
  });

  return {
    users,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get single user by ID
 */
export const getUserById = async (requesterId, targetUserId) => {
  const requester = await User.findByPk(requesterId);
  if (!requester) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const user = await User.findByPk(targetUserId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan', 'subscription_end', 'settings']
      }
    ],
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Check organization access
  if (requester.role !== 'super_admin' && user.organization_id !== requester.organization_id) {
    throw new AppError('غير مصرح لك بالوصول لهذا المستخدم', 403);
  }

  return user;
};

/**
 * Create new user
 */
export const createUser = async (creatorId, userData, ipAddress) => {
  const creator = await User.findByPk(creatorId);
  if (!creator) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const {
    email,
    password,
    name,
    phone,
    role,
    organization_id,
    custom_permissions,
    is_active = true
  } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('البريد الإلكتروني موجود مسبقاً', 409);
  }

  // Determine organization_id
  let targetOrgId = organization_id;
  
  // Non-super_admin users can only create users in their own organization
  if (creator.role !== 'super_admin') {
    targetOrgId = creator.organization_id;
  }

  // If still no organization_id, use creator's organization
  if (!targetOrgId) {
    targetOrgId = creator.organization_id;
  }

  // Verify organization exists
  const organization = await Organization.findByPk(targetOrgId);
  
  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Check organization limits
  const userCount = await User.count({ where: { organization_id: targetOrgId } });
  if (userCount >= organization.max_users) {
    throw new AppError('تم الوصول للحد الأقصى لعدد المستخدمين في هذه المؤسسة', 403);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    name,
    phone,
    role,
    organization_id: targetOrgId,
    permissions: custom_permissions || [],
    is_active
  });

  // Create audit log
  await AuditLog.create({
    user_id: creatorId,
    action: 'create',
    resource_type: 'User',
    resource_id: newUser.id,
    description: `تم إنشاء مستخدم جديد: ${email}`,
    ip_address: ipAddress,
    new_values: {
      email,
      role,
      organization_id: targetOrgId
    }
  });

  // Fetch complete user data with organization
  const createdUser = await User.findByPk(newUser.id, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      }
    ],
    attributes: { exclude: ['password'] }
  });

  return createdUser;
};

/**
 * Update user
 */
export const updateUser = async (updaterId, targetUserId, updateData, ipAddress) => {
  const updater = await User.findByPk(updaterId);
  if (!updater) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Check organization access
  if (updater.role !== 'super_admin' && targetUser.organization_id !== updater.organization_id) {
    throw new AppError('غير مصرح لك بتعديل هذا المستخدم', 403);
  }

  // Prevent self-role change and self-deactivation
  if (updaterId === targetUserId) {
    if (updateData.role && updateData.role !== targetUser.role) {
      throw new AppError('لا يمكنك تغيير دورك الخاص', 403);
    }
    if (updateData.is_active === false) {
      throw new AppError('لا يمكنك تعطيل حسابك الخاص', 403);
    }
  }

  // Store old values for audit
  const oldValues = {
    email: targetUser.email,
    name: targetUser.name,
    phone: targetUser.phone,
    role: targetUser.role,
    is_active: targetUser.is_active
  };

  // Allowed fields to update
  const allowedFields = ['name', 'phone', 'is_active'];
  
  // Only super_admin and admin can change role
  if (updater.role === 'super_admin' || updater.role === 'admin') {
    allowedFields.push('role');
  }

  // Build update object
  const updates = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  // Check if email is being changed
  if (updateData.email && updateData.email !== targetUser.email) {
    const existingUser = await User.findOne({ where: { email: updateData.email } });
    if (existingUser) {
      throw new AppError('البريد الإلكتروني موجود مسبقاً', 409);
    }
    updates.email = updateData.email;
    updates.email_verified = false;
  }

  // Update password if provided
  if (updateData.password) {
    updates.password = await hashPassword(updateData.password);
  }

  // Perform update
  await targetUser.update(updates);

  // Create audit log
  await AuditLog.create({
    user_id: updaterId,
    action: 'update',
    resource_type: 'User',
    resource_id: targetUserId,
    description: `تم تحديث بيانات المستخدم: ${targetUser.email}`,
    ip_address: ipAddress,
    old_values: oldValues,
    new_values: updates
  });

  // Return updated user without password
  const updatedUser = await User.findByPk(targetUserId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      }
    ],
    attributes: { exclude: ['password'] }
  });

  return updatedUser;
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (deleterId, targetUserId, ipAddress) => {
  const deleter = await User.findByPk(deleterId);
  if (!deleter) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Prevent self-deletion
  if (deleterId === targetUserId) {
    throw new AppError('لا يمكنك حذف حسابك الخاص', 403);
  }

  // Check organization access
  if (deleter.role !== 'super_admin' && targetUser.organization_id !== deleter.organization_id) {
    throw new AppError('غير مصرح لك بحذف هذا المستخدم', 403);
  }

  // Soft delete by deactivating
  await targetUser.update({ is_active: false });

  // Create audit log
  await AuditLog.create({
    user_id: deleterId,
    action: 'delete',
    resource_type: 'User',
    resource_id: targetUserId,
    description: `تم حذف المستخدم: ${targetUser.email}`,
    ip_address: ipAddress,
    old_values: {
      email: targetUser.email,
      is_active: true
    },
    new_values: {
      is_active: false
    }
  });

  return { message: 'تم حذف المستخدم بنجاح' };
};

/**
 * Update user permissions
 */
export const updateUserPermissions = async (updaterId, targetUserId, permissions, ipAddress) => {
  const updater = await User.findByPk(updaterId);
  if (!updater) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Check organization access
  if (updater.role !== 'super_admin' && targetUser.organization_id !== updater.organization_id) {
    throw new AppError('غير مصرح لك بتعديل صلاحيات هذا المستخدم', 403);
  }

  // Store old permissions
  const oldPermissions = targetUser.custom_permissions || [];

  // Update permissions
  await targetUser.update({ custom_permissions: permissions });

  // Create audit log
  await AuditLog.create({
    user_id: updaterId,
    action: 'update',
    resource_type: 'User',
    resource_id: targetUserId,
    description: `تم تحديث صلاحيات المستخدم: ${targetUser.email}`,
    ip_address: ipAddress,
    old_values: { custom_permissions: oldPermissions },
    new_values: { custom_permissions: permissions }
  });

  // Return updated user
  const updatedUser = await User.findByPk(targetUserId, {
    attributes: { exclude: ['password'] }
  });

  return updatedUser;
};

/**
 * Activate user account
 */
export const activateUser = async (activatorId, targetUserId, ipAddress) => {
  const activator = await User.findByPk(activatorId);
  if (!activator) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Check organization access
  if (activator.role !== 'super_admin' && targetUser.organization_id !== activator.organization_id) {
    throw new AppError('غير مصرح لك بتفعيل هذا المستخدم', 403);
  }

  if (targetUser.is_active) {
    throw new AppError('الحساب مفعل بالفعل', 400);
  }

  await targetUser.update({ is_active: true });

  // Create audit log
  await AuditLog.create({
    user_id: activatorId,
    action: 'update',
    resource_type: 'User',
    resource_id: targetUserId,
    description: `تم تفعيل حساب المستخدم: ${targetUser.email}`,
    ip_address: ipAddress,
    old_values: { is_active: false },
    new_values: { is_active: true }
  });

  return { message: 'تم تفعيل الحساب بنجاح', user: targetUser };
};

/**
 * Deactivate user account
 */
export const deactivateUser = async (deactivatorId, targetUserId, ipAddress) => {
  const deactivator = await User.findByPk(deactivatorId);
  if (!deactivator) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError('المستخدم المطلوب غير موجود', 404);
  }

  // Prevent self-deactivation
  if (deactivatorId === targetUserId) {
    throw new AppError('لا يمكنك تعطيل حسابك الخاص', 403);
  }

  // Check organization access
  if (deactivator.role !== 'super_admin' && targetUser.organization_id !== deactivator.organization_id) {
    throw new AppError('غير مصرح لك بتعطيل هذا المستخدم', 403);
  }

  if (!targetUser.is_active) {
    throw new AppError('الحساب معطل بالفعل', 400);
  }

  await targetUser.update({ is_active: false });

  // Create audit log
  await AuditLog.create({
    user_id: deactivatorId,
    action: 'update',
    resource_type: 'User',
    resource_id: targetUserId,
    description: `تم تعطيل حساب المستخدم: ${targetUser.email}`,
    ip_address: ipAddress,
    old_values: { is_active: true },
    new_values: { is_active: false }
  });

  return { message: 'تم تعطيل الحساب بنجاح' };
};
