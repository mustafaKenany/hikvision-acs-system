/**
 * Device Service
 * إدارة الأجهزة (Device Management)
 * 
 * Handles:
 * - Device registration & configuration
 * - Status monitoring (online/offline)
 * - Organization isolation
 * - Device sync operations
 */

import { Organization, User, Device, Employee } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';
import HikvisionClient from '../utils/hikvisionClient.js';
import fs from 'fs/promises';

/**
 * Get all devices with filtering, pagination, and search
 */
export async function getAllDevices(userId, filters = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    is_active,
    is_online,
    device_type,
    location,
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

  // For super_admin without org filter, use the filters.organization_id if provided
  // Otherwise, use user's organization_id
  const organizationId = user.role === 'super_admin' && filters.organization_id
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
      { ip_address: { [Op.iLike]: `%${search}%` } },
      { serial_number: { [Op.iLike]: `%${search}%` } },
      { location: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Add filters
  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true' || is_active === true;
  }

  if (is_online !== undefined) {
    whereClause.is_online = is_online === 'true' || is_online === true;
  }

  if (device_type) {
    whereClause.device_type = device_type;
  }

  if (location) {
    whereClause.location = { [Op.iLike]: `%${location}%` };
  }

  // Calculate pagination
  const offset = (page - 1) * limit;

  // Query
  const { count, rows } = await Device.findAndCountAll({
    where: whereClause,
    order: [[sort_by, sort_order.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      { model: Organization, as: 'organization', attributes: ['id', 'name', 'subscription_plan'] }
    ]
  });

  return {
    devices: rows,
    pagination: {
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      limit: parseInt(limit)
    }
  };
}

/**
 * Get device by ID
 */
export async function getDeviceById(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  // Organization isolation (except super_admin)
  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({
    where: whereClause,
    include: [
      { model: Organization, as: 'organization', attributes: ['id', 'name', 'subscription_plan'] }
    ]
  });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  return device;
}

/**
 * Create new device
 */
export async function createDevice(userId, data) {
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

  // Check for duplicate IP address
  const existingByIP = await Device.findOne({
    where: {
      ip_address: data.ip_address,
      organization_id: organizationId,
      deleted_at: null
    }
  });
  
  if (existingByIP) {
    throw new AppError('عنوان IP موجود مسبقاً في المؤسسة', 409);
  }

  // Check for duplicate serial number (if provided)
  if (data.serial_number) {
    const existingBySerial = await Device.findOne({
      where: {
        serial_number: data.serial_number,
        deleted_at: null
      }
    });

    if (existingBySerial) {
      throw new AppError('الرقم التسلسلي موجود مسبقاً', 409);
    }
  }

  // Check for duplicate MAC address (if provided)
  if (data.mac_address) {
    const existingByMAC = await Device.findOne({
      where: {
        mac_address: data.mac_address,
        deleted_at: null
      }
    });

    if (existingByMAC) {
      throw new AppError('عنوان MAC موجود مسبقاً', 409);
    }
  }

  // Create device
  const device = await Device.create({
    ...data,
    organization_id: organizationId,
    created_by: userId
  });

  // Return with organization details
  return await getDeviceById(userId, device.id);
}

/**
 * Update device
 */
export async function updateDevice(userId, deviceId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  // Check for duplicate IP if changing
  if (data.ip_address && data.ip_address !== device.ip_address) {
    const existingByIP = await Device.findOne({
      where: {
        ip_address: data.ip_address,
        organization_id: device.organization_id,
        id: { [Op.ne]: deviceId },
        deleted_at: null
      }
    });

    if (existingByIP) {
      throw new AppError('عنوان IP موجود مسبقاً في المؤسسة', 409);
    }
  }

  // Check for duplicate serial number if changing
  if (data.serial_number && data.serial_number !== device.serial_number) {
    const existingBySerial = await Device.findOne({
      where: {
        serial_number: data.serial_number,
        id: { [Op.ne]: deviceId },
        deleted_at: null
      }
    });

    if (existingBySerial) {
      throw new AppError('الرقم التسلسلي موجود مسبقاً', 409);
    }
  }

  // Check for duplicate MAC if changing
  if (data.mac_address && data.mac_address !== device.mac_address) {
    const existingByMAC = await Device.findOne({
      where: {
        mac_address: data.mac_address,
        id: { [Op.ne]: deviceId },
        deleted_at: null
      }
    });

    if (existingByMAC) {
      throw new AppError('عنوان MAC موجود مسبقاً', 409);
    }
  }

  // Update fields
  await device.update({
    ...data,
    updated_by: userId
  });

  return await getDeviceById(userId, deviceId);
}

/**
 * Delete device (soft delete)
 */
export async function deleteDevice(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  // Soft delete
  await device.update({
    deleted_at: new Date(),
    deleted_by: userId
  });

  return device;
}

/**
 * Activate device
 */
export async function activateDevice(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  if (device.is_active) {
    throw new AppError('الجهاز مفعّل بالفعل', 400);
  }

  await device.update({
    is_active: true,
    updated_by: userId
  });

  return await getDeviceById(userId, deviceId);
}

/**
 * Deactivate device
 */
export async function deactivateDevice(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  if (!device.is_active) {
    throw new AppError('الجهاز معطّل بالفعل', 400);
  }

  await device.update({
    is_active: false,
    updated_by: userId
  });

  return await getDeviceById(userId, deviceId);
}

/**
 * Get device statistics
 */
export async function getDeviceStats(userId) {
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

  const [total, active, inactive, online, offline, byType] = await Promise.all([
    Device.count({ where: whereClause }),
    Device.count({ where: { ...whereClause, is_active: true } }),
    Device.count({ where: { ...whereClause, is_active: false } }),
    Device.count({ where: { ...whereClause, is_online: true } }),
    Device.count({ where: { ...whereClause, is_online: false } }),
    Device.findAll({
      where: whereClause,
      attributes: [
        'device_type',
        [Device.sequelize.fn('COUNT', Device.sequelize.col('id')), 'count']
      ],
      group: ['device_type'],
      raw: true
    })
  ]);

  // Convert byType to object
  const deviceTypeStats = {};
  byType.forEach(item => {
    deviceTypeStats[item.device_type] = parseInt(item.count);
  });

  return {
    total,
    active,
    inactive,
    online,
    offline,
    byType: deviceTypeStats
  };
}

/**
 * Get device status (online/offline)
 */
export async function getDeviceStatus(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);

  // TODO: Implement actual device ping/check via HikVision SDK
  // For now, return stored status
  return {
    device_id: device.id,
    name: device.name,
    is_online: device.is_online,
    last_seen: device.last_seen,
    last_sync: device.last_sync,
    firmware_version: device.firmware_version
  };
}

/**
 * Test connection to physical device
 */
export async function testConnection(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  if (!device.is_active) {
    throw new AppError('لا يمكن الاتصال بجهاز معطّل', 400);
  }

  // Create Hikvision client
  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Test connection
  const result = await client.testConnection();

  if (result.success) {
    // Update device info
    await device.update({
      is_online: true,
      last_seen: new Date(),
      firmware_version: result.deviceInfo.firmwareVersion,
      model: result.deviceInfo.model,
      serial_number: result.deviceInfo.serialNumber
    });

    return {
      success: true,
      connected: true,
      device_id: device.id,
      device_name: device.name,
      deviceInfo: result.deviceInfo,
      message: 'تم الاتصال بالجهاز بنجاح'
    };
  } else {
    // Mark device as offline
    await device.update({
      is_online: false,
      last_seen: new Date()
    });

    throw new AppError(`فشل الاتصال بالجهاز: ${result.error}`, 500);
  }
}

/**
 * Sync device data
 */
export async function syncDevice(userId, deviceId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  if (!device.is_active) {
    throw new AppError('لا يمكن مزامنة جهاز معطّل', 400);
  }

  // Create Hikvision client
  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Test connection first
  const connectionTest = await client.testConnection();
  if (!connectionTest.success) {
    await device.update({ is_online: false, last_seen: new Date() });
    throw new AppError(`فشل الاتصال بالجهاز: ${connectionTest.error}`, 500);
  }

  // Update device info
  await device.update({
    is_online: true,
    last_seen: new Date(),
    firmware_version: connectionTest.deviceInfo.firmwareVersion,
    model: connectionTest.deviceInfo.model,
    serial_number: connectionTest.deviceInfo.serialNumber
  });

  const syncResults = {
    deviceInfo: connectionTest.deviceInfo,
    uploadedFaces: 0,
    failedUploads: 0,
    errors: []
  };

  // Get face capacity
  const capacityResult = await client.getFaceCapacity();
  if (capacityResult.success) {
    await device.update({
      max_faces: parseInt(capacityResult.capacity.maxFaceNumPerLib) || device.max_faces
    });
    syncResults.capacity = capacityResult.capacity;
  }

  // Sync employees with photos
  if (device.device_type === 'face_recognition') {
    const employees = await Employee.findAll({
      where: {
        organization_id: device.organization_id,
        photo_url: { [Op.ne]: null },
        is_active: true,
        deleted_at: null
      }
    });

    syncResults.totalEmployees = employees.length;

    for (const employee of employees) {
      try {
        // Read photo file
        const photoPath = employee.photo_url.replace('/uploads/', 'uploads/');
        let imageBase64 = null;

        try {
          const imageBuffer = await fs.readFile(photoPath);
          imageBase64 = imageBuffer.toString('base64');
        } catch (fileError) {
          syncResults.errors.push({
            employee: employee.name,
            error: 'Photo file not found'
          });
          syncResults.failedUploads++;
          continue;
        }

        // Upload face to device
        const uploadResult = await client.uploadFace({
          employeeNo: employee.employee_no,
          name: employee.name,
          faceLibId: 1,
          imageBase64: imageBase64
        });

        if (uploadResult.success) {
          syncResults.uploadedFaces++;
          
          // Update employee with device sync info
          await employee.update({
            synced_to_device: true,
            last_synced_at: new Date()
          });
        } else {
          syncResults.failedUploads++;
          syncResults.errors.push({
            employee: employee.name,
            error: uploadResult.error
          });
        }
      } catch (error) {
        syncResults.failedUploads++;
        syncResults.errors.push({
          employee: employee.name,
          error: error.message
        });
      }
    }
  }

  // Update last sync timestamp
  await device.update({
    last_sync: new Date()
  });

  return {
    success: true,
    device_id: device.id,
    device_name: device.name,
    synced_at: device.last_sync,
    results: syncResults,
    message: `تمت المزامنة بنجاح - تم رفع ${syncResults.uploadedFaces} وجه من أصل ${syncResults.totalEmployees || 0}`
  };
}

/**
 * Activate live face capture mode on device
 */
export async function activateLiveFaceCapture(userId, deviceId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {
    id: deviceId,
    deleted_at: null
  };

  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const device = await Device.findOne({ where: whereClause });

  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  if (!device.is_active) {
    throw new AppError('لا يمكن استخدام جهاز معطّل', 400);
  }

  // Get employee
  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      organization_id: device.organization_id,
      deleted_at: null
    }
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Create Hikvision client
  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Activate live capture
  const result = await client.startLiveFaceCapture({
    employeeNo: employee.employee_no,
    name: employee.name
  });

  if (result.success) {
    return {
      success: true,
      device_id: device.id,
      device_name: device.name,
      device_ip: device.ip_address,
      employee: {
        id: employee.id,
        name: employee.name,
        employee_no: employee.employee_no
      },
      message: result.message,
      instructions: [
        '1. روح قدام الجهاز',
        '2. اطلع بوجهك للكاميرا',
        '3. الجهاز راح ياخذ صورة تلقائياً',
        '4. انتظر رسالة النجاح على الجهاز'
      ]
    };
  } else {
    throw new AppError(result.error || 'فشل تفعيل وضع التقاط الوجه', 500);
  }
}

// Export all functions
export default {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  activateDevice,
  deactivateDevice,
  getDeviceStats,
  getDeviceStatus,
  testConnection,
  syncDevice,
  activateLiveFaceCapture
};
