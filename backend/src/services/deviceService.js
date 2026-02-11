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

import { Organization, User, Device, Employee, AuditLog } from '../models/index.js';
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

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'create',
    resourceType: 'device',
    resourceId: device.id,
    description: `إضافة جهاز جديد: ${device.name}`,
    newValues: {
      name: device.name,
      device_type: device.device_type,
      ip_address: device.ip_address,
      serial_number: device.serial_number,
      organization_id: organizationId
    }
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

  // Store old values for audit
  const oldValues = {
    name: device.name,
    device_type: device.device_type,
    ip_address: device.ip_address,
    port: device.port,
    location: device.location,
    is_active: device.is_active
  };

  // Update fields
  await device.update({
    ...data,
    updated_by: userId
  });

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `تحديث بيانات الجهاز: ${device.name}`,
    oldValues,
    newValues: data
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

  // Log action before deletion
  await AuditLog.logAction({
    userId,
    action: 'delete',
    resourceType: 'device',
    resourceId: deviceId,
    description: `حذف الجهاز: ${device.name}`,
    oldValues: {
      name: device.name,
      device_type: device.device_type,
      ip_address: device.ip_address,
      serial_number: device.serial_number
    }
  });

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

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'activate',
    resourceType: 'device',
    resourceId: deviceId,
    description: `تفعيل الجهاز: ${device.name}`,
    oldValues: { is_active: false },
    newValues: { is_active: true }
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

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'deactivate',
    resourceType: 'device',
    resourceId: deviceId,
    description: `تعطيل الجهاز: ${device.name}`,
    oldValues: { is_active: true },
    newValues: { is_active: false }
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

    // Log action
    await AuditLog.logAction({
      userId,
      action: 'read',
      resourceType: 'device',
      resourceId: deviceId,
      description: `اختبار الاتصال بالجهاز: ${device.name} - ناجح`,
      newValues: { 
        is_online: true,
        firmware_version: result.deviceInfo.firmwareVersion,
        model: result.deviceInfo.model
      }
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

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `مزامنة الموظفين مع الجهاز: ${device.name}`,
    newValues: { 
      last_sync: new Date(),
      uploaded_faces: syncResults.uploadedFaces,
      total_employees: syncResults.totalEmployees,
      failed_uploads: syncResults.failedUploads
    }
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

/**
 * Discover devices in network
 * البحث عن أجهزة Hikvision في الشبكة
 */
export async function discoverDevices(userId, config) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { ipStart, ipEnd, port = 80, timeout = 5 } = config;

  if (!ipStart || !ipEnd) {
    throw new AppError('يجب تحديد نطاق IP', 400);
  }

  // Generate IP range
  const ipList = generateIPRange(ipStart, ipEnd);
  const devices = [];
  let scannedCount = 0;

  // Scan each IP (with limited concurrency)
  const BATCH_SIZE = 10;
  for (let i = 0; i < ipList.length; i += BATCH_SIZE) {
    const batch = ipList.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(async (ip) => {
        try {
          const client = new HikvisionClient({
            ip_address: ip,
            port,
            username: 'admin',
            password: 'admin' // Default for discovery
          });

          const result = await Promise.race([
            client.testConnection(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout * 1000)
            )
          ]);

          scannedCount++;

          if (result.success && result.connected) {
            // Check if device already exists
            const existingDevice = await Device.findOne({
              where: { ip_address: ip, deleted_at: null }
            });

            return {
              ip,
              port,
              deviceInfo: result.deviceInfo,
              alreadyAdded: !!existingDevice,
              existingDeviceId: existingDevice?.id
            };
          }
          return null;
        } catch (error) {
          scannedCount++;
          return null;
        }
      })
    );

    // Collect successful results
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        devices.push(result.value);
      }
    });
  }

  return {
    devices,
    totalScanned: scannedCount,
    found: devices.length
  };
}

/**
 * Helper function to generate IP range
 */
function generateIPRange(startIP, endIP) {
  const start = startIP.split('.').map(Number);
  const end = endIP.split('.').map(Number);
  const ips = [];

  for (let a = start[0]; a <= end[0]; a++) {
    for (let b = start[1]; b <= end[1]; b++) {
      for (let c = start[2]; c <= end[2]; c++) {
        for (let d = start[3]; d <= end[3]; d++) {
          ips.push(`${a}.${b}.${c}.${d}`);
        }
      }
    }
  }

  return ips;
}

/**
 * Get detailed device information
 * جلب معلومات تفصيلية عن الجهاز من الجهاز نفسه
 */
export async function getDeviceInfo(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Get device info
  const connectionResult = await client.testConnection();
  
  if (!connectionResult.success || !connectionResult.connected) {
    throw new AppError('الجهاز غير متصل', 503);
  }

  // Get capacity info
  const capacityResult = await client.getFaceCapacity();

  return {
    ...connectionResult.deviceInfo,
    capacity: capacityResult.success ? capacityResult.capacity : null,
    connectionStatus: {
      isConnected: true,
      lastChecked: new Date()
    }
  };
}

/**
 * Sync device time with server
 * مزامنة وقت الجهاز مع وقت السيرفر
 */
export async function syncDeviceTime(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Set current server time
  const serverTime = new Date();
  const result = await client.setTime(serverTime);

  if (!result.success) {
    throw new AppError(result.error || 'فشلت مزامنة الوقت', 500);
  }

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `مزامنة وقت الجهاز: ${device.name}`,
    newValues: { time_synced: serverTime }
  });

  return {
    deviceTime: serverTime,
    serverTime,
    synced: true,
    message: 'تمت مزامنة الوقت بنجاح'
  };
}

/**
 * Pull access logs from device
 * سحب سجلات الحضور من الجهاز
 */
export async function pullDeviceLogs(userId, deviceId, filters = {}) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  // Get logs from device
  const result = await client.getAccessLogs(filters);

  if (!result.success) {
    throw new AppError(result.error || 'فشل سحب السجلات', 500);
  }

  const logs = result.logs || [];
  const savedLogs = [];

  // Import AccessLog model (assuming it exists)
  const { AccessLog: AccessLogModel } = await import('../models/index.js');

  // Save each log to database
  for (const log of logs) {
    try {
      // Find employee by employee_no
      const employee = await Employee.findOne({
        where: {
          employee_no: log.employeeNo,
          organization_id: device.organization_id,
          deleted_at: null
        }
      });

      const savedLog = await AccessLogModel.create({
        device_id: deviceId,
        employee_id: employee?.id,
        employee_no: log.employeeNo,
        timestamp: log.timestamp,
        log_type: log.logType || 'check_in',
        verification_method: log.verificationMethod || 'face',
        temperature: log.temperature,
        mask_detection: log.maskDetection,
        photo: log.photo,
        raw_data: log
      });

      savedLogs.push(savedLog);
    } catch (error) {
      console.error(`Error saving log for employee ${log.employeeNo}:`, error);
    }
  }

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `سحب ${savedLogs.length} سجل من الجهاز: ${device.name}`,
    newValues: { logs_pulled: savedLogs.length }
  });

  return {
    count: savedLogs.length,
    totalReceived: logs.length,
    logs: savedLogs,
    message: `تم سحب ${savedLogs.length} سجل بنجاح`
  };
}

/**
 * Reboot device
 * إعادة تشغيل الجهاز
 */
export async function rebootDevice(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  const result = await client.reboot();

  if (!result.success) {
    throw new AppError(result.error || 'فشلت إعادة التشغيل', 500);
  }

  // Update device status to offline (will be online again after reboot)
  await device.update({
    is_online: false,
    last_seen: new Date()
  });

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `إعادة تشغيل الجهاز: ${device.name}`,
    newValues: { rebooted_at: new Date() }
  });

  return {
    success: true,
    message: 'تم إرسال أمر إعادة التشغيل للجهاز',
    note: 'سيعود الجهاز للاتصال خلال 1-2 دقيقة'
  };
}

/**
 * Clear device logs
 * مسح سجلات الجهاز من ذاكرته
 */
export async function clearDeviceLogs(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  const result = await client.clearLogs();

  if (!result.success) {
    throw new AppError(result.error || 'فشل مسح السجلات', 500);
  }

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'delete',
    resourceType: 'device',
    resourceId: deviceId,
    description: `مسح سجلات الجهاز: ${device.name}`,
    oldValues: { logs_cleared: true }
  });

  return {
    success: true,
    message: 'تم مسح سجلات الجهاز بنجاح',
    warning: 'تأكد من سحب السجلات قبل المسح'
  };
}

/**
 * Open door connected to device
 * فتح الباب المرتبط بالجهاز
 */
export async function openDoor(userId, deviceId, doorNumber = 1, duration = 5) {
  const device = await getDeviceById(userId, deviceId);

  const client = new HikvisionClient({
    ip_address: device.ip_address,
    port: device.port,
    username: device.username,
    password: device.password
  });

  const result = await client.openDoor(doorNumber, duration);

  if (!result.success) {
    throw new AppError(result.error || 'فشل فتح الباب', 500);
  }

  // Log action
  await AuditLog.logAction({
    userId,
    action: 'update',
    resourceType: 'device',
    resourceId: deviceId,
    description: `فتح الباب ${doorNumber} للجهاز: ${device.name}`,
    newValues: { door_number: doorNumber, duration }
  });

  return {
    success: true,
    message: `تم فتح الباب ${doorNumber} لمدة ${duration} ثواني`
  };
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
  activateLiveFaceCapture,
  discoverDevices,
  getDeviceInfo,
  syncDeviceTime,
  pullDeviceLogs,
  rebootDevice,
  clearDeviceLogs,
  openDoor
};
