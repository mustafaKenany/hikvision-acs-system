/**
 * Print API Helper
 * دوال مساعدة لطباعة البيانات وتسجيلها في النظام
 */

import axios from './axios';

/**
 * طباعة بطاقة موظف واحد
 * @param {number} employeeId - معرف الموظف
 * @param {string} printType - نوع الطباعة (بطاقة موظف، تقرير موظف، بيانات موظف)
 */
export async function printEmployee(employeeId, printType = 'بطاقة موظف') {
  try {
    // تسجيل عملية الطباعة في Backend
    await axios.post(`/api/print/employee/${employeeId}`, {
      print_type: printType
    });

    // هنا يمكن إضافة كود الطباعة الفعلي
    // مثلاً: فتح نافذة طباعة أو تحميل PDF
    console.log(`✅ تم تسجيل طباعة ${printType} للموظف #${employeeId}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الطباعة:', error);
    throw error;
  }
}

/**
 * طباعة قائمة موظفين
 * @param {number[]} employeeIds - مصفوفة معرفات الموظفين
 * @param {string} printType - نوع الطباعة
 */
export async function printEmployeesBatch(employeeIds, printType = 'قائمة الموظفين') {
  try {
    // تسجيل عملية الطباعة في Backend
    await axios.post('/print/employees/batch', {
      employee_ids: employeeIds,
      print_type: printType
    });

    console.log(`✅ تم تسجيل طباعة ${employeeIds.length} موظف`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الطباعة:', error);
    throw error;
  }
}

/**
 * طباعة بيانات منظمة
 * @param {number} organizationId - معرف المنظمة
 * @param {string} printType - نوع الطباعة
 */
export async function printOrganization(organizationId, printType = 'بيانات المنظمة') {
  try {
    // تسجيل عملية الطباعة في Backend
    await axios.post(`/api/print/organization/${organizationId}`, {
      print_type: printType
    });

    console.log(`✅ تم تسجيل طباعة ${printType} للمنظمة #${organizationId}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الطباعة:', error);
    throw error;
  }
}

/**
 * طباعة بيانات جهاز
 * @param {number} deviceId - معرف الجهاز
 * @param {string} printType - نوع الطباعة
 */
export async function printDevice(deviceId, printType = 'بيانات الجهاز') {
  try {
    // تسجيل عملية الطباعة في Backend
    await axios.post(`/api/print/device/${deviceId}`, {
      print_type: printType
    });

    console.log(`✅ تم تسجيل طباعة ${printType} للجهاز #${deviceId}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الطباعة:', error);
    throw error;
  }
}

/**
 * طباعة تقرير
 * @param {string} reportType - نوع التقرير (تقرير الحضور، تقرير الأداء، إلخ)
 * @param {object} reportData - بيانات التقرير (فترة، فلاتر، إلخ)
 */
export async function printReport(reportType, reportData = {}) {
  try {
    // تسجيل عملية الطباعة في Backend
    await axios.post('/print/report', {
      report_type: reportType,
      report_data: reportData
    });

    console.log(`✅ تم تسجيل طباعة ${reportType}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الطباعة:', error);
    throw error;
  }
}

/**
 * مساعد عام للطباعة مع window.print()
 * يستخدم لطباعة محتوى معين مع تسجيل العملية
 */
export async function printWithLogging(printFunction, loggingFunction) {
  try {
    // سجل العملية في Backend أولاً
    await loggingFunction();
    
    // ثم قم بالطباعة
    await printFunction();
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في عملية الطباعة:', error);
    throw error;
  }
}

// أمثلة على الاستخدام:

/*
// مثال 1: طباعة بطاقة موظف
import { printEmployee } from '@/api/print';

async function handlePrintEmployeeCard(employeeId) {
  try {
    await printEmployee(employeeId, 'بطاقة موظف');
    // افتح نافذة الطباعة أو حمل PDF
    window.print();
  } catch (error) {
    alert('فشل في طباعة البطاقة');
  }
}

// مثال 2: طباعة قائمة موظفين محددين
import { printEmployeesBatch } from '@/api/print';

async function handlePrintSelectedEmployees(selectedIds) {
  try {
    await printEmployeesBatch(selectedIds, 'قائمة الموظفين المحددين');
    window.print();
  } catch (error) {
    alert('فشل في طباعة القائمة');
  }
}

// مثال 3: طباعة تقرير الحضور
import { printReport } from '@/api/print';

async function handlePrintAttendanceReport(startDate, endDate) {
  try {
    await printReport('تقرير الحضور', {
      start_date: startDate,
      end_date: endDate,
      department: 'IT'
    });
    window.print();
  } catch (error) {
    alert('فشل في طباعة التقرير');
  }
}

// مثال 4: استخدام printWithLogging
import { printWithLogging, printDevice } from '@/api/print';

async function handlePrintDeviceInfo(deviceId) {
  await printWithLogging(
    // دالة الطباعة الفعلية
    () => window.print(),
    // دالة التسجيل
    () => printDevice(deviceId, 'معلومات الجهاز')
  );
}
*/
