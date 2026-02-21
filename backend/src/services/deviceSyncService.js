/**
 * Device Sync Service
 * مزامنة بيانات الموظفين من الأجهزة
 * الموظفين يتم تسجيلهم مباشرة على الجهاز، والنظام يجلبهم فقط
 */

import axios from 'axios';
import { Employee, Device, FaceTemplate, sequelize } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Fetch employees from device using ISAPI
 * جلب قائمة الموظفين من الجهاز عبر ISAPI
 */
async function fetchEmployeesFromDevice(device) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/AccessControl/UserInfo/Search?format=json`;
    
    console.log(`[DeviceSync] Fetching employees from device: ${device.name} (${device.ip_address})`);
    
    const response = await axios.post(url, {
      UserInfoSearchCond: {
        searchID: "1",
        searchResultPosition: 0,
        maxResults: 1000
      }
    }, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data?.UserInfoSearch?.UserInfo) {
      const users = Array.isArray(response.data.UserInfoSearch.UserInfo) 
        ? response.data.UserInfoSearch.UserInfo 
        : [response.data.UserInfoSearch.UserInfo];
      
      console.log(`[DeviceSync] Found ${users.length} employees on device`);
      return { success: true, employees: users };
    }

    return { success: true, employees: [] };

  } catch (error) {
    console.error(`[DeviceSync] Error fetching from device:`, error.message);
    return { 
      success: false, 
      error: `Failed to fetch from device: ${error.message}` 
    };
  }
}

/**
 * Fetch employee photo from device
 * جلب صورة الموظف من الجهاز
 */
async function fetchEmployeePhotoFromDevice(device, employeeNo) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&FDID=1&FPID=${employeeNo}`;
    
    const response = await axios.get(url, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      responseType: 'json',
      timeout: 10000
    });

    if (response.data?.FaceDataRecord?.faceURL) {
      // Extract base64 from data URL
      const base64Data = response.data.FaceDataRecord.faceURL.split(',')[1] || response.data.FaceDataRecord.faceURL;
      return { success: true, photo: base64Data };
    }

    return { success: false, error: 'No photo found' };

  } catch (error) {
    console.warn(`[DeviceSync] Could not fetch photo for employee ${employeeNo}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sync employees from device to system
 * مزامنة: جلب الموظفين الجدد من الجهاز وإضافتهم للنظام
 */
export async function syncEmployeesFromDevice(userId, deviceId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. التحقق من الجهاز
    const device = await Device.findByPk(deviceId);
    if (!device) {
      throw new AppError('الجهاز غير موجود', 404);
    }

    console.log(`[DeviceSync] Starting sync from device: ${device.name}`);

    // 2. جلب الموظفين من الجهاز
    const fetchResult = await fetchEmployeesFromDevice(device);
    if (!fetchResult.success) {
      throw new AppError(fetchResult.error, 500);
    }

    const deviceEmployees = fetchResult.employees;
    console.log(`[DeviceSync] Found ${deviceEmployees.length} employees on device`);

    // 3. جلب الموظفين الموجودين في النظام
    const existingEmployees = await Employee.findAll({
      where: {
        organization_id: device.organization_id
      },
      attributes: ['id', 'employee_no']
    });

    const existingEmployeeNos = new Set(
      existingEmployees.map(emp => emp.employee_no?.toString())
    );

    // 4. تحديد الموظفين الجدد فقط
    const newEmployees = deviceEmployees.filter(devEmp => {
      const empNo = devEmp.employeeNo?.toString();
      
      // Skip if no employee number
      if (!empNo) return false;
      
      // Skip if already exists in system
      if (existingEmployeeNos.has(empNo)) return false;
      
      // Skip if employee number is the device serial number (some Hikvision devices register themselves as employees)
      if (device.serial_number && empNo === device.serial_number) {
        console.log(`[DeviceSync] Skipping device serial number: ${empNo}`);
        return false;
      }
      
      return true;
    });

    console.log(`[DeviceSync] New employees to add: ${newEmployees.length}`);

    // 5. إضافة الموظفين الجدد للنظام
    const addedEmployees = [];
    const failedEmployees = [];

    for (const devEmp of newEmployees) {
      try {
        // إنشاء سجل الموظف
        const employee = await Employee.create({
          employee_no: devEmp.employeeNo,
          name: devEmp.name || `Employee ${devEmp.employeeNo}`,
          organization_id: device.organization_id,
          department: devEmp.department || null,
          position: null,
          email: null,
          phone: null,
          status: 'active',
          metadata: {
            synced_from_device: true,
            device_id: device.id,
            device_name: device.name,
            synced_at: new Date(),
            card_number: devEmp.numOfCard > 0 ? devEmp.cardNo : null,
            has_face: devEmp.numOfFace > 0
          }
        }, { transaction });

        // إذا عنده بصمة وجه، نسجلها
        if (devEmp.numOfFace > 0) {
          await FaceTemplate.create({
            employee_id: employee.id,
            device_id: device.id,
            face_id: devEmp.employeeNo,
            sync_status: 'synced',
            is_active: true,
            last_synced_at: new Date()
          }, { transaction });
        }

        addedEmployees.push({
          employee_no: employee.employee_no,
          name: employee.name,
          has_face: devEmp.numOfFace > 0,
          has_card: devEmp.numOfCard > 0
        });

        console.log(`[DeviceSync] ✅ Added employee: ${employee.name} (${employee.employee_no})`);

      } catch (error) {
        console.error(`[DeviceSync] ❌ Failed to add employee ${devEmp.employeeNo}:`, error.message);
        failedEmployees.push({
          employee_no: devEmp.employeeNo,
          name: devEmp.name,
          error: error.message
        });
      }
    }

    await transaction.commit();

    return {
      success: true,
      message: 'تمت المزامنة بنجاح',
      summary: {
        total_on_device: deviceEmployees.length,
        existing_in_system: existingEmployees.length,
        new_employees_found: newEmployees.length,
        successfully_added: addedEmployees.length,
        failed: failedEmployees.length
      },
      added_employees: addedEmployees,
      failed_employees: failedEmployees,
      device: {
        id: device.id,
        name: device.name,
        ip_address: device.ip_address
      }
    };

  } catch (error) {
    await transaction.rollback();
    console.error('[DeviceSync] Sync failed:', error);
    throw error;
  }
}

/**
 * Sync employees from all active devices
 * مزامنة من كل الأجهزة النشطة
 */
export async function syncEmployeesFromAllDevices(userId, organizationId) {
  try {
    const devices = await Device.findAll({
      where: {
        organization_id: organizationId,
        is_active: true
      }
    });

    console.log(`[DeviceSync] Starting sync from ${devices.length} devices`);

    const results = [];

    for (const device of devices) {
      try {
        const syncResult = await syncEmployeesFromDevice(userId, device.id);
        results.push({
          device_id: device.id,
          device_name: device.name,
          success: true,
          ...syncResult
        });
      } catch (error) {
        results.push({
          device_id: device.id,
          device_name: device.name,
          success: false,
          error: error.message
        });
      }
    }

    const totalAdded = results.reduce((sum, r) => 
      sum + (r.summary?.successfully_added || 0), 0
    );

    return {
      success: true,
      message: `تمت مزامنة ${totalAdded} موظف جديد من ${devices.length} جهاز`,
      total_devices: devices.length,
      total_new_employees: totalAdded,
      device_results: results
    };

  } catch (error) {
    console.error('[DeviceSync] Sync all failed:', error);
    throw error;
  }
}

/**
 * Get sync status for a device
 * معلومات حالة المزامنة
 */
export async function getSyncStatus(deviceId) {
  try {
    const device = await Device.findByPk(deviceId);
    if (!device) {
      throw new AppError('الجهاز غير موجود', 404);
    }

    // عدد الموظفين في النظام من هذا الجهاز
    const employeesInSystem = await Employee.count({
      where: {
        organization_id: device.organization_id
      }
    });

    // عدد الموظفين على الجهاز
    const fetchResult = await fetchEmployeesFromDevice(device);
    const employeesOnDevice = fetchResult.success ? fetchResult.employees.length : 0;

    return {
      device: {
        id: device.id,
        name: device.name,
        ip_address: device.ip_address
      },
      employees_in_system: employeesInSystem,
      employees_on_device: employeesOnDevice,
      last_sync: device.last_sync_at || null,
      can_sync: fetchResult.success
    };

  } catch (error) {
    console.error('[DeviceSync] Get status failed:', error);
    throw error;
  }
}
