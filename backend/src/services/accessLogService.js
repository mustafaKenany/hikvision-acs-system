/**
 * Access Log Service
 * خدمة سجلات الدخول والخروج
 */

import { Op } from 'sequelize';
import AccessLog from '../models/AccessLog.js';
import { Device, Employee, Organization, User, AuditLog } from '../models/index.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Get all access logs with filtering and pagination
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Access logs with pagination
 */
export async function getAllAccessLogs(filters = {}) {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      deviceId,
      employeeId,
      employeeNo,
      logType,
      verificationMethod,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      is_deleted: false
    };

    // Search by employee name or number
    if (search) {
      where[Op.or] = [
        { employee_name: { [Op.iLike]: `%${search}%` } },
        { employee_no: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by device
    if (deviceId) {
      where.device_id = deviceId;
    }

    // Filter by employee
    if (employeeId) {
      where.employee_id = employeeId;
    }

    // Filter by employee number
    if (employeeNo) {
      where.employee_no = employeeNo;
    }

    // Filter by log type
    if (logType) {
      where.log_type = logType;
    }

    // Filter by verification method
    if (verificationMethod) {
      where.verification_method = verificationMethod;
    }

    // Filter by date range
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.timestamp = {
        [Op.lte]: new Date(endDate)
      };
    }

    const { count, rows } = await AccessLog.findAndCountAll({
      where,
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'name', 'device_type', 'location'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'employee_no', 'photo_url', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    return {
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw new Error(`فشل جلب سجلات الدخول: ${error.message}`);
  }
}

/**
 * Get access log by ID
 * @param {number} logId - Log ID
 * @returns {Promise<Object>} Access log
 */
export async function getAccessLogById(logId) {
  try {
    const log = await AccessLog.findOne({
      where: {
        id: logId,
        is_deleted: false
      },
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'name', 'device_type', 'location', 'ip_address'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'employee_no', 'photo_url', 'email', 'phone'],
          required: false
        }
      ]
    });

    if (!log) {
      throw new Error('سجل الدخول غير موجود');
    }

    return log;
  } catch (error) {
    throw new Error(`فشل جلب سجل الدخول: ${error.message}`);
  }
}

/**
 * Get access logs statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Statistics
 */
export async function getAccessLogsStats(filters = {}) {
  try {
    const now = new Date();
    
    // Today's logs
    const todayCount = await AccessLog.count({
      where: {
        is_deleted: false,
        timestamp: {
          [Op.between]: [startOfDay(now), endOfDay(now)]
        }
      }
    });

    // This week's logs
    const weekCount = await AccessLog.count({
      where: {
        is_deleted: false,
        timestamp: {
          [Op.between]: [startOfWeek(now, { weekStartsOn: 6 }), endOfWeek(now, { weekStartsOn: 6 })]
        }
      }
    });

    // This month's logs
    const monthCount = await AccessLog.count({
      where: {
        is_deleted: false,
        timestamp: {
          [Op.between]: [startOfMonth(now), endOfMonth(now)]
        }
      }
    });

    // Total logs
    const totalCount = await AccessLog.count({
      where: {
        is_deleted: false
      }
    });

    // Check-in vs Check-out today
    const todayCheckIns = await AccessLog.count({
      where: {
        is_deleted: false,
        log_type: 'check_in',
        timestamp: {
          [Op.between]: [startOfDay(now), endOfDay(now)]
        }
      }
    });

    const todayCheckOuts = await AccessLog.count({
      where: {
        is_deleted: false,
        log_type: 'check_out',
        timestamp: {
          [Op.between]: [startOfDay(now), endOfDay(now)]
        }
      }
    });

    // By verification method today
    const verificationStats = await AccessLog.findAll({
      attributes: [
        'verification_method',
        [AccessLog.sequelize.fn('COUNT', AccessLog.sequelize.col('id')), 'count']
      ],
      where: {
        is_deleted: false,
        timestamp: {
          [Op.between]: [startOfDay(now), endOfDay(now)]
        }
      },
      group: ['verification_method']
    });

    return {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      total: totalCount,
      todayCheckIns,
      todayCheckOuts,
      verificationMethods: verificationStats.reduce((acc, stat) => {
        acc[stat.verification_method] = parseInt(stat.dataValues.count);
        return acc;
      }, {})
    };
  } catch (error) {
    throw new Error(`فشل جلب إحصائيات السجلات: ${error.message}`);
  }
}

/**
 * Create access log manually
 * @param {number} userId - User creating the log
 * @param {Object} logData - Log data
 * @returns {Promise<Object>} Created log
 */
export async function createAccessLog(userId, logData) {
  try {
    // Validate user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // Validate device
    const device = await Device.findByPk(logData.device_id);
    if (!device) {
      throw new Error('الجهاز غير موجود');
    }

    // Try to find employee by employee_no
    let employee = null;
    if (logData.employee_no) {
      employee = await Employee.findOne({
        where: { employee_no: logData.employee_no, is_deleted: false }
      });
    }

    const log = await AccessLog.create({
      device_id: logData.device_id,
      employee_id: employee?.id || null,
      employee_no: logData.employee_no,
      employee_name: employee?.full_name || logData.employee_name || 'غير معروف',
      log_type: logData.log_type || 'unknown',
      verification_method: logData.verification_method || 'unknown',
      timestamp: logData.timestamp || new Date(),
      temperature: logData.temperature || null,
      mask_detection: logData.mask_detection || null,
      photo_url: logData.photo_url || null,
      door_number: logData.door_number || 1,
      event_type: logData.event_type || null,
      raw_data: logData.raw_data || null,
      sync_status: 'synced'
    });

    // Audit log
    await AuditLog.logAction(userId, 'access_log_create', 'AccessLog', log.id, {
      employee_no: log.employee_no,
      device_id: log.device_id
    });

    return log;
  } catch (error) {
    throw new Error(`فشل إنشاء سجل الدخول: ${error.message}`);
  }
}

/**
 * Delete access log (soft delete)
 * @param {number} userId - User performing the action
 * @param {number} logId - Log ID
 * @returns {Promise<Object>} Deleted log
 */
export async function deleteAccessLog(userId, logId) {
  try {
    // Validate user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    const log = await AccessLog.findByPk(logId);
    if (!log || log.is_deleted) {
      throw new Error('سجل الدخول غير موجود');
    }

    await log.update({ is_deleted: true });

    // Audit log
    await AuditLog.logAction(userId, 'access_log_delete', 'AccessLog', log.id, {
      employee_no: log.employee_no,
      timestamp: log.timestamp
    });

    return log;
  } catch (error) {
    throw new Error(`فشل حذف سجل الدخول: ${error.message}`);
  }
}

/**
 * Pull logs from all devices
 * @param {number} userId - User performing the action
 * @param {Object} filters - Optional filters (startDate, endDate)
 * @returns {Promise<Object>} Pull summary
 */
export async function pullLogsFromAllDevices(userId, filters = {}) {
  try {
    // Import deviceService to avoid circular dependency
    const deviceService = await import('./deviceService.js');

    // Validate user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // Get all active devices
    const devices = await Device.findAll({
      where: {
        is_active: true,
        is_deleted: false
      }
    });

    if (devices.length === 0) {
      throw new Error('لا توجد أجهزة نشطة');
    }

    const results = [];
    let totalNewLogs = 0;
    let totalExistingLogs = 0;

    // Pull logs from each device
    for (const device of devices) {
      try {
        const result = await deviceService.default.pullDeviceLogs(userId, device.id, filters);
        results.push({
          deviceId: device.id,
          deviceName: device.name,
          success: true,
          newLogs: result.newLogs,
          existingLogs: result.existingLogs
        });
        totalNewLogs += result.newLogs;
        totalExistingLogs += result.existingLogs;
      } catch (error) {
        results.push({
          deviceId: device.id,
          deviceName: device.name,
          success: false,
          error: error.message
        });
      }
    }

    // Audit log
    await AuditLog.logAction(userId, 'access_logs_pull_all', 'AccessLog', null, {
      devicesCount: devices.length,
      totalNewLogs,
      totalExistingLogs
    });

    return {
      totalDevices: devices.length,
      totalNewLogs,
      totalExistingLogs,
      results
    };
  } catch (error) {
    throw new Error(`فشل سحب السجلات من جميع الأجهزة: ${error.message}`);
  }
}

export default {
  getAllAccessLogs,
  getAccessLogById,
  getAccessLogsStats,
  createAccessLog,
  deleteAccessLog,
  pullLogsFromAllDevices
};
