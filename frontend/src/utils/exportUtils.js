/**
 * Export Utilities
 * مكتبة لتصدير البيانات إلى Excel و PDF
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * تصدير بيانات الموظفين إلى Excel
 */
export function exportToExcel(employees, filename = 'employees') {
  try {
    // تحضير البيانات
    const data = employees.map(emp => ({
      'رقم الموظف': emp.employee_no,
      'الاسم': emp.name,
      'المنظمة': emp.organization_name || '',
      'القسم': emp.department || '',
      'المنصب': emp.position || '',
      'البريد الإلكتروني': emp.email || '',
      'الهاتف': emp.phone || '',
      'تاريخ التوظيف': emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('ar-EG') : '',
      'الحالة': emp.is_active ? 'نشط' : 'غير نشط'
    }));

    // إنشاء Workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الموظفين');

    // تحسين عرض الأعمدة
    const maxWidth = 20;
    const wscols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;

    // حفظ الملف
    const fileNameWithDate = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileNameWithDate);

    return { success: true, message: 'تم التصدير بنجاح' };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, message: 'فشل التصدير', error };
  }
}

/**
 * تصدير بيانات الموظفين إلى PDF
 */
export function exportToPDF(employees, stats = {}) {
  try {
    // Create PDF with RTL support
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // عنوان التقرير
    doc.setFontSize(18);
    doc.text('قائمة الموظفين', doc.internal.pageSize.getWidth() - 20, 20, { align: 'right' });

    // إحصائيات
    doc.setFontSize(10);
    const statsText = `إجمالي: ${stats.total || 0} | نشط: ${stats.active || 0} | غير نشط: ${stats.inactive || 0} | التاريخ: ${new Date().toLocaleDateString('ar-EG')}`;
    doc.text(statsText, doc.internal.pageSize.getWidth() - 20, 30, { align: 'right' });

    // تحضير بيانات الجدول
    const headers = [['الحالة', 'الهاتف', 'المنصب', 'القسم', 'المنظمة', 'الاسم', 'رقم الموظف']];
    const data = employees.map(emp => [
      emp.is_active ? 'نشط' : 'غير نشط',
      emp.phone || '',
      emp.position || '',
      emp.department || '',
      emp.organization_name || '',
      emp.name,
      emp.employee_no
    ]);

    // إنشاء الجدول
    doc.autoTable({
      head: headers,
      body: data,
      startY: 40,
      styles: {
        font: 'helvetica',
        fontStyle: 'normal',
        halign: 'right',
        fontSize: 9
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40, right: 10, left: 10 }
    });

    // حفظ الملف
    const fileName = `employees_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, message: 'تم التصدير بنجاح' };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, message: 'فشل التصدير', error };
  }
}


/**
 * طباعة كرت موظف
 */
export function printEmployeeCard(employee, qrCodeDataUrl = null) {
  const printWindow = window.open('', '', 'width=600,height=800');
  
  const qrSection = qrCodeDataUrl ? `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
      <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 120px; height: 120px; margin: 10px auto; display: block;" />
      <p style="font-size: 10px; color: #666; margin-top: 5px;">امسح الكود للوصول السريع</p>
    </div>
  ` : '';

  const photoUrl = employee.photo_url 
    ? (employee.photo_url.startsWith('http') ? employee.photo_url : `http://localhost:3000${employee.photo_url}`)
    : '';

  const photoHtml = photoUrl 
    ? `<img src="${photoUrl}" alt="صورة الموظف" style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid #1976d2; object-fit: cover;" />`
    : `<div style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid #1976d2; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #999;">👤</div>`;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>بطاقة موظف - ${employee.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        
        body { 
          font-family: 'Cairo', Arial, sans-serif; 
          direction: rtl; 
          text-align: center; 
          padding: 20px;
          margin: 0;
        }
        .employee-card { 
          border: 3px solid #1976d2; 
          border-radius: 15px; 
          padding: 30px; 
          max-width: 400px; 
          margin: 20px auto;
          background: linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card-header {
          background: #1976d2;
          color: white;
          padding: 15px;
          border-radius: 10px;
          margin: -30px -30px 20px -30px;
        }
        .card-header h2 { 
          margin: 0;
          font-size: 22px;
        }
        .card-header p {
          margin: 5px 0 0 0;
          font-size: 12px;
          opacity: 0.9;
        }
        .photo-container {
          margin: 20px 0;
        }
        .card-info { 
          margin-top: 20px;
          text-align: right;
          background: white;
          padding: 15px;
          border-radius: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #ddd;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #1976d2;
        }
        .info-value {
          color: #333;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          margin-top: 15px;
          font-size: 14px;
        }
        .status-active {
          background: #4caf50;
          color: white;
        }
        .status-inactive {
          background: #f44336;
          color: white;
        }
        @media print {
          body { padding: 0; }
          .employee-card { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="employee-card">
        <div class="card-header">
          <h2>بطاقة موظف</h2>
          <p>${employee.organization_name || 'نظام إدارة الحضور'}</p>
        </div>
        
        <div class="photo-container">
          ${photoHtml}
        </div>

        <h3 style="color: #1976d2; margin: 15px 0;">${employee.name}</h3>

        <div class="card-info">
          <div class="info-row">
            <span class="info-label">رقم الموظف:</span>
            <span class="info-value">${employee.employee_no}</span>
          </div>
          <div class="info-row">
            <span class="info-label">القسم:</span>
            <span class="info-value">${employee.department || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">المنصب:</span>
            <span class="info-value">${employee.position || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الهاتف:</span>
            <span class="info-value">${employee.phone || 'غير محدد'}</span>
          </div>
          ${employee.email ? `
          <div class="info-row">
            <span class="info-label">البريد:</span>
            <span class="info-value" style="font-size: 12px;">${employee.email}</span>
          </div>
          ` : ''}
        </div>

        <div class="status-badge ${employee.is_active ? 'status-active' : 'status-inactive'}">
          ${employee.is_active ? '✓ نشط' : '✗ غير نشط'}
        </div>

        ${qrSection}

        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #1976d2; font-size: 11px; color: #666;">
          <p style="margin: 5px 0;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);

  return { success: true };
}

/**
 * ========================================
 * Organizations Export Functions
 * تصدير بيانات المنظمات
 * ========================================
 */

/**
 * تصدير بيانات المنظمات إلى Excel
 */
export function exportOrganizationsToExcel(organizations, filename = 'organizations') {
  try {
    // تحضير البيانات
    const data = organizations.map(org => ({
      'الاسم': org.name,
      'البريد الإلكتروني': org.email,
      'الهاتف': org.phone || '',
      'العنوان': org.address || '',
      'خطة الاشتراك': getSubscriptionText(org.subscription_plan),
      'بداية الاشتراك': org.subscription_start ? new Date(org.subscription_start).toLocaleDateString('ar-EG') : '',
      'نهاية الاشتراك': org.subscription_end ? new Date(org.subscription_end).toLocaleDateString('ar-EG') : '',
      'عدد الموظفين': org.stats?.employees_count || 0,
      'عدد الأجهزة': org.stats?.devices_count || 0,
      'عدد المستخدمين': org.stats?.users_count || 0,
      'الحالة': org.is_active ? 'نشطة' : 'غير نشطة',
      'تاريخ الإنشاء': org.created_at ? new Date(org.created_at).toLocaleDateString('ar-EG') : ''
    }));

    // إنشاء Workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المنظمات');

    // تحسين عرض الأعمدة
    const maxWidth = 25;
    const wscols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;

    // حفظ الملف
    const fileNameWithDate = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileNameWithDate);

    return { success: true, message: 'تم التصدير بنجاح' };
  } catch (error) {
    console.error('Error exporting organizations to Excel:', error);
    return { success: false, message: 'فشل التصدير', error };
  }
}

/**
 * تصدير بيانات المنظمات إلى PDF
 */
export function exportOrganizationsToPDF(organizations, stats = {}) {
  try {
    // Create PDF with RTL support
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // عنوان التقرير
    doc.setFontSize(18);
    doc.text('قائمة المنظمات', doc.internal.pageSize.getWidth() - 20, 20, { align: 'right' });

    // إحصائيات
    doc.setFontSize(10);
    const statsText = `إجمالي: ${stats.total || 0} | نشطة: ${stats.active || 0} | غير نشطة: ${stats.inactive || 0} | التاريخ: ${new Date().toLocaleDateString('ar-EG')}`;
    doc.text(statsText, doc.internal.pageSize.getWidth() - 20, 30, { align: 'right' });

    // تحضير بيانات الجدول
    const headers = [['الحالة', 'عدد الأجهزة', 'عدد الموظفين', 'خطة الاشتراك', 'الهاتف', 'البريد', 'الاسم']];
    const data = organizations.map(org => [
      org.is_active ? 'نشطة' : 'غير نشطة',
      org.stats?.devices_count || 0,
      org.stats?.employees_count || 0,
      getSubscriptionText(org.subscription_plan),
      org.phone || '',
      org.email,
      org.name
    ]);

    // إنشاء الجدول
    doc.autoTable({
      head: headers,
      body: data,
      startY: 40,
      styles: {
        font: 'helvetica',
        fontStyle: 'normal',
        halign: 'right',
        fontSize: 9
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40, right: 10, left: 10 }
    });

    // حفظ الملف
    const fileName = `organizations_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, message: 'تم التصدير بنجاح' };
  } catch (error) {
    console.error('Error exporting organizations to PDF:', error);
    return { success: false, message: 'فشل التصدير', error };
  }
}

/**
 * مساعد - الحصول على نص خطة الاشتراك
 */
function getSubscriptionText(plan) {
  const texts = {
    free: 'مجاني',
    basic: 'أساسي',
    pro: 'احترافي',
    enterprise: 'مؤسسي'
  };
  return texts[plan] || plan;
}
