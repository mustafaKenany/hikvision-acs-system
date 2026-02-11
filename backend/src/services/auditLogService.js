/**
 * Audit Log Service
 * إدارة سجل المراجعة والعمليات
 */

import { AuditLog, User } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get all audit logs with filtering, pagination, and search
 * Super admin only
 */
export async function getAllAuditLogs(userId, filters = {}) {
  const {
    page = 1,
    limit = 50,
    action,
    resource_type,
    user_id,
    start_date,
    end_date,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = filters;

  // Verify user is super_admin
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  // Build where clause
  const whereClause = {};

  // Add filters
  if (action) {
    whereClause.action = action;
  }

  if (resource_type) {
    whereClause.resource_type = resource_type;
  }

  if (user_id) {
    whereClause.user_id = parseInt(user_id);
  }

  // Date range filter
  if (start_date || end_date) {
    whereClause.created_at = {};
    if (start_date) {
      whereClause.created_at[Op.gte] = new Date(start_date);
    }
    if (end_date) {
      const endDateTime = new Date(end_date);
      endDateTime.setHours(23, 59, 59, 999);
      whereClause.created_at[Op.lte] = endDateTime;
    }
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Query
  const { count, rows } = await AuditLog.findAndCountAll({
    where: whereClause,
    order: [[sort_by, sort_order.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }
    ]
  });

  return {
    logs: rows,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      total_items: count,
      items_per_page: parseInt(limit)
    }
  };
}

/**
 * Get single audit log by ID
 */
export async function getAuditLogById(userId, logId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const log = await AuditLog.findByPk(logId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }
    ]
  });

  if (!log) {
    throw new AppError('السجل غير موجود', 404);
  }

  return log;
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(userId, resourceType, resourceId, filters = {}) {
  const {
    page = 1,
    limit = 50,
    action,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = filters;

  // Verify user permissions
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Build where clause
  const whereClause = {
    resource_type: resourceType,
    resource_id: resourceId
  };

  if (action) {
    whereClause.action = action;
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Query
  const { count, rows } = await AuditLog.findAndCountAll({
    where: whereClause,
    order: [[sort_by, sort_order.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }
    ]
  });

  return {
    logs: rows,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      total_items: count,
      items_per_page: parseInt(limit)
    }
  };
}
