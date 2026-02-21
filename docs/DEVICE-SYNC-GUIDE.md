# 🔄 دليل المزامنة - Device Sync Guide

## 📋 نظرة عامة

تم تعديل النظام بالكامل ليعمل بطريقة **المزامنة** بدلاً من رفع الصور من الحاسوب.

---

## 🎯 الطريقة الجديدة

### المفهوم

```
1. المستخدم → يسجل الموظف على الجهاز مباشرة (من واجهة الجهاز)
2. الجهاز → يحفظ بيانات الموظف وصورته
3. النظام → يجلب الموظفين الجدد من الجهاز (مزامنة)
```

### المميزات

✅ **لا حاجة لرفع الصور** - كل شي على الجهاز مباشرة  
✅ **مزامنة ذكية** - يجلب الموظفين الجدد فقط  
✅ **متعدد الأجهزة** - مزامنة من جهاز واحد أو كل الأجهزة  
✅ **تقرير مفصل** - يعرض الموظفين المضافين والفاشلين

---

## 🚀 طريقة الاستخدام

### الخطوة 1: تسجيل الموظف على the_laptop\Downloads\WebSDK V3.3.1\hikvision-acs-system\backend>  مباشرة

#### من واجهة الجهاز (Web UI):

1. افتح متصفح وادخل: `http://192.168.1.84` (استخدم IP جهازك)
2. تسجيل الدخول: `admin` / كلمة المرور
3. اذهب إلى: **Access Control** → **User Management**
4. اضغط **Add User**
5. أدخل:
   - **Employee No**: رقم الموظف (مثلاً: `1001`)
   - **Name**: اسم الموظف
   - **Department**: القسم (اختياري)
6. ارفع صورة الوجه: **Upload Face Photo**
7. احفظ

#### أو من Device Interface (الشاشة):

- إذا الجهاز عنده شاشة تاتش، يمكن التسجيل مباشرة منها
- اتبع تعليمات الشاشة

---

### الخطوة 2: مزامنة من النظام

1. **افتح النظام**: http://localhost:5174
2. **تسجيل الدخول** (إذا لم تكن مسجلاً)
3. اذهب إلى: **Employees** (إدارة الموظفين)
4. اضغط زر: **مزامنة من الأجهزة** (أزرق - أعلى الصفحة)

#### نافذة المزامنة

- **اختر الجهاز**: 
  - `test (192.168.1.84)` أو أي جهاز آخر
  
- **أو اضغط**: **مزامنة من كل الأجهزة**

5. اضغط: **مزامنة الآن**

#### النتيجة:

```
✅ تمت المزامنة بنجاح!

📊 ملخص المزامنة:
   • إجمالي على الجهاز: 10
   • موجود في النظام: 5
   • موظفين جدد: 5
   • تمت الإضافة: 5 ✅
   
✅ الموظفين المضافين:
   • محمد علي (1001) - وجه ✓
   • أحمد حسن (1002) - وجه ✓
   ...
```

---

## 📡 API Endpoints

### مزامنة من جهاز واحد

```http
POST /api/devices/:deviceId/sync
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "تمت المزامنة بنجاح",
  "data": {
    "summary": {
      "total_on_device": 10,
      "existing_in_system": 5,
      "new_employees_found": 5,
      "successfully_added": 5,
      "failed": 0
    },
    "added_employees": [...]
  }
}
```

---

### مزامنة من كل الأجهزة

```http
POST /api/devices/sync-all
Authorization: Bearer <token>
```

---

### الحصول على حالة المزامنة

```http
GET /api/devices/:deviceId/sync-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "device": {
    "id": 4,
    "name": "test",
    "ip_address": "192.168.1.84"
  },
  "employees_in_system": 15,
  "employees_on_device": 20,
  "can_sync": true
}
```

---

## 🔧 كيف يعمل النظام (تقنياً)

### 1. Fetch Employees from Device (ISAPI)

```javascript
POST http://192.168.1.84/ISAPI/AccessControl/UserInfo/Search?format=json

Body:
{
  "UserInfoSearchCond": {
    "searchID": "1",
    "maxResults": 1000
  }
}
```

### 2. Compare with System

```javascript
// الموجودين في النظام
existingEmployees = SELECT employee_no FROM employees;

// الموظفين الجدد
newEmployees = deviceEmployees.filter(
  emp => !existingEmployees.includes(emp.employeeNo)
);
```

### 3. Add New Employees

```javascript
for (emp of newEmployees) {
  await Employee.create({
    employee_no: emp.employeeNo,
    name: emp.name,
    department: emp.department,
    metadata: {
      synced_from_device: true,
      device_id: deviceId,
      has_face: emp.numOfFace > 0
    }
  });
  
  if (emp.numOfFace > 0) {
    await FaceTemplate.create({
      employee_id: employee.id,
      device_id: deviceId,
      face_id: emp.employeeNo
    });
  }
}
```

---

## 📁 الملفات المعدلة

### Backend

| ملف | الوصف |
|-----|-------|
| `src/services/deviceSyncService.js` | خدمة المزامنة الأساسية |
| `src/routes/deviceSync.js` | API endpoints للمزامنة |
| `src/app.js` | إضافة deviceSync routes |

### Frontend

| ملف | الوصف |
|-----|-------|
| `src/components/dialogs/DeviceSyncDialog.vue` | نافذة المزامنة |
| `src/views/Employees.vue` | زر المزامنة في الموظفين |

---

## ❓ أسئلة شائعة

### 1. هل سيتم حذف الموظفين الموجودين؟

**لا.** النظام يضيف الموظفين الجدد فقط. الموجودين لن يتأثروا.

### 2. ماذا لو كان الموظف موجود بنفس الرقم؟

سيتم تخطيه ولن يتم إضافته مرة ثانية.

### 3. هل يمكن المزامنة من أكثر من جهاز؟

نعم! استخدم **"مزامنة من كل الأجهزة"**.

### 4. ماذا لو فشلت المزامنة؟

- التقرير سيعرض الموظفين الذين فشلوا
- يمكن المحاولة مرة أخرى

### 5. هل يجلب الصور أيضاً؟

حالياً، يجلب **معلومات** الوجه فقط (إذا الموظف عنده وجه مسجل).  
الصور نفسها تبقى على الجهاز.

---

## 🎯 الخلاصة

### قبل التعديل ❌
```
المستخدم → يرفع صورة من الحاسوب
        ↓
    النظام → يرسل للجهاز
        ↓
    الجهاز → يحفظ الصورة
```

### بعد التعديل ✅
```
المستخدم → يسجل على الجهاز مباشرة
        ↓
    الجهاز → يحفظ كل شي
        ↓
    النظام ← يجلب الموظفين الجدد فقط (مزامنة)
```

---

## 🚀 البدء السريع

```bash
# 1. شغل Backend
cd backend
npm start

# 2. شغل Frontend
cd ../frontend
npm run dev

# 3. افتح النظام
http://localhost:5174

# 4. روح Employees → مزامنة من الأجهزة ✅
```

---

**📝 ملاحظة:** هذا النظام الآن يعمل بطريقة **Pull** (سحب) بدلاً من **Push** (دفع).  
الجهاز هو مصدر البيانات الأساسي. 🎯
