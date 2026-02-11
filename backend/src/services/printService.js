/**
 * Print Service
 * إدارة عمليات الطباعة وتسجيلها
 */

import { User, Employee, Organization, Device, AuditLog } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Log employee print
 */
export async function logEmployeePrint(userId, employeeId, printType, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Check access permissions
  if (user.role !== 'super_admin' && employee.organization_id !== user.organization_id) {
    throw new AppError('غير مصرح لك بطباعة بيانات هذا الموظف', 403);
  }

  // Log print action
  await AuditLog.logAction({
    userId,
    action: 'print',
    resourceType: 'employee',
    resourceId: employeeId,
    description: `طباعة ${printType} للموظف: ${employee.name} (${employee.employee_no})`,
    ipAddress,
    newValues: {
      print_type: printType,
      employee_name: employee.name,
      employee_no: employee.employee_no,
      department: employee.department
    }
  });

  return {
    success: true,
    message: 'تم تسجيل عملية الطباعة بنجاح',
    employee: {
      id: employee.id,
      name: employee.name,
      employee_no: employee.employee_no,
      department: employee.department
    },
    print_type: printType
  };
}

/**
 * Log multiple employees print
 */
export async function logEmployeesBatchPrint(userId, employeeIds, printType, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employees = await Employee.findAll({
    where: {
      id: employeeIds
    }
  });

  if (employees.length === 0) {
    throw new AppError('لم يتم العثور على موظفين', 404);
  }

  // Check access permissions
  if (user.role !== 'super_admin') {
    const invalidAccess = employees.some(emp => emp.organization_id !== user.organization_id);
    if (invalidAccess) {
      throw new AppError('غير مصرح لك بطباعة بيانات بعض الموظفين', 403);
    }
  }

  // Log batch print action
  await AuditLog.logAction({
    userId,
    action: 'print_batch',
    resourceType: 'employee',
    resourceId: null,
    description: `طباعة ${printType} لعدد ${employees.length} موظف`,
    ipAddress,
    newValues: {
      print_type: printType,
      employees_count: employees.length,
      employee_ids: employeeIds,
      employee_names: employees.map(e => e.name)
    }
  });

  return {
    success: true,
    message: `تم تسجيل طباعة ${employees.length} موظف بنجاح`,
    employees_count: employees.length,
    print_type: printType
  };
}

/**
 * Log organization print
 */
export async function logOrganizationPrint(userId, organizationId, printType, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('غير مصرح - يجب أن تكون super admin', 403);
  }

  const organization = await Organization.findByPk(organizationId);
  if (!organization) {
    throw new AppError('المنظمة غير موجودة', 404);
  }

  // Log print action
  await AuditLog.logAction({
    userId,
    action: 'print',
    resourceType: 'organization',
    resourceId: organizationId,
    description: `طباعة ${printType} للمنظمة: ${organization.name}`,
    ipAddress,
    newValues: {
      print_type: printType,
      organization_name: organization.name,
      subscription_plan: organization.subscription_plan
    }
  });

  return {
    success: true,
    message: 'تم تسجيل عملية الطباعة بنجاح',
    organization: {
      id: organization.id,
      name: organization.name
    },
    print_type: printType
  };
}

/**
 * Log device print
 */
export async function logDevicePrint(userId, deviceId, printType, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const device = await Device.findByPk(deviceId);
  if (!device) {
    throw new AppError('الجهاز غير موجود', 404);
  }

  // Check access permissions
  if (user.role !== 'super_admin' && device.organization_id !== user.organization_id) {
    throw new AppError('غير مصرح لك بطباعة بيانات هذا الجهاز', 403);
  }

  // Log print action
  await AuditLog.logAction({
    userId,
    action: 'print',
    resourceType: 'device',
    resourceId: deviceId,
    description: `طباعة ${printType} للجهاز: ${device.name}`,
    ipAddress,
    newValues: {
      print_type: printType,
      device_name: device.name,
      device_type: device.device_type,
      serial_number: device.serial_number
    }
  });

  return {
    success: true,
    message: 'تم تسجيل عملية الطباعة بنجاح',
    device: {
      id: device.id,
      name: device.name,
      device_type: device.device_type
    },
    print_type: printType
  };
}

/**
 * Log report print
 */
export async function logReportPrint(userId, reportType, reportData, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Log print action
  await AuditLog.logAction({
    userId,
    action: 'print_report',
    resourceType: 'report',
    resourceId: null,
    description: `طباعة تقرير: ${reportType}`,
    ipAddress,
    newValues: {
      report_type: reportType,
      ...reportData
    }
  });

  return {
    success: true,
    message: 'تم تسجيل طباعة التقرير بنجاح',
    report_type: reportType
  };
}
