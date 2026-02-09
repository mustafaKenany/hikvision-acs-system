import db from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

const { AttendanceLog, Employee, Device, Door, User, Organization } = db;

/**
 * Get employee activity logs (attendance logs)
 */
export const getEmployeeActivityLogs = async (userId, employeeId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId, {
    include: [{ model: Organization, as: 'organization' }]
  });

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Check employee exists and user has permission
  const employee = await Employee.findByPk(employeeId);
  
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (employee.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لعرض هذه البيانات', 403);
    }
  }

  // Build query filters
  const where = { employee_id: employeeId };

  if (filters.start_date) {
    where.event_time = {
      ...where.event_time,
      [Op.gte]: new Date(filters.start_date)
    };
  }

  if (filters.end_date) {
    where.event_time = {
      ...where.event_time,
      [Op.lte]: new Date(filters.end_date)
    };
  }

  if (filters.event_type) {
    where.event_type = filters.event_type;
  }

  if (filters.device_id) {
    where.device_id = filters.device_id;
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const offset = (page - 1) * limit;

  // Sort
  const order = [[filters.sort_by, filters.sort_order]];

  // Fetch logs
  const { count, rows: logs } = await AttendanceLog.findAndCountAll({
    where,
    include: [
      {
        model: Device,
        as: 'device',
        attributes: ['id', 'name', 'ip_address', 'location']
      },
      {
        model: Door,
        as: 'door',
        attributes: ['id', 'name', 'location'],
        required: false
      }
    ],
    limit,
    offset,
    order,
    distinct: true
  });

  // Format response for frontend
  const formattedLogs = logs.map(log => ({
    id: log.id,
    timestamp: log.event_time,
    device_name: log.device?.name || 'غير محدد',
    device_location: log.device?.location || '',
    door_name: log.door?.name || '',
    location: log.door?.location || log.device?.location || 'غير محدد',
    access_type: log.event_type === 'check_in' ? 'entry' : 'exit',
    event_type: log.event_type,
    verification_method: log.verification_method,
    status: log.is_successful ? 'granted' : 'denied',
    is_successful: log.is_successful,
    photo_url: log.photo_url,
    temperature: log.temperature,
    notes: log.notes
  }));

  return {
    logs: formattedLogs,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get all attendance logs (for access logs page)
 */
export const getAllAttendanceLogs = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId, {
    include: [{ model: Organization, as: 'organization' }]
  });

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Build query filters
  const where = {};

  // Filter by organization for non-super-admins
  if (currentUser.role !== 'super_admin') {
    // Only show logs from organization's employees
    const orgEmployees = await Employee.findAll({
      where: { organization_id: currentUser.organization_id },
      attributes: ['id']
    });
    where.employee_id = {
      [Op.in]: orgEmployees.map(e => e.id)
    };
  }

  if (filters.start_date) {
    where.event_time = {
      ...where.event_time,
      [Op.gte]: new Date(filters.start_date)
    };
  }

  if (filters.end_date) {
    where.event_time = {
      ...where.event_time,
      [Op.lte]: new Date(filters.end_date)
    };
  }

  if (filters.event_type) {
    where.event_type = filters.event_type;
  }

  if (filters.employee_id) {
    where.employee_id = filters.employee_id;
  }

  if (filters.device_id) {
    where.device_id = filters.device_id;
  }

  if (filters.verification_method) {
    where.verification_method = filters.verification_method;
  }

  if (filters.is_successful !== undefined) {
    where.is_successful = filters.is_successful === 'true';
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const offset = (page - 1) * limit;

  // Sort
  const order = [[filters.sort_by, filters.sort_order]];

  // Fetch logs
  const { count, rows: logs } = await AttendanceLog.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_no', 'name', 'photo_url']
      },
      {
        model: Device,
        as: 'device',
        attributes: ['id', 'name', 'ip_address', 'location']
      },
      {
        model: Door,
        as: 'door',
        attributes: ['id', 'name', 'location'],
        required: false
      }
    ],
    limit,
    offset,
    order,
    distinct: true
  });

  // Format response
  const formattedLogs = logs.map(log => ({
    id: log.id,
    timestamp: log.event_time,
    employee_id: log.employee?.id,
    employee_no: log.employee?.employee_no,
    employee_name: log.employee?.name || 'غير محدد',
    employee_photo: log.employee?.photo_url,
    device_id: log.device?.id,
    device_name: log.device?.name || 'غير محدد',
    device_location: log.device?.location || '',
    door_name: log.door?.name || '',
    location: log.door?.location || log.device?.location || 'غير محدد',
    event_type: log.event_type,
    access_type: log.event_type === 'check_in' ? 'entry' : 'exit',
    verification_method: log.verification_method,
    status: log.is_successful ? 'granted' : 'denied',
    is_successful: log.is_successful,
    photo_url: log.photo_url,
    temperature: log.temperature,
    notes: log.notes
  }));

  return {
    logs: formattedLogs,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Build query filters
  const where = {};

  // Filter by organization for non-super-admins
  if (currentUser.role !== 'super_admin') {
    const orgEmployees = await Employee.findAll({
      where: { organization_id: currentUser.organization_id },
      attributes: ['id']
    });
    where.employee_id = {
      [Op.in]: orgEmployees.map(e => e.id)
    };
  }

  if (filters.start_date) {
    where.event_time = {
      ...where.event_time,
      [Op.gte]: new Date(filters.start_date)
    };
  }

  if (filters.end_date) {
    where.event_time = {
      ...where.event_time,
      [Op.lte]: new Date(filters.end_date)
    };
  }

  if (filters.employee_id) {
    where.employee_id = filters.employee_id;
  }

  if (filters.device_id) {
    where.device_id = filters.device_id;
  }

  // Get total logs
  const totalLogs = await AttendanceLog.count({ where });

  // Get successful logs
  const successfulLogs = await AttendanceLog.count({
    where: { ...where, is_successful: true }
  });

  // Get failed logs
  const failedLogs = await AttendanceLog.count({
    where: { ...where, is_successful: false }
  });

  // Get check-ins
  const checkIns = await AttendanceLog.count({
    where: { ...where, event_type: 'check_in' }
  });

  // Get check-outs
  const checkOuts = await AttendanceLog.count({
    where: { ...where, event_type: 'check_out' }
  });

  // Get verification methods distribution
  const verificationMethods = await AttendanceLog.findAll({
    where,
    attributes: [
      'verification_method',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
    ],
    group: ['verification_method'],
    raw: true
  });

  return {
    total: totalLogs,
    successful: successfulLogs,
    failed: failedLogs,
    check_ins: checkIns,
    check_outs: checkOuts,
    verification_methods: verificationMethods.reduce((acc, item) => {
      acc[item.verification_method] = parseInt(item.count);
      return acc;
    }, {})
  };
};
