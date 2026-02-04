# 🎯 الوظائف المطلوبة | Required Features

> آخر تحديث: 4 فبراير 2026

---

## 📱 منصات التطبيق | Platforms

- ✅ **تطبيق موبايل** (Mobile App) - Flutter
- ✅ **تطبيق ويب** (Web App) - React + Next.js
- ✅ **API Backend** - Node.js + Express

---

## 👥 المستخدمون المستهدفون | Target Users

**أصحاب الأعمال (Business Owners) في العراق**
- أصحاب الشركات الصغيرة والمتوسطة
- مدراء الموارد البشرية
- مشرفو الحضور والانصراف
- إدارات الأمن

---

## 🏗️ البنية الأساسية | Core Architecture

### Multi-Tenant System (نظام متعدد المؤسسات)
- كل مؤسسة لها بيانات منفصلة
- عزل كامل بين البيانات (Data Isolation)
- اشتراكات مختلفة (Subscription Plans)
- حدود استخدام (Usage Limits)

---

## 📋 الوظائف الرئيسية | Main Features

### 1️⃣ إدارة المؤسسات | Organization Management

#### 1.1 التسجيل والاشتراك
- [ ] تسجيل مؤسسة جديدة
- [ ] اختيار خطة الاشتراك (Free, Basic, Pro, Enterprise)
- [ ] معلومات المؤسسة (الاسم، العنوان، رقم الهاتف)
- [ ] رفع شعار المؤسسة (Logo)

#### 1.2 إعدادات المؤسسة
- [ ] تعديل معلومات المؤسسة
- [ ] إدارة الاشتراك (Upgrade/Downgrade)
- [ ] إعدادات ساعات العمل (Work Hours)
- [ ] إعدادات الإجازات (Holidays)
- [ ] إعدادات التنبيهات (Notification Settings)

#### 1.3 حدود الاستخدام (Usage Limits)
- [ ] عدد الموظفين المسموح (Employee Limit)
- [ ] عدد الأجهزة المسموح (Device Limit)
- [ ] مساحة التخزين (Storage Limit)
- [ ] عدد التقارير الشهرية (Report Limit)

**API Endpoints:**
```
POST   /api/v1/organizations              - Create organization
GET    /api/v1/organizations/:id          - Get organization
PUT    /api/v1/organizations/:id          - Update organization
DELETE /api/v1/organizations/:id          - Delete organization
PUT    /api/v1/organizations/:id/logo     - Upload logo
GET    /api/v1/organizations/:id/usage    - Get usage stats
```

---

### 2️⃣ إدارة المستخدمين | User Management

#### 2.1 الحسابات الإدارية
- [ ] تسجيل دخول Admin/Manager
- [ ] تسجيل الخروج (Logout)
- [ ] تذكرني (Remember Me)
- [ ] نسيت كلمة المرور (Forgot Password)
- [ ] إعادة تعيين كلمة المرور (Reset Password)

#### 2.2 إدارة الأدوار والصلاحيات (Roles & Permissions)
- [ ] **Super Admin**: كامل الصلاحيات
- [ ] **Admin**: إدارة المؤسسة
- [ ] **Manager**: عرض وإدارة محدودة
- [ ] **Viewer**: عرض فقط

#### 2.3 إدارة المستخدمين
- [ ] إضافة مستخدم جديد
- [ ] تعديل معلومات المستخدم
- [ ] تعيين الأدوار (Assign Roles)
- [ ] تفعيل/تعطيل حساب (Activate/Deactivate)
- [ ] حذف مستخدم
- [ ] سجل نشاط المستخدم (Activity Log)

**API Endpoints:**
```
POST   /api/v1/auth/register              - Register
POST   /api/v1/auth/login                 - Login
POST   /api/v1/auth/logout                - Logout
POST   /api/v1/auth/refresh               - Refresh token
POST   /api/v1/auth/forgot-password       - Forgot password
POST   /api/v1/auth/reset-password        - Reset password

GET    /api/v1/users                      - List users
POST   /api/v1/users                      - Create user
GET    /api/v1/users/:id                  - Get user
PUT    /api/v1/users/:id                  - Update user
DELETE /api/v1/users/:id                  - Delete user
PUT    /api/v1/users/:id/role             - Assign role
GET    /api/v1/users/:id/activity         - Activity log
```

---

### 3️⃣ إدارة الأجهزة | Device Management

#### 3.1 إضافة جهاز جديد
- [ ] إدخال معلومات الجهاز (IP, Port, Username, Password)
- [ ] اختبار الاتصال (Test Connection)
- [ ] الحصول على معلومات الجهاز (Device Info)
- [ ] حفظ الجهاز في قاعدة البيانات

#### 3.2 معلومات الجهاز
- [ ] اسم الجهاز (Device Name)
- [ ] رقم التسلسل (Serial Number)
- [ ] الموديل (Model)
- [ ] نسخة الـ Firmware
- [ ] عنوان MAC
- [ ] الموقع (Location)
- [ ] حالة الجهاز (Online/Offline)

#### 3.3 إعدادات الجهاز
- [ ] تعديل معلومات الاتصال
- [ ] تغيير اسم الجهاز
- [ ] تغيير الموقع
- [ ] إعادة تشغيل الجهاز (Reboot)
- [ ] تحديث الـ Firmware (Future)

#### 3.4 مراقبة الجهاز
- [ ] حالة الاتصال (Connection Status)
- [ ] استخدام CPU
- [ ] استخدام الذاكرة (Memory Usage)
- [ ] درجة الحرارة (Temperature)
- [ ] وقت التشغيل (Uptime)
- [ ] آخر اتصال (Last Seen)

#### 3.5 السعة والحدود (Capacity)
- [ ] عدد الوجوه المسجلة / الحد الأقصى
- [ ] عدد البطاقات المسجلة / الحد الأقصى
- [ ] عدد البصمات المسجلة / الحد الأقصى
- [ ] عدد السجلات / الحد الأقصى

#### 3.6 التحكم بالباب (Door Control)
- [ ] فتح الباب عن بُعد (Remote Open)
- [ ] إغلاق الباب (Close Door)
- [ ] حالة الباب (Door Status - Open/Closed)

**API Endpoints:**
```
GET    /api/v1/devices                    - List devices
POST   /api/v1/devices                    - Add device
GET    /api/v1/devices/:id                - Get device
PUT    /api/v1/devices/:id                - Update device
DELETE /api/v1/devices/:id                - Delete device
POST   /api/v1/devices/:id/test           - Test connection
GET    /api/v1/devices/:id/status         - Get device status
GET    /api/v1/devices/:id/capacity       - Get capacity info
POST   /api/v1/devices/:id/reboot         - Reboot device
POST   /api/v1/devices/:id/door/open      - Open door
POST   /api/v1/devices/:id/door/close     - Close door
GET    /api/v1/devices/:id/door/status    - Door status
```

---

### 4️⃣ إدارة الموظفين | Employee Management

#### 4.1 إضافة موظف جديد
- [ ] المعلومات الأساسية:
  - الاسم الكامل
  - رقم الموظف (Employee No)
  - القسم (Department)
  - المنصب (Position)
  - رقم الهاتف
  - البريد الإلكتروني
  - تاريخ التوظيف
- [ ] رفع صورة شخصية (Profile Photo)
- [ ] تحديد نوع الدوام (Work Schedule)

#### 4.2 تسجيل الوجه (Face Registration)
- [ ] رفع صورة الوجه
- [ ] معاينة الصورة قبل الرفع
- [ ] التحقق من جودة الصورة
- [ ] رفع الوجه لجهاز واحد
- [ ] رفع الوجه لعدة أجهزة (Bulk Upload)
- [ ] حالة التسجيل (Success/Failed)

#### 4.3 تسجيل البطاقة (Card Registration)
- [ ] إدخال رقم البطاقة يدوياً
- [ ] قراءة البطاقة من الجهاز (Future - NFC)
- [ ] تعيين البطاقة للموظف
- [ ] إلغاء تفعيل البطاقة
- [ ] استبدال البطاقة

#### 4.4 تسجيل البصمة (Fingerprint Registration)
- [ ] تسجيل بصمة الإصبع
- [ ] تسجيل بصمات متعددة (Multiple Fingers)
- [ ] حالة التسجيل

#### 4.5 تسجيل QR Code
- [ ] توليد QR Code تلقائياً
- [ ] طباعة QR Code
- [ ] مسح QR Code للتسجيل

#### 4.6 إدارة الموظفين
- [ ] عرض قائمة الموظفين
- [ ] البحث والفلترة:
  - بالاسم
  - برقم الموظف
  - بالقسم
  - بالحالة (Active/Inactive)
- [ ] تعديل معلومات الموظف
- [ ] تفعيل/تعطيل موظف
- [ ] حذف موظف
- [ ] نقل موظف لقسم آخر

#### 4.7 مزامنة الموظفين
- [ ] مزامنة موظف واحد لجهاز واحد
- [ ] مزامنة موظف واحد لكل الأجهزة
- [ ] مزامنة كل الموظفين لجهاز واحد
- [ ] مزامنة كل الموظفين لكل الأجهزة
- [ ] سجل المزامنة (Sync Log)
- [ ] حالة المزامنة (Success/Failed/Pending)

**API Endpoints:**
```
GET    /api/v1/employees                  - List employees
POST   /api/v1/employees                  - Create employee
GET    /api/v1/employees/:id              - Get employee
PUT    /api/v1/employees/:id              - Update employee
DELETE /api/v1/employees/:id              - Delete employee
PUT    /api/v1/employees/:id/photo        - Upload photo

POST   /api/v1/employees/:id/face         - Upload face
DELETE /api/v1/employees/:id/face         - Delete face
POST   /api/v1/employees/:id/card         - Add card
DELETE /api/v1/employees/:id/card/:cardId - Delete card
POST   /api/v1/employees/:id/fingerprint  - Add fingerprint
DELETE /api/v1/employees/:id/fingerprint/:fpId - Delete fingerprint
POST   /api/v1/employees/:id/qrcode       - Generate QR code

POST   /api/v1/employees/:id/sync         - Sync employee to devices
POST   /api/v1/employees/sync-all         - Sync all employees
GET    /api/v1/employees/:id/sync-status  - Get sync status
```

---

### 5️⃣ الحضور والانصراف | Attendance Management

#### 5.1 عرض السجلات (View Logs)
- [ ] عرض سجل الحضور اليومي
- [ ] فلترة بالتاريخ (Date Range)
- [ ] فلترة بالموظف
- [ ] فلترة بالقسم
- [ ] فلترة بنوع الحدث (Check-in/Check-out)
- [ ] فلترة بطريقة التحقق (Face/Card/Fingerprint)

#### 5.2 تفاصيل الحدث
- [ ] اسم الموظف
- [ ] رقم الموظف
- [ ] وقت الحدث (Timestamp)
- [ ] نوع الحدث (Check-in/Check-out)
- [ ] طريقة التحقق
- [ ] صورة الحدث (Event Photo)
- [ ] اسم الجهاز
- [ ] موقع الجهاز
- [ ] حالة النجاح/الفشل

#### 5.3 الملخص اليومي (Daily Summary)
- [ ] إجمالي الحضور
- [ ] إجمالي الغياب
- [ ] التأخير (Late Arrivals)
- [ ] المغادرة المبكرة (Early Departures)
- [ ] ساعات العمل الفعلية
- [ ] الوقت الإضافي (Overtime)

#### 5.4 الحضور المباشر (Real-time Attendance)
- [ ] عرض الأحداث فوراً (Live Feed)
- [ ] إشعارات فورية (Real-time Notifications)
- [ ] صوت التنبيه (Sound Alert)
- [ ] عرض الصورة الملتقطة

#### 5.5 تعديل السجلات (Manual Adjustments)
- [ ] إضافة سجل يدوياً
- [ ] تعديل وقت الحدث
- [ ] حذف سجل خاطئ
- [ ] إضافة ملاحظة
- [ ] سجل التعديلات (Audit Trail)

**API Endpoints:**
```
GET    /api/v1/attendance/logs            - Get attendance logs
GET    /api/v1/attendance/logs/:id        - Get log details
POST   /api/v1/attendance/logs            - Create manual log
PUT    /api/v1/attendance/logs/:id        - Update log
DELETE /api/v1/attendance/logs/:id        - Delete log
GET    /api/v1/attendance/summary         - Get daily summary
GET    /api/v1/attendance/live            - Real-time feed (WebSocket)
POST   /api/v1/attendance/sync            - Sync logs from devices
```

---

### 6️⃣ إدارة الدوام | Schedule Management

#### 6.1 أنواع الدوام (Schedule Types)
- [ ] دوام ثابت (Fixed Schedule)
- [ ] دوام مرن (Flexible Schedule)
- [ ] دوام بنظام الورديات (Shift System)
- [ ] دوام جزئي (Part-time)

#### 6.2 إنشاء جدول دوام
- [ ] اسم الجدول (Schedule Name)
- [ ] وقت البدء (Start Time)
- [ ] وقت الانتهاء (End Time)
- [ ] فترة السماح (Grace Period)
  - تأخير مسموح به (Late Grace)
  - مغادرة مبكرة مسموحة (Early Leave Grace)
- [ ] أيام العمل (Work Days)
- [ ] الإجازة الأسبوعية (Weekend)

#### 6.3 تعيين الدوام للموظفين
- [ ] تعيين دوام لموظف واحد
- [ ] تعيين دوام لقسم كامل
- [ ] تعيين دوام لعدة موظفين (Bulk Assign)
- [ ] جدول الورديات (Shift Roster)

#### 6.4 الاستثناءات (Exceptions)
- [ ] الإجازات الرسمية (Public Holidays)
- [ ] الإجازات السنوية (Annual Leave)
- [ ] الإجازات المرضية (Sick Leave)
- [ ] الإجازات الطارئة (Emergency Leave)
- [ ] أيام العمل الإضافية (Extra Work Days)

**API Endpoints:**
```
GET    /api/v1/schedules                  - List schedules
POST   /api/v1/schedules                  - Create schedule
GET    /api/v1/schedules/:id              - Get schedule
PUT    /api/v1/schedules/:id              - Update schedule
DELETE /api/v1/schedules/:id              - Delete schedule
POST   /api/v1/schedules/:id/assign       - Assign to employees
GET    /api/v1/schedules/:id/employees    - Get assigned employees
```

---

### 7️⃣ التقارير | Reports

#### 7.1 تقرير الحضور اليومي
- [ ] قائمة الحاضرين
- [ ] قائمة الغائبين
- [ ] التأخير والمغادرة المبكرة
- [ ] تصدير PDF
- [ ] تصدير Excel

#### 7.2 تقرير الحضور الشهري
- [ ] ملخص الحضور لكل موظف
- [ ] عدد أيام الحضور
- [ ] عدد أيام الغياب
- [ ] عدد أيام التأخير
- [ ] إجمالي ساعات العمل
- [ ] الوقت الإضافي

#### 7.3 تقرير حسب القسم
- [ ] نسبة الحضور لكل قسم
- [ ] مقارنة الأقسام
- [ ] الإحصائيات

#### 7.4 تقرير حسب الموظف
- [ ] سجل الحضور الكامل
- [ ] تاريخ الحضور والانصراف
- [ ] الإجازات
- [ ] التأخيرات
- [ ] الوقت الإضافي

#### 7.5 التقارير المخصصة (Custom Reports)
- [ ] اختيار الحقول المطلوبة
- [ ] اختيار الفترة الزمنية
- [ ] اختيار الفلاتر
- [ ] حفظ التقرير
- [ ] جدولة التقارير (Scheduled Reports)

#### 7.6 التصدير (Export)
- [ ] PDF
- [ ] Excel (XLSX)
- [ ] CSV
- [ ] طباعة مباشرة

**API Endpoints:**
```
GET    /api/v1/reports/daily              - Daily report
GET    /api/v1/reports/monthly            - Monthly report
GET    /api/v1/reports/department         - Department report
GET    /api/v1/reports/employee/:id       - Employee report
POST   /api/v1/reports/custom             - Generate custom report
GET    /api/v1/reports/:id/export         - Export report
POST   /api/v1/reports/schedule           - Schedule report
```

---

### 8️⃣ الإشعارات | Notifications

#### 8.1 أنواع الإشعارات
- [ ] حضور موظف (Employee Check-in)
- [ ] انصراف موظف (Employee Check-out)
- [ ] تأخير موظف (Late Arrival)
- [ ] غياب موظف (Absence)
- [ ] جهاز غير متصل (Device Offline)
- [ ] جهاز متصل (Device Online)
- [ ] فشل التعرف (Recognition Failed)
- [ ] محاولة دخول غير مصرح (Unauthorized Access)

#### 8.2 قنوات الإشعارات
- [ ] إشعارات داخل التطبيق (In-app)
- [ ] إشعارات الموبايل (Push Notifications)
- [ ] البريد الإلكتروني (Email)
- [ ] رسائل SMS (Future)
- [ ] Telegram Bot (Future)

#### 8.3 إعدادات الإشعارات
- [ ] تفعيل/تعطيل نوع معين
- [ ] اختيار القناة المفضلة
- [ ] أوقات الإشعارات (Active Hours)
- [ ] تجميع الإشعارات (Batch Notifications)

**API Endpoints:**
```
GET    /api/v1/notifications               - Get notifications
GET    /api/v1/notifications/:id           - Get notification
PUT    /api/v1/notifications/:id/read      - Mark as read
DELETE /api/v1/notifications/:id           - Delete notification
PUT    /api/v1/notifications/read-all      - Mark all as read
GET    /api/v1/notifications/settings      - Get settings
PUT    /api/v1/notifications/settings      - Update settings
```

---

### 9️⃣ لوحة التحكم | Dashboard

#### 9.1 الإحصائيات العامة
- [ ] عدد الموظفين الكلي
- [ ] عدد الموظفين الحاضرين اليوم
- [ ] عدد الموظفين الغائبين اليوم
- [ ] عدد الموظفين المتأخرين
- [ ] نسبة الحضور (Attendance Rate)

#### 9.2 الرسوم البيانية (Charts)
- [ ] رسم بياني للحضور اليومي (Last 7 days)
- [ ] رسم بياني للحضور الشهري
- [ ] رسم بياني حسب القسم
- [ ] رسم بياني لأوقات الحضور (Peak Hours)

#### 9.3 الأحداث الأخيرة (Recent Events)
- [ ] آخر 10 أحداث حضور
- [ ] الصورة الملتقطة
- [ ] الوقت
- [ ] اسم الموظف

#### 9.4 حالة الأجهزة (Device Status)
- [ ] عدد الأجهزة الكلي
- [ ] الأجهزة المتصلة (Online)
- [ ] الأجهزة غير المتصلة (Offline)
- [ ] تنبيهات الأجهزة

#### 9.5 التنبيهات (Alerts)
- [ ] موظفين متأخرين
- [ ] موظفين غائبين
- [ ] أجهزة معطلة
- [ ] مشاكل المزامنة

**API Endpoints:**
```
GET    /api/v1/dashboard/stats            - General statistics
GET    /api/v1/dashboard/charts           - Chart data
GET    /api/v1/dashboard/recent-events    - Recent events
GET    /api/v1/dashboard/device-status    - Device status
GET    /api/v1/dashboard/alerts           - Active alerts
```

---

### 🔟 سجل النشاط | Audit Log

#### 10.1 تسجيل الأحداث
- [ ] تسجيل دخول/خروج مستخدم
- [ ] إضافة/تعديل/حذف موظف
- [ ] إضافة/تعديل/حذف جهاز
- [ ] تعديل الإعدادات
- [ ] تعديل سجل الحضور
- [ ] مزامنة البيانات

#### 10.2 عرض السجل
- [ ] عرض كل الأحداث
- [ ] فلترة بالمستخدم
- [ ] فلترة بنوع الحدث
- [ ] فلترة بالتاريخ
- [ ] البحث في السجل

#### 10.3 تفاصيل الحدث
- [ ] المستخدم
- [ ] نوع الحدث
- [ ] الوصف
- [ ] البيانات القديمة
- [ ] البيانات الجديدة
- [ ] عنوان IP
- [ ] التاريخ والوقت

**API Endpoints:**
```
GET    /api/v1/audit-logs                 - List audit logs
GET    /api/v1/audit-logs/:id             - Get audit log
```

---

## ⚙️ الإعدادات العامة | General Settings

### 11.1 إعدادات النظام
- [ ] لغة النظام (العربية/English)
- [ ] المنطقة الزمنية (Asia/Baghdad)
- [ ] صيغة التاريخ (DD/MM/YYYY, MM/DD/YYYY)
- [ ] صيغة الوقت (12h/24h)
- [ ] العملة (IQD, USD)

### 11.2 إعدادات الأمان
- [ ] تفعيل المصادقة الثنائية (2FA)
- [ ] طول كلمة المرور الأدنى
- [ ] تعقيد كلمة المرور
- [ ] انتهاء صلاحية كلمة المرور
- [ ] عدد محاولات تسجيل الدخول
- [ ] مدة الجلسة (Session Timeout)

### 11.3 إعدادات البريد الإلكتروني
- [ ] خادم SMTP
- [ ] منفذ SMTP
- [ ] اسم المستخدم
- [ ] كلمة المرور
- [ ] التشفير (TLS/SSL)
- [ ] البريد الافتراضي للإرسال

### 11.4 إعدادات النسخ الاحتياطي
- [ ] تفعيل النسخ التلقائي
- [ ] توقيت النسخ
- [ ] مكان الحفظ
- [ ] عدد النسخ المحفوظة
- [ ] استعادة من نسخة احتياطية

**API Endpoints:**
```
GET    /api/v1/settings                   - Get all settings
PUT    /api/v1/settings/system            - Update system settings
PUT    /api/v1/settings/security          - Update security settings
PUT    /api/v1/settings/email             - Update email settings
PUT    /api/v1/settings/backup            - Update backup settings
POST   /api/v1/settings/backup/create     - Create backup now
POST   /api/v1/settings/backup/restore    - Restore from backup
```

---

## 🔄 المزامنة التلقائية | Auto Sync

### 12.1 مزامنة البيانات
- [ ] مزامنة الموظفين كل 5 دقائق
- [ ] مزامنة الأحداث كل دقيقة
- [ ] مزامنة حالة الأجهزة كل دقيقة
- [ ] إعادة محاولة الفاشلة (Retry Failed)

### 12.2 سجل المزامنة
- [ ] عرض سجل المزامنة
- [ ] حالة المزامنة (Success/Failed/Pending)
- [ ] عدد السجلات المزامنة
- [ ] الأخطاء
- [ ] الوقت المستغرق

**Cron Jobs:**
```javascript
// Every 1 minute - Sync events
'*/1 * * * *'

// Every 5 minutes - Sync employees
'*/5 * * * *'

// Every 1 minute - Check device status
'*/1 * * * *'

// Daily at midnight - Calculate attendance summary
'0 0 * * *'

// Daily at 2 AM - Cleanup old logs (90 days)
'0 2 * * *'
```

---

## 📊 إحصائيات متقدمة | Advanced Analytics

### 13.1 تحليلات الحضور
- [ ] معدل الحضور الشهري
- [ ] اتجاهات التأخير (Lateness Trends)
- [ ] أكثر الموظفين التزاماً
- [ ] أكثر الموظفين تأخيراً
- [ ] أكثر الأقسام التزاماً

### 13.2 تحليلات الأداء
- [ ] متوسط ساعات العمل
- [ ] الوقت الإضافي الإجمالي
- [ ] معدل الغياب
- [ ] معدل الإجازات

**API Endpoints:**
```
GET    /api/v1/analytics/attendance       - Attendance analytics
GET    /api/v1/analytics/performance      - Performance analytics
GET    /api/v1/analytics/trends           - Trends data
```

---

## 🌐 WebSocket Events (Real-time)

### Events من Server إلى Client
```javascript
// حدث حضور جديد
'attendance_event' => {
  employeeNo: '1001',
  name: 'أحمد علي',
  time: '2024-01-15T08:30:00',
  type: 'check-in',
  method: 'face',
  photo: 'https://...',
  deviceName: 'Main Gate'
}

// تغيير حالة الجهاز
'device_status' => {
  deviceId: '123',
  deviceName: 'Main Gate',
  status: 'online', // or 'offline'
  lastSeen: '2024-01-15T08:30:00'
}

// إشعار جديد
'notification' => {
  id: '456',
  type: 'late_arrival',
  title: 'موظف متأخر',
  message: 'أحمد علي تأخر 15 دقيقة',
  timestamp: '2024-01-15T08:30:00'
}

// تحديث المزامنة
'sync_update' => {
  type: 'employee',
  status: 'success',
  employeeId: '1001',
  deviceId: '123'
}
```

---

## 📱 ميزات تطبيق الموبايل الإضافية

### 14.1 الإشعارات الفورية (Push Notifications)
- [ ] إشعارات الحضور
- [ ] إشعارات الأجهزة
- [ ] تنبيهات مخصصة

### 14.2 الوضع الداكن (Dark Mode)
- [ ] تبديل تلقائي
- [ ] تبديل يدوي

### 14.3 العمل بدون اتصال (Offline Mode)
- [ ] عرض البيانات المحفوظة
- [ ] مزامنة عند الاتصال

### 14.4 الماسح الضوئي (Scanner)
- [ ] مسح QR Code
- [ ] مسح Barcode (Future)

---

## 🎨 ميزات واجهة المستخدم

### 15.1 سهولة الاستخدام
- [ ] واجهة عربية بالكامل
- [ ] دعم RTL (Right-to-Left)
- [ ] تصميم متجاوب (Responsive)
- [ ] سهولة التنقل
- [ ] أيقونات واضحة

### 15.2 الأداء
- [ ] تحميل سريع
- [ ] Lazy Loading للصور
- [ ] Pagination للقوائم
- [ ] Caching للبيانات

---

## 📝 ملاحظات التطوير

### الأولويات (Priorities)
1. **Phase 1 - MVP (الحد الأدنى):**
   - [ ] تسجيل دخول
   - [ ] إدارة الموظفين
   - [ ] تسجيل الوجه
   - [ ] عرض الحضور
   - [ ] Dashboard بسيط

2. **Phase 2 - Core Features:**
   - [ ] إدارة الأجهزة
   - [ ] إدارة الدوام
   - [ ] التقارير الأساسية
   - [ ] الإشعارات

3. **Phase 3 - Advanced:**
   - [ ] Real-time Events
   - [ ] تقارير متقدمة
   - [ ] Analytics
   - [ ] Mobile App

4. **Phase 4 - Enterprise:**
   - [ ] Multi-tenant
   - [ ] API Documentation
   - [ ] Integrations
   - [ ] Advanced Security

---

## ✅ Checklist للتطوير

```
□ Database Schema
□ Backend API
  □ Authentication
  □ Organizations
  □ Users
  □ Devices
  □ Employees
  □ Attendance
  □ Schedules
  □ Reports
  □ Notifications
  □ Dashboard
  □ Settings
□ ISAPI Client
□ WebSocket
□ Cron Jobs
□ Frontend (Web)
  □ Login/Register
  □ Dashboard
  □ Employee Management
  □ Device Management
  □ Attendance
  □ Reports
  □ Settings
□ Mobile App
  □ Login
  □ Dashboard
  □ Notifications
  □ Reports
□ Testing
□ Documentation
□ Deployment
```

---

**💡 ملاحظة مهمة:** هذا الملف يحتوي على **كل** الوظائف المطلوبة. سنبدأ بـ MVP ونضيف الميزات تدريجياً.
