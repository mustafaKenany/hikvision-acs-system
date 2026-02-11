# نظام تسجيل عمليات الطباعة
## Print Logging System

## 📋 نظرة عامة

تم إضافة نظام متكامل لتسجيل جميع عمليات الطباعة في النظام. هذا يساعد في:
- تتبع من قام بطباعة البيانات
- معرفة وقت الطباعة
- تحديد نوع البيانات المطبوعة
- مراجعة سجل الطباعة للمراقبة والتدقيق

---

## 🔌 APIs المتاحة

### 1️⃣ طباعة موظف واحد
**Endpoint:** `POST /api/print/employee/:id`

**Request Body:**
```json
{
  "print_type": "بطاقة موظف"
}
```

**أنواع الطباعة المدعومة:**
- `بطاقة موظف`
- `تقرير موظف`
- `بيانات موظف`
- `عقد موظف`

**مثال:**
```javascript
await axios.post('/api/print/employee/15', {
  print_type: 'بطاقة موظف'
});
```

---

### 2️⃣ طباعة عدة موظفين
**Endpoint:** `POST /api/print/employees/batch`

**Request Body:**
```json
{
  "employee_ids": [1, 2, 3, 5, 8],
  "print_type": "قائمة الموظفين"
}
```

**أنواع الطباعة المدعومة:**
- `قائمة الموظفين`
- `بطاقات متعددة`
- `تقرير جماعي`

**مثال:**
```javascript
await axios.post('/api/print/employees/batch', {
  employee_ids: [12, 15, 18, 22],
  print_type: 'بطاقات متعددة'
});
```

---

### 3️⃣ طباعة منظمة
**Endpoint:** `POST /api/print/organization/:id`

**Request Body:**
```json
{
  "print_type": "بيانات المنظمة"
}
```

**أنواع الطباعة المدعومة:**
- `بيانات المنظمة`
- `تقرير المنظمة`
- `عقد الاشتراك`
- `إحصائيات المنظمة`

**ملاحظة:** يتطلب صلاحيات `super_admin`

**مثال:**
```javascript
await axios.post('/api/print/organization/3', {
  print_type: 'تقرير المنظمة'
});
```

---

### 4️⃣ طباعة جهاز
**Endpoint:** `POST /api/print/device/:id`

**Request Body:**
```json
{
  "print_type": "بيانات الجهاز"
}
```

**أنواع الطباعة المدعومة:**
- `بيانات الجهاز`
- `تقرير الجهاز`
- `سجل الأحداث`
- `إعدادات الجهاز`

**مثال:**
```javascript
await axios.post('/api/print/device/7', {
  print_type: 'بيانات الجهاز'
});
```

---

### 5️⃣ طباعة تقرير
**Endpoint:** `POST /api/print/report`

**Request Body:**
```json
{
  "report_type": "تقرير الحضور",
  "report_data": {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "department": "IT",
    "include_summary": true
  }
}
```

**أنواع التقارير المدعومة:**
- `تقرير الحضور`
- `تقرير الأداء`
- `تقرير الإحصائيات`
- `تقرير مالي`
- `تقرير شامل`

**مثال:**
```javascript
await axios.post('/api/print/report', {
  report_type: 'تقرير الحضور',
  report_data: {
    start_date: '2026-02-01',
    end_date: '2026-02-11',
    employee_ids: [1, 2, 3]
  }
});
```

---

## 💻 استخدام من Frontend

### طريقة 1: استخدام الدوال المساعدة

```javascript
import { printEmployee, printReport } from '@/api/print';

// طباعة بطاقة موظف
async function handlePrint(employeeId) {
  try {
    // سجل العملية في Backend
    await printEmployee(employeeId, 'بطاقة موظف');
    
    // قم بالطباعة الفعلية
    window.print();
    
    // أو حمل PDF
    // downloadPDF();
  } catch (error) {
    console.error('خطأ في الطباعة:', error);
  }
}
```

### طريقة 2: في Vue Component

```vue
<template>
  <v-btn @click="handlePrintEmployee" color="primary">
    <v-icon start>mdi-printer</v-icon>
    طباعة بطاقة
  </v-btn>
</template>

<script setup>
import axios from '@/api/axios';

const handlePrintEmployee = async () => {
  try {
    // سجل الطباعة
    await axios.post(`/api/print/employee/${employeeId}`, {
      print_type: 'بطاقة موظف'
    });
    
    // افتح نافذة الطباعة
    window.print();
    
    // عرض رسالة نجاح
    showSnackbar('تم تسجيل الطباعة بنجاح', 'success');
  } catch (error) {
    showSnackbar('فشل في تسجيل الطباعة', 'error');
  }
};
</script>
```

---

## 📊 عرض سجل الطباعة

يمكنك عرض جميع عمليات الطباعة من خلال Audit Logs:

```javascript
// جلب جميع عمليات الطباعة
const response = await axios.get('/api/audit-logs', {
  params: {
    action: 'print',
    page: 1,
    limit: 50
  }
});

// جلب عمليات طباعة لموظف معين
const employeePrints = await axios.get('/api/audit-logs/resource/employee/15', {
  params: {
    action: 'print'
  }
});
```

---

## 🗃️ البيانات المُسجلة

كل عملية طباعة تُسجل في `audit_logs` مع:

```json
{
  "id": 123,
  "user_id": 1,
  "action": "print",
  "resource_type": "employee",
  "resource_id": 15,
  "description": "طباعة بطاقة موظف للموظف: أحمد محمد (EMP001)",
  "old_values": null,
  "new_values": {
    "print_type": "بطاقة موظف",
    "employee_name": "أحمد محمد",
    "employee_no": "EMP001",
    "department": "تكنولوجيا المعلومات"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-02-11T14:30:00.000Z"
}
```

---

## 🔐 الصلاحيات

| العملية | الصلاحيات المطلوبة |
|---------|---------------------|
| طباعة موظف | نفس المنظمة |
| طباعة عدة موظفين | نفس المنظمة |
| طباعة منظمة | `super_admin` فقط |
| طباعة جهاز | نفس المنظمة |
| طباعة تقرير | حسب نوع التقرير |

---

## 📝 ملاحظات مهمة

1. **يجب استدعاء الـ API قبل الطباعة** - لتسجيل العملية أولاً
2. **البيانات تُحفظ بشكل دائم** - لا يمكن حذفها من Audit Logs
3. **تتبع IP Address** - يتم حفظ عنوان IP لكل عملية طباعة
4. **التقارير المخصصة** - يمكن إضافة أي بيانات إضافية في `report_data`

---

## 🎯 استخدامات متقدمة

### مثال: طباعة مع PDF

```javascript
import { printEmployee } from '@/api/print';
import jsPDF from 'jspdf';

async function printEmployeeCard(employee) {
  // سجل العملية
  await printEmployee(employee.id, 'بطاقة موظف');
  
  // أنشئ PDF
  const doc = new jsPDF();
  doc.text(`الاسم: ${employee.name}`, 10, 10);
  doc.text(`الرقم: ${employee.employee_no}`, 10, 20);
  
  // حمل أو اطبع
  doc.save(`employee-card-${employee.id}.pdf`);
  // أو
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}
```

### مثال: طباعة مع إحصائيات

```javascript
import { printReport } from '@/api/print';

async function printMonthlyReport() {
  const reportData = {
    month: '02/2026',
    total_employees: 150,
    present_count: 142,
    absent_count: 8,
    late_count: 12
  };
  
  await printReport('تقرير الحضور الشهري', reportData);
  
  // اطبع التقرير
  window.print();
}
```

---

## 🚀 التكامل الكامل

للتكامل الكامل في نظامك:

1. ✅ استورد `print.js` في المكونات المطلوبة
2. ✅ استدعِ الدالة المناسبة قبل الطباعة
3. ✅ اعرض رسالة للمستخدم عند النجاح/الفشل
4. ✅ تابع السجلات من صفحة Audit Logs

---

## 📞 الدعم

لأي استفسارات أو مشاكل، راجع:
- [Audit Logs Documentation](./AUDIT-LOGS.md)
- [API Documentation](./API.md)
