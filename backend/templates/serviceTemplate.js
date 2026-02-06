/**
 * ENTITY Service Template
 * قالب جاهز لإنشاء service جديد
 * 
 * HOW TO USE:
 * 1. Replace "ENTITY" with your entity name (e.g., "Device", "Door", "Biometric")
 * 2. Replace "entity" with lowercase version
 * 3. Update model imports
 * 4. Modify business logic as needed
 * 5. Add/remove methods based on requirements
 */

import { Organization, User, ENTITY_MODEL } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get all ENTITYs with filtering, pagination, and search
 */
export async function getAllENTITYs(userId, filters = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    is_active,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = filters;

  // Get user's organization
  const user = await User.findByPk(userId, {
    include: [{ model: Organization, as: 'organization' }]
  });

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const organizationId = user.role === 'super_admin' 
    ? filters.organization_id 
    : user.organization_id;

  if (!organizationId) {
    throw new AppError('يجب تحديد المؤسسة للمستخدم', 400);
  }

  // Build where clause
  const whereClause = {
    organization_id: organizationId,
    deleted_at: null
  };

  // Add search
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      // Add more searchable fields here
    ];
  }

  // Add filters
  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true' || is_active === true;
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Query
  const { count, rows } = await ENTITY_MODEL.findAndCountAll({
    where: whereClause,
    order: [[sort_by, sort_order.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
      // Add more associations here
    ]
  });

  return {
    entitys: rows,
    pagination: {
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      limit: parseInt(limit)
    }
  };
}

/**
 * Get ENTITY by ID
 */
export async function getENTITYById(userId, entityId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: entityId,
    deleted_at: null
  };

  // Organization isolation (except super_admin)
  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const entity = await ENTITY_MODEL.findOne({
    where: whereClause,
    include: [
      { model: Organization, as: 'organization', attributes: ['id', 'name'] },
      // Add more associations here
    ]
  });

  if (!entity) {
    throw new AppError('ENTITY غير موجود', 404);
  }

  return entity;
}

/**
 * Create new ENTITY
 */
export async function createENTITY(userId, data) {
  const user = await User.findByPk(userId, {
    include: [{ model: Organization, as: 'organization' }]
  });

  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const organizationId = user.role === 'super_admin' && data.organization_id
    ? data.organization_id
    : user.organization_id;

  if (!organizationId) {
    throw new AppError('يجب تحديد المؤسسة', 400);
  }

  // Check for duplicates (if needed)
  // const existing = await ENTITY_MODEL.findOne({
  //   where: {
  //     unique_field: data.unique_field,
  //     organization_id: organizationId,
  //     deleted_at: null
  //   }
  // });
  
  // if (existing) {
  //   throw new AppError('ENTITY موجود مسبقاً', 409);
  // }

  // Create ENTITY
  const entity = await ENTITY_MODEL.create({
    ...data,
    organization_id: organizationId,
    created_by: userId
  });

  return entity;
}

/**
 * Update ENTITY
 */
export async function updateENTITY(userId, entityId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: entityId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const entity = await ENTITY_MODEL.findOne({ where: whereClause });

  if (!entity) {
    throw new AppError('ENTITY غير موجود', 404);
  }

  // Update fields
  await entity.update({
    ...data,
    updated_by: userId
  });

  return entity;
}

/**
 * Delete ENTITY (soft delete)
 */
export async function deleteENTITY(userId, entityId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: entityId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const entity = await ENTITY_MODEL.findOne({ where: whereClause });

  if (!entity) {
    throw new AppError('ENTITY غير موجود', 404);
  }

  // Soft delete
  await entity.update({
    deleted_at: new Date(),
    deleted_by: userId
  });

  return entity;
}

/**
 * Activate ENTITY
 */
export async function activateENTITY(userId, entityId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: entityId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const entity = await ENTITY_MODEL.findOne({ where: whereClause });

  if (!entity) {
    throw new AppError('ENTITY غير موجود', 404);
  }

  if (entity.is_active) {
    throw new AppError('ENTITY مفعّل بالفعل', 400);
  }

  await entity.update({
    is_active: true,
    updated_by: userId
  });

  return entity;
}

/**
 * Deactivate ENTITY
 */
export async function deactivateENTITY(userId, entityId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: entityId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const entity = await ENTITY_MODEL.findOne({ where: whereClause });

  if (!entity) {
    throw new AppError('ENTITY غير موجود', 404);
  }

  if (!entity.is_active) {
    throw new AppError('ENTITY معطّل بالفعل', 400);
  }

  await entity.update({
    is_active: false,
    updated_by: userId
  });

  return entity;
}

/**
 * Get ENTITY statistics
 */
export async function getENTITYStats(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const organizationId = user.role === 'super_admin' ? null : user.organization_id;

  const whereClause = {
    deleted_at: null
  };

  if (organizationId) {
    whereClause.organization_id = organizationId;
  }

  const [total, active, inactive] = await Promise.all([
    ENTITY_MODEL.count({ where: whereClause }),
    ENTITY_MODEL.count({ where: { ...whereClause, is_active: true } }),
    ENTITY_MODEL.count({ where: { ...whereClause, is_active: false } })
  ]);

  return {
    total,
    active,
    inactive
  };
}

// Export all functions as default object
export default {
  getAllENTITYs,
  getENTITYById,
  createENTITY,
  updateENTITY,
  deleteENTITY,
  activateENTITY,
  deactivateENTITY,
  getENTITYStats
};
