# 🏢 Hikvision Access Control System - Backend

نظام إدارة التحكم بالدخول المتكامل مع أجهزة Hikvision

---

## 📋 ملخص المشروع

نظام backend كامل تم بناؤه باستخدام:
- **Node.js** + **Express.js**
- **PostgreSQL** (18 جدول)
- **JWT Authentication**
- **Multer + Sharp** لمعالجة الصور
- **Hikvision ISAPI** للاتصال بالأجهزة

---

## ✅ المكونات الجاهزة

### 1. Organizations Management ✅
```
GET    /api/organizations           - قائمة المنظمات
POST   /api/organizations           - إنشاء منظمة
GET    /api/organizations/:id       - تفاصيل منظمة
PUT    /api/organizations/:id       - تحديث منظمة
DELETE /api/organizations/:id       - حذف منظمة
POST   /api/organizations/:id/logo  - رفع شعار
```

### 2. Users Management ✅
```
GET    /api/users                   - قائمة المستخدمين
POST   /api/users                   - إنشاء مستخدم
GET    /api/users/:id               - تفاصيل مستخدم
PUT    /api/users/:id               - تحديث مستخدم
DELETE /api/users/:id               - حذف مستخدم
```

### 3. Employees Management ✅
```
GET    /api/employees               - قائمة الموظفين
POST   /api/employees               - إنشاء موظف
GET    /api/employees/:id           - تفاصيل موظف
PUT    /api/employees/:id           - تحديث موظف
DELETE /api/employees/:id           - حذف موظف
POST   /api/employees/:id/photo     - رفع صورة
```

### 4. Devices Management ✅
```
GET    /api/devices                 - قائمة الأجهزة
POST   /api/devices                 - إضافة جهاز
GET    /api/devices/:id             - تفاصيل جهاز
PUT    /api/devices/:id             - تحديث جهاز
DELETE /api/devices/:id             - حذف جهاز
POST   /api/devices/:id/test        - اختبار اتصال
POST   /api/devices/:id/sync        - مزامنة موظفين
```

### 5. Authentication ✅
```
POST   /api/auth/login              - تسجيل دخول
POST   /api/auth/refresh            - تجديد Token
POST   /api/auth/logout             - تسجيل خروج
GET    /api/auth/me                 - معلومات المستخدم الحالي
```

### 6. File Upload System ✅
- **Employee Photos**: 400x400 JPEG, max 5MB
- **Organization Logos**: 300x300 PNG, max 2MB
- معالجة تلقائية (resize, optimize, convert)

---

## 🗄️ قاعدة البيانات

### الجداول (18):
1. `organizations` - المنظمات
2. `users` - المستخدمين
3. `employees` - الموظفين
4. `devices` - الأجهزة
5. `doors` - الأبواب
6. `access_levels` - مستويات الصلاحية
7. `schedules` - الجداول الزمنية
8. `access_groups` - مجموعات الصلاحية
9. `employee_access_groups` - ربط الموظفين بالمجموعات
10. `door_access_groups` - ربط الأبواب بالمجموعات
11. `biometric_templates` - قوالب البصمات والوجه
12. `access_logs` - سجلات الدخول
13. `audit_logs` - سجلات التدقيق
14. `notifications` - الإشعارات
15. `system_settings` - إعدادات النظام
16. `refresh_tokens` - رموز التحديث
17. `password_reset_tokens` - رموز إعادة تعيين كلمة المرور
18. `email_verification_tokens` - رموز التحقق من البريد

---

## 🔌 الاتصال بأجهزة Hikvision

### الجهاز المتصل:
- **IP**: 192.168.1.37
- **الموديل**: DS-K1T344MX-E1
- **الإصدار**: V4.13.0
- **الحالة**: متصل ✅

### الوظائف المتاحة:
- ✅ اختبار الاتصال
- ✅ قراءة معلومات الجهاز
- ✅ إنشاء مستخدمين (UserInfo)
- ⚠️ رفع الوجوه (غير مدعوم عبر API)

### ملاحظة مهمة:
جهاز **DS-K1T344MX-E1** لا يدعم رفع الوجوه عبر ISAPI API.

**الحل البديل:**
1. افتح: http://192.168.1.37
2. Login: admin / HmTech@2023
3. Configuration → Access Control → User Management
4. ارفع الصورة يدوياً للموظف

---

## 🚀 كيفية التشغيل

### 1. تثبيت المتطلبات:
```bash
npm install
```

### 2. إعداد البيئة:
انسخ `.env.example` إلى `.env` وعدّل القيم:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hikvision_acs_dev
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 3. تشغيل السيرفر:
```bash
npm run dev
```

السيرفر يعمل على: **http://localhost:3000**

---

## 📁 هيكل المشروع

```
backend/
├── src/
│   ├── config/          # إعدادات (database, auth)
│   ├── controllers/     # معالجات الطلبات
│   ├── middleware/      # Middleware (auth, validation)
│   ├── models/          # نماذج قاعدة البيانات
│   ├── routes/          # مسارات API
│   ├── services/        # منطق الأعمال
│   ├── utils/           # أدوات مساعدة
│   └── validators/      # التحقق من البيانات
├── uploads/             # الملفات المرفوعة
│   ├── employees/photos/
│   └── organizations/logos/
├── docs/                # التوثيق
├── test-tools/          # أدوات اختبار
├── .env                 # متغيرات البيئة
├── server.js            # نقطة البداية
└── package.json         # المتطلبات
```

---

## 🧪 أدوات الاختبار

### إنشاء Super Admin:
```bash
node create-super-admin.js
```
يُنشئ مستخدم: admin@demo.test / Admin@123

### تعديل قاعدة البيانات:
```bash
node add-sync-columns.js
```
يضيف أعمدة المزامنة للجداول

---

## 📊 البيانات الحالية

### Organizations: 7
### Users: 7
### Employees: 9
- آخر موظف: **حامد علي** (EMP100)

### Devices: 2
- Main Face Recognition Device (192.168.1.37)

---

## 🔐 المستخدم الافتراضي

```
Email: admin@demo.test
Password: Admin@123
Role: super_admin
```

---

## 📝 ما يجب فعله الآن

### 1. رفع صور الموظفين للجهاز:
- افتح web interface: http://192.168.1.37
- سجل دخول: admin / HmTech@2023
- ارفع الصور يدوياً لكل موظف

### 2. اختبار التعرف على الوجه:
- بعد رفع الصور
- قف أمام الجهاز
- راقب سجلات الدخول (Access Logs)

### 3. استرجاع سجلات الدخول:
يمكن إضافة endpoint للجلب التلقائي:
```javascript
GET /api/devices/:id/access-logs
```

### 4. WebSocket للإشعارات الفورية:
إضافة Socket.IO للحصول على:
- إشعارات الدخول الفورية
- تحديثات الحالة المباشرة

### 5. Dashboard للإدارة:
بناء واجهة أمامية (React/Vue) مع:
- عرض سجلات الدخول الحية
- إدارة الموظفين والأجهزة
- تقارير وإحصائيات

---

## 🛠️ تحسينات مستقبلية

- [ ] جدولة مزامنة تلقائية
- [ ] نظام تقارير شامل
- [ ] دعم أجهزة متعددة
- [ ] إشعارات فورية (Push/SMS)
- [ ] تطبيق موبايل للإدارة
- [ ] Face Recognition Logs Dashboard
- [ ] Backup تلقائي للبيانات

---

## 🎯 الخلاصة

### ما تم إنجازه ✅:
- ✅ نظام backend كامل ومنظم
- ✅ 18 جدول في قاعدة البيانات
- ✅ 30+ API endpoint
- ✅ نظام رفع ومعالجة الصور
- ✅ اتصال ناجح بجهاز Hikvision
- ✅ إنشاء موظفين على الجهاز

### التحدي الوحيد ⚠️:
- رفع الوجوه يدوياً عبر web interface
- السبب: الجهاز لا يدعم ISAPI Face Upload API

### الحل ✅:
- استخدام Device Web Interface
- أو ترقية الجهاز لموديل أحدث
- أو استخدام SDK بدلاً من ISAPI

---

**تم بناء هذا النظام بالكامل في فبراير 2026** 🚀
