/**
 * Organization Service
 * إدارة المؤسسات (Organization Management)
 * 
 * Handles:
 * - Organization CRUD operations
 * - Subscription management
 * - Organization settings & limits
 * - Super admin only operations
 */

import { Organization, User, Device, Employee, AuditLog } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get all organizations with filtering, pagination, and search
 * Super admin only
 */
export async function getAllOrganizations(userId, filters = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    subscription_plan,
    is_active,
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

  // Add search
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Add filters
  if (subscription_plan) {
    whereClause.subscription_plan = subscription_plan;
  }

  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true' || is_active === true;
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Query
  const { count, rows } = await Organization.findAndCountAll({
    where: whereClause,
    order: [[sort_by, sort_order.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id', 'name', 'email', 'role'],
        limit: 5 // Show first 5 users only
      },
      {
        model: Device,
        as: 'devices',
        attributes: ['id', 'name', 'is_active'],
        limit: 5
      },
      {
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'employee_no', 'is_active'],
        limit: 5
      }
    ]
  });

  // Add stats for each organization
  const organizationsWithStats = await Promise.all(
    rows.map(async (org) => {
      const stats = await getOrganizationStats(userId, org.id);
      return {
        ...org.toJSON(),
        stats
      };
    })
  );

  return {
    organizations: organizationsWithStats,
    pagination: {
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      limit: parseInt(limit)
    }
  };
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Super admin can view any organization
  // Other users can only view their own organization
  if (user.role !== 'super_admin' && user.organization_id !== parseInt(organizationId)) {
    throw new AppError('غير مصرح - يمكنك فقط عرض مؤسستك', 403);
  }

  const organization = await Organization.findByPk(organizationId, {
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id', 'name', 'email', 'role', 'is_active']
      },
      {
        model: Device,
        as: 'devices',
        attributes: ['id', 'name', 'device_type', 'is_active', 'is_online']
      },
      {
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'employee_no', 'is_active']
      }
    ]
  });

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Add stats
  const stats = await getOrganizationStats(userId, organizationId);

  return {
    ...organization.toJSON(),
    stats,
    subscription_active: organization.isSubscriptionActive()
  };
}

/**
 * Create new organization
 * Super admin only
 */
export async function createOrganization(userId, data) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  // Check for duplicate email
  const existingOrg = await Organization.findOne({
    where: { email: data.email }
  });

  if (existingOrg) {
    throw new AppError('البريد الإلكتروني مستخدم من قبل مؤسسة أخرى', 409);
  }

  // Set default subscription dates if plan is provided
  if (data.subscription_plan && data.subscription_plan !== 'free') {
    if (!data.subscription_start) {
      data.subscription_start = new Date();
    }
    if (!data.subscription_end) {
      // Default to 1 year from start
      const endDate = new Date(data.subscription_start);
      endDate.setFullYear(endDate.getFullYear() + 1);
      data.subscription_end = endDate;
    }
  }

  // Set limits based on subscription plan
  const planLimits = {
    free: { max_employees: 10, max_devices: 1, storage_limit_mb: 100 },
    basic: { max_employees: 50, max_devices: 3, storage_limit_mb: 500 },
    pro: { max_employees: 200, max_devices: 10, storage_limit_mb: 2000 },
    enterprise: { max_employees: 1000, max_devices: 50, storage_limit_mb: 10000 }
  };

  const plan = data.subscription_plan || 'free';
  const limits = planLimits[plan];

  // Create organization
  const organization = await Organization.create({
    ...data,
    max_employees: data.max_employees || limits.max_employees,
    max_devices: data.max_devices || limits.max_devices,
    storage_limit_mb: data.storage_limit_mb || limits.storage_limit_mb
  });

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'create',
    resourceType: 'organization',
    resourceId: organization.id,
    description: `إنشاء منظمة جديدة: ${organization.name}`,
    newValues: organization.toJSON()
  });

  return await getOrganizationById(userId, organization.id);
}

/**
 * Update organization
 */
export async function updateOrganization(userId, organizationId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Super admin can update any organization
  // Admin can only update their own organization (limited fields)
  if (user.role !== 'super_admin' && user.organization_id !== parseInt(organizationId)) {
    throw new AppError('غير مصرح - يمكنك فقط تحديث مؤسستك', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Check for duplicate email if changing
  if (data.email && data.email !== organization.email) {
    const existingOrg = await Organization.findOne({
      where: {
        email: data.email,
        id: { [Op.ne]: organizationId }
      }
    });

    if (existingOrg) {
      throw new AppError('البريد الإلكتروني مستخدم من قبل مؤسسة أخرى', 409);
    }
  }

  // Non-super admins can only update limited fields
  if (user.role !== 'super_admin') {
    const allowedFields = ['name', 'phone', 'address', 'settings'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    data = updateData;
  }

  // Store old values for audit log
  const oldValues = organization.toJSON();

  // Update organization
  await organization.update(data);

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'organization',
    resourceId: organizationId,
    description: `تحديث بيانات المنظمة: ${organization.name}`,
    oldValues,
    newValues: organization.toJSON()
  });

  return await getOrganizationById(userId, organizationId);
}

/**
 * Delete organization
 * - If organization has employees/devices: soft delete (deactivate)
 * - If organization is empty: hard delete
 * Super admin only
 */
export async function deleteOrganization(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Check if organization has employees or devices
  const employeesCount = await Employee.count({
    where: { organization_id: organizationId }
  });

  const devicesCount = await Device.count({
    where: { organization_id: organizationId }
  });

  const hasData = employeesCount > 0 || devicesCount > 0;

  if (hasData) {
    // Soft delete: Deactivate organization and all related data
    
    // Deactivate all users in the organization (except super_admin)
    await User.update(
      { is_active: false },
      {
        where: {
          organization_id: organizationId,
          role: { [Op.ne]: 'super_admin' } // Don't deactivate super_admin
        }
      }
    );

    // Deactivate all employees in the organization
    await Employee.update(
      { is_active: false },
      {
        where: {
          organization_id: organizationId
        }
      }
    );

    // Deactivate all devices in the organization
    await Device.update(
      { is_active: false },
      {
        where: {
          organization_id: organizationId
        }
      }
    );

    // Deactivate the organization
    await organization.update({ is_active: false });

    // Log action
    await AuditLog.logAction({
      userId,
      action: 'deactivate',
      resourceType: 'organization',
      resourceId: organizationId,
      description: `تعطيل المنظمة: ${organization.name} (تحتوي على ${employeesCount} موظف و ${devicesCount} جهاز)`,
      oldValues: { is_active: true },
      newValues: { is_active: false, employees_count: employeesCount, devices_count: devicesCount }
    });

    return {
      type: 'deactivated',
      message: `تم تعطيل المنظمة لأنها تحتوي على ${employeesCount} موظف و ${devicesCount} جهاز. تم تعطيل جميع البيانات المرتبطة`,
      organization_id: organizationId,
      employees_count: employeesCount,
      devices_count: devicesCount
    };
  } else {
    // Hard delete: Organization is empty
    
    // Delete any users (except super_admin - should be none or only inactive)
    await User.destroy({
      where: {
        organization_id: organizationId,
        role: { [Op.ne]: 'super_admin' } // Don't delete super_admin
      }
    });

    // Log action before deletion
    await AuditLog.logAction({
      userId,
      action: 'delete',
      resourceType: 'organization',
      resourceId: organizationId,
      description: `حذف المنظمة نهائياً: ${organization.name} (كانت فارغة)`,
      oldValues: organization.toJSON()
    });

    // Delete the organization permanently
    await organization.destroy();

    return {
      type: 'deleted',
      message: 'تم حذف المنظمة نهائياً لأنها كانت فارغة',
      organization_id: organizationId
    };
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Access control
  if (user.role !== 'super_admin' && user.organization_id !== parseInt(organizationId)) {
    throw new AppError('غير مصرح', 403);
  }

  // Get counts
  const [totalUsers, activeUsers, totalDevices, activeDevices, onlineDevices, totalEmployees, activeEmployees] = await Promise.all([
    User.count({ where: { organization_id: organizationId } }),
    User.count({ where: { organization_id: organizationId, is_active: true } }),
    Device.count({ where: { organization_id: organizationId, deleted_at: null } }),
    Device.count({ where: { organization_id: organizationId, is_active: true, deleted_at: null } }),
    Device.count({ where: { organization_id: organizationId, is_online: true, deleted_at: null } }),
    Employee.count({ where: { organization_id: organizationId } }),
    Employee.count({ where: { organization_id: organizationId, is_active: true } })
  ]);

  const organization = await Organization.findByPk(organizationId);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers
    },
    devices: {
      total: totalDevices,
      active: activeDevices,
      online: onlineDevices,
      offline: activeDevices - onlineDevices,
      limit: organization.max_devices,
      available: organization.max_devices - totalDevices
    },
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: totalEmployees - activeEmployees,
      limit: organization.max_employees,
      available: organization.max_employees - totalEmployees
    },
    storage: {
      limit_mb: organization.storage_limit_mb,
      // TODO: Calculate actual usage from file uploads
      used_mb: 0,
      available_mb: organization.storage_limit_mb
    }
  };
}

/**
 * Update subscription
 * Super admin only
 */
export async function updateSubscription(userId, organizationId, subscriptionData) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  const { subscription_plan, subscription_start, subscription_end } = subscriptionData;

  // Update limits based on new plan
  const planLimits = {
    free: { max_employees: 10, max_devices: 1, storage_limit_mb: 100 },
    basic: { max_employees: 50, max_devices: 3, storage_limit_mb: 500 },
    pro: { max_employees: 200, max_devices: 10, storage_limit_mb: 2000 },
    enterprise: { max_employees: 1000, max_devices: 50, storage_limit_mb: 10000 }
  };

  const limits = planLimits[subscription_plan] || planLimits.free;

  await organization.update({
    subscription_plan,
    subscription_start: subscription_start || new Date(),
    subscription_end,
    max_employees: subscriptionData.max_employees || limits.max_employees,
    max_devices: subscriptionData.max_devices || limits.max_devices,
    storage_limit_mb: subscriptionData.storage_limit_mb || limits.storage_limit_mb
  });

  return await getOrganizationById(userId, organizationId);
}

/**
 * Activate organization
 * Super admin only
 */
export async function activateOrganization(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  if (organization.is_active) {
    throw new AppError('المؤسسة مفعلة بالفعل', 400);
  }

  await organization.update({ is_active: true });

  return await getOrganizationById(userId, organizationId);
}

/**
 * Deactivate organization
 * Super admin only
 */
export async function deactivateOrganization(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  if (!organization.is_active) {
    throw new AppError('المؤسسة معطلة بالفعل', 400);
  }

  await organization.update({ is_active: false });

  return await getOrganizationById(userId, organizationId);
}

/**
 * Get organization settings
 */
export async function getOrganizationSettings(userId, organizationId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Access control
  if (user.role !== 'super_admin' && user.organization_id !== parseInt(organizationId)) {
    throw new AppError('غير مصرح', 403);
  }

  const organization = await Organization.findByPk(organizationId, {
    attributes: ['id', 'name', 'settings']
  });

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  return {
    organization_id: organization.id,
    organization_name: organization.name,
    settings: organization.settings || {}
  };
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettings(userId, organizationId, settings) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Admin or super_admin can update settings
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    throw new AppError('غير مصرح - يجب أن تكون admin أو super_admin', 403);
  }

  if (user.role !== 'super_admin' && user.organization_id !== parseInt(organizationId)) {
    throw new AppError('غير مصرح - يمكنك فقط تحديث إعدادات مؤسستك', 403);
  }

  const organization = await Organization.findByPk(organizationId);

  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Merge new settings with existing ones
  const currentSettings = organization.settings || {};
  const updatedSettings = { ...currentSettings, ...settings };

  await organization.update({ settings: updatedSettings });

  return {
    organization_id: organization.id,
    organization_name: organization.name,
    settings: updatedSettings
  };
}

/**
 * Update organization logo
 */
export async function updateOrganizationLogo(userId, organizationId, logoUrl) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const organization = await Organization.findByPk(organizationId);
  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Authorization: super_admin or admin of same organization
  if (user.role !== 'super_admin') {
    if (user.role !== 'admin' || user.organization_id !== organizationId) {
      throw new AppError('غير مصرح - يمكنك فقط تحديث شعار مؤسستك', 403);
    }
  }

  // If removing logo, delete old file
  if (!logoUrl && organization.logo_url) {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const oldLogoPath = path.join(__dirname, '../..', organization.logo_url);
    
    if (fs.existsSync(oldLogoPath)) {
      fs.unlinkSync(oldLogoPath);
    }
  }

  // Update organization logo
  await organization.update({ logo_url: logoUrl });

  return await getOrganizationById(userId, organizationId);
}
