# API Development Templates
# قوالب جاهزة لتسريع تطوير الـ APIs

هذا المجلد يحتوي على قوالب جاهزة لإنشاء APIs جديدة بسرعة.

## الملفات المتاحة

### 1. `serviceTemplate.js`
**الغرض**: قالب لطبقة Business Logic  
**يحتوي على**:
- ✅ `getAllENTITYs()` - جلب قائمة مع Filtering & Pagination
- ✅ `getENTITYById()` - جلب عنصر واحد
- ✅ `createENTITY()` - إنشاء جديد
- ✅ `updateENTITY()` - تحديث
- ✅ `deleteENTITY()` - حذف (Soft Delete)
- ✅ `activateENTITY()` - تفعيل
- ✅ `deactivateENTITY()` - تعطيل
- ✅ `getENTITYStats()` - إحصائيات

**Features**:
- 🔒 Organization Isolation
- 👤 User Permissions Check
- 🔍 Search & Filtering
- 📄 Pagination
- 🗑️ Soft Delete Support

---

### 2. `controllerTemplate.js`
**الغرض**: قالب لطبقة HTTP Request Handlers  
**يحتوي على**: 8 endpoint handlers تتوافق مع الـ service methods

**Features**:
- ✅ Parameter Extraction
- ✅ Service Call
- ✅ Response Formatting (correct parameter order!)
- ✅ Error Handling via asyncHandler

---

### 3. `validatorTemplate.js`
**الغرض**: قالب لطبقة Request Validation  
**يحتوي على**:
- ✅ `createENTITYValidator` - التحقق من البيانات عند الإنشاء
- ✅ `updateENTITYValidator` - التحقق عند التحديث
-  ✅ `entityIdValidator` - التحقق من صحة ID
- ✅ `listENTITYsValidator` - التحقق من query parameters

**Features**:
- 📝 Field Validation Rules
- 🌐 Arabic Error Messages
- 🔧 Customizable Rules

---

### 4. `routesTemplate.js`
**الغرض**: قالب لطبقة Route Definitions  
**يحتوي على**: 8 routes مع middleware chains

**Features**:
- 🔐 Authentication (authenticate middleware)
- 🚦 Authorization (authorize middleware with roles)
- ⏱️ Rate Limiting
- ✅ Validation Middleware
- 📚 JSDoc Comments

---

## كيفية الاستخدام

### خطوات إنشاء API جديد (مثال: Devices API)

#### 1️⃣ **نسخ الـ Templates**
```bash
cp templates/serviceTemplate.js src/services/deviceService.js
cp templates/controllerTemplate.js src/controllers/deviceController.js
cp templates/validatorTemplate.js src/validators/deviceValidator.js
cp templates/routesTemplate.js src/routes/deviceRoutes.js
```

#### 2️⃣ **Find & Replace في كل ملف**:
- `ENTITY` → `Device`
- `entity` → `device`
- `entitys` → `devices`
- `ENTITY_MODEL` → `Device` (من models)

#### 3️⃣ **تعديل Model Imports** في `deviceService.js`:
```javascript
import { Organization, User, Device } from '../models/index.js';
```

#### 4️⃣ **تعديل Import Paths** في `deviceController.js`:
```javascript
import deviceService from '../services/deviceService.js';
```

#### 5️⃣ **تعديل Validators** في `deviceValidator.js`:
أضف/عدّل حقول الـ validation حسب model الخاص بك:
```javascript
body('ip_address')
  .trim()
  .notEmpty()
  .withMessage('عنوان IP مطلوب')
  .isIP()
  .withMessage('عنوان IP غير صالح'),

body('port')
  .isInt({ min: 1, max: 65535 })
  .withMessage('رقم المنفذ يجب أن يكون بين 1 و 65535'),
```

#### 6️⃣ **إضافة Routes للـ App** في `server.js`:
```javascript
import deviceRoutes from './routes/deviceRoutes.js';
app.use('/api/devices', deviceRoutes);
```

#### 7️⃣ **اختبار الـ API** باستخدام PowerShell أو `api-tests.http`

---

## الوقت المتوقع

- ✅ **بدون Templates**: ~4-6 ساعات لإنشاء API كامل
- ✅ **مع Templates**: ~30-60 دقيقة (حسب التعقيد)

---

## مثال: Devices API Structure

```
src/
├── models/
│   └── Device.js                 # Sequelize model
├── services/
│   └── deviceService.js          # من serviceTemplate.js
├── controllers/
│   └── deviceController.js       # من controllerTemplate.js
├── validators/
│   └── deviceValidator.js        # من validatorTemplate.js
├── routes/
│   └── deviceRoutes.js           # من routesTemplate.js
```

---

## Features المشتركة في كل Template

| Feature | Service | Controller | Validator | Routes |
|---------|---------|------------|-----------|--------|
| Organization Isolation | ✅ | - | - | - |
| User Permissions | ✅ | - | - | ✅ |
| Pagination | ✅ | - | ✅ | - |
| Search & Filter | ✅ | - | ✅ | - |
| Soft Delete | ✅ | - | - | - |
| Error Handling | ✅ | ✅ | ✅ | - |
| Arabic Messages | ✅ | ✅ | ✅ | ✅ |
| Rate Limiting | - | - | - | ✅ |
| Validation | - | - | ✅ | ✅ |

---

## ملاحظات مهمة

### ⚠️ Response Structure
تأكد من استخدام الترتيب الصحيح في `success()`:
```javascript
// ✅ CORRECT
success(res, data, message, statusCode)

// ❌ WRONG
success(res, message, data, statusCode)
```

### 🔒 Authentication & Authorization
جميع الـ routes محمية بالـ `authenticate` middleware.  
بعض الـ routes (create, update, delete) محمية بالـ `authorize` middleware.

### 📝 Validation
جميع الـ requests تمر عبر validation middleware قبل الوصول للـ controller.

### 🗑️ Soft Delete
الـ templates تستخدم soft delete (تحديث `deleted_at` field بدل حذف نهائي).

---

## الـ APIs القادمة

استخدم هذه الـ Templates لإنشاء:
- ✅ Devices API (الأولوية القادمة - Priority 10/10)
- ✅ Biometrics API (Faces, Fingerprints, Cards)
- ✅ Doors API
- ✅ Door Groups API
- ✅ Access Levels API
- ✅ Access Rules API
- ✅ Events & Logs API
- ✅ Attendance API
- ✅ Sync Operations API

---

## Support

في حال واجهت مشكلة، راجع الأمثلة الحالية:
- Users API: `src/services/userService.js`
- Employees API: `src/services/employeeService.js`

---

**Created**: Feb 6, 2026  
**Version**: 1.0  
**Tested**: ✅ Employees API (20 test cases passed)
