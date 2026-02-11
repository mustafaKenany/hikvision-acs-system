/**
 * usePrint Composable
 * Composable للتعامل مع عمليات الطباعة وتسجيلها
 */

import { ref } from 'vue';
import axios from '@/api/axios';

export function usePrint() {
  const printing = ref(false);
  const error = ref(null);

  /**
   * طباعة بطاقة موظف
   */
  const printEmployee = async (employeeId, printType = 'بطاقة موظف') => {
    printing.value = true;
    error.value = null;

    try {
      // سجل العملية في Backend
      await axios.post(`/api/print/employee/${employeeId}`, {
        print_type: printType
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل الطباعة';
      throw err;
    } finally {
      printing.value = false;
    }
  };

  /**
   * طباعة عدة موظفين
   */
  const printEmployeesBatch = async (employeeIds, printType = 'قائمة الموظفين') => {
    printing.value = true;
    error.value = null;

    try {
      await axios.post('/print/employees/batch', {
        employee_ids: employeeIds,
        print_type: printType
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل الطباعة';
      throw err;
    } finally {
      printing.value = false;
    }
  };

  /**
   * طباعة منظمة
   */
  const printOrganization = async (organizationId, printType = 'بيانات المنظمة') => {
    printing.value = true;
    error.value = null;

    try {
      await axios.post(`/api/print/organization/${organizationId}`, {
        print_type: printType
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل الطباعة';
      throw err;
    } finally {
      printing.value = false;
    }
  };

  /**
   * طباعة جهاز
   */
  const printDevice = async (deviceId, printType = 'بيانات الجهاز') => {
    printing.value = true;
    error.value = null;

    try {
      await axios.post(`/api/print/device/${deviceId}`, {
        print_type: printType
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل الطباعة';
      throw err;
    } finally {
      printing.value = false;
    }
  };

  /**
   * طباعة تقرير
   */
  const printReport = async (reportType, reportData = {}) => {
    printing.value = true;
    error.value = null;

    try {
      await axios.post('/print/report', {
        report_type: reportType,
        report_data: reportData
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل الطباعة';
      throw err;
    } finally {
      printing.value = false;
    }
  };

  /**
   * دالة مساعدة للطباعة مع window.print()
   */
  const printWithWindow = async (loggingFunction, elementId = null) => {
    try {
      // سجل العملية أولاً
      await loggingFunction();

      // إذا كان هناك element محدد للطباعة
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
            <html>
              <head>
                <title>طباعة</title>
                <style>
                  @media print {
                    body { margin: 0; padding: 20px; }
                  }
                </style>
              </head>
              <body>
                ${element.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        // طباعة الصفحة كاملة
        window.print();
      }

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في الطباعة';
      throw err;
    }
  };

  /**
   * مسح الخطأ
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    printing,
    error,
    printEmployee,
    printEmployeesBatch,
    printOrganization,
    printDevice,
    printReport,
    printWithWindow,
    clearError
  };
}

// مثال على الاستخدام في Component:
/*
<script setup>
import { usePrint } from '@/composables/usePrint';
import { ref } from 'vue';

const { printing, error, printEmployee, printWithWindow, clearError } = usePrint();
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const showSnackbar = (text, color) => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// مثال 1: طباعة بطاقة موظف بسيطة
const handlePrintCard = async (employeeId) => {
  try {
    await printEmployee(employeeId, 'بطاقة موظف');
    window.print();
    showSnackbar('تم تسجيل الطباعة بنجاح', 'success');
  } catch (err) {
    showSnackbar(error.value || 'فشل في الطباعة', 'error');
  }
};

// مثال 2: طباعة element محدد
const handlePrintDetails = async (employeeId) => {
  try {
    await printWithWindow(
      () => printEmployee(employeeId, 'تفاصيل موظف'),
      'employee-details' // ID of element to print
    );
    showSnackbar('تم الطباعة بنجاح', 'success');
  } catch (err) {
    showSnackbar(error.value || 'فشل في الطباعة', 'error');
  }
};
</script>

<template>
  <div>
    <!-- محتوى قابل للطباعة -->
    <div id="employee-details">
      <h2>بيانات الموظف</h2>
      <!-- ... -->
    </div>

    <!-- زر الطباعة -->
    <v-btn 
      @click="handlePrintCard(employee.id)"
      :loading="printing"
      color="primary"
    >
      <v-icon start>mdi-printer</v-icon>
      طباعة البطاقة
    </v-btn>

    <!-- Snackbar للرسائل -->
    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
*/
