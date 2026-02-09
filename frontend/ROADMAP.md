# 📋 Frontend Development Roadmap
## Hikvision ACS System - خريطة تطوير الفرونت ايند

**تاريخ الإنشاء:** 8 فبراير 2026  
**الحالة:** قيد التنفيذ  
**الباك ايند:** ✅ مكتمل 100% (50+ API endpoints)  
**التقنية المعتمدة:** ✅ **Vue 3 + JavaScript** (تم الاعتماد)

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

### **Frontend Framework:**
- ✅ **Vue 3.4+** - Composition API مع `<script setup>`
- ✅ **JavaScript (ES6+)** - بدون TypeScript للبساطة
- ✅ **Vite 5+** - Build tool سريع جداً

### **UI Framework:**
- ✅ **Vuetify 3** - Component library مع RTL support كامل
  - Material Design components
  - Arabic localization
  - RTL support مدمج
  - DataTable قوي ومتطور

### **State Management:**
- ✅ **Pinia 2** - Store management (بديل Vuex)
  - أبسط من Vuex
  - TypeScript ready (لو احتجنا بالمستقبل)
  - DevTools support

### **Routing:**
- ✅ **Vue Router 4** - Official router
  - Nested routes
  - Route guards للحماية
  - Dynamic routing

### **Data Fetching & Caching:**
- ✅ **@tanstack/vue-query** (VueQuery) - Server state management
  - Auto caching
  - Background refetching
  - Optimistic updates
  - Infinite queries

### **HTTP Client:**
- ✅ **Axios** - API requests
  - Interceptors للـ JWT
  - Request/Response transformation
  - Error handling

### **Form Management:**
- ✅ **VeeValidate 4** - Form validation
  - Schema validation
  - Easy integration مع Vuetify
  - Custom validators

### **Date/Time:**
- ✅ **date-fns** - Date utilities
  - Lightweight
  - Arabic locale support
  - Tree-shakeable

### **Charts & Visualization:**
- ✅ **Chart.js + vue-chartjs** - رسوم بيانية
  - Line, Bar, Pie, Donut charts
  - Responsive
  - Arabic labels support

### **File Upload:**
- ✅ **Vuetify File Input** - مدمج مع المكتبة
- ✅ **vue-advanced-cropper** - Crop images قبل الرفع

### **Hikvision Integration:**
- ✅ **jQuery 3.7** - للتوافق مع WebSDK
- ✅ **Hikvision WebSDK V3.3.1** - Video plugin
  - Live preview
  - Playback
  - PTZ control
  - Device management

### **Development Tools:**
- ✅ **ESLint** - Code linting
- ✅ **Prettier** - Code formatting
- ✅ **Vue DevTools** - Browser extension

### **CSS & Styling:**
- ✅ **Vuetify SASS variables** - Theme customization
- ✅ **RTL Support** - من Vuetify
- ✅ **Cairo Font** - Arabic typography

---

## 📦 Package Dependencies (ملخص)

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vuetify": "^3.5.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@tanstack/vue-query": "^5.0.0",
    "axios": "^1.6.0",
    "vee-validate": "^4.12.0",
    "date-fns": "^3.0.0",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0",
    "vue-advanced-cropper": "^2.8.0",
    "jquery": "^3.7.0",
    "@mdi/font": "^7.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.20.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 🎯 سبب اختيار Vue 3

### ✅ التوافق مع Hikvision WebSDK:
1. **jQuery Support** - يشتغل بدون أي تعارض
2. **Direct DOM Access** - عبر `$refs` بدون تعقيد
3. **Lifecycle Hooks واضحة** - `onMounted`, `onBeforeUnmount`
4. **Callbacks Integration سهل** - مع SDK callbacks
5. **ما في Virtual DOM conflicts** - كل شي مباشر

### ✅ مناسب للمشاريع Enterprise:
1. **مجتمع واسع** - يستخدمونه في .NET, PHP, Laravel, Django
2. **Documentation ممتازة** - بالعربي والإنجليزي
3. **Learning Curve سهل** - أسهل من React
4. **خفيف** - ما يعقد المشروع
5. **UI Libraries قوية** - Vuetify يوفر كل شي

### ✅ توافق 95%+ مع SDK:
- ✅ تجربة عملية مع WebSDK V3.3.1
- ✅ Integration مع jsVideoPlugin ناجح
- ✅ ISAPI Protocol يشتغل بدون مشاكل
- ✅ jQuery + Vue = ما في تعارض

---

## 📊 الوضع الحالي

### ✅ المكتمل
- [x] Login Page - صفحة تسجيل الدخول
- [x] Dashboard - لوحة التحكم (Stats Cards)
- [x] Layout Component - التخطيط العام (Sidebar + AppBar)
- [x] Employees Page - عرض الموظفين (DataGrid فقط)
- [x] Authentication Context - إدارة الجلسات
- [x] Routing Setup - نظام التوجيه
- [x] Material-UI Theme - السمة مع RTL

### ⏳ قيد التطوير
- [ ] باقي الصفحات (5 صفحات placeholder)
- [ ] نماذج الإضافة والتعديل
- [ ] رفع الملفات (صور - شعارات)
- [ ] المكونات المشتركة

---

## 🎯 خريطة العمل التفصيلية

### **المرحلة 1: إدارة الموظفين** 👥
**الأولوية:** 🔴 عالية جداً  
**الموجود:** ✅ DataGrid مع عرض البيانات  
**الباك ايند:** ✅ 13 endpoints جاهزة

#### المطلوب:
- [ ] **1.1 Create/Edit Employee Dialog**
  - نموذج إضافة موظف جديد
  - نموذج تعديل بيانات موظف موجود
  - Validation على جميع الحقول
  - الحقول المطلوبة:
    * employee_no (رقم الموظف)
    * name (الاسم)
    * organization_id (المنظمة)
    * department (القسم)
    * position (المنصب)
    * email (البريد الإلكتروني)
    * phone (الهاتف)
    * hire_date (تاريخ التوظيف)
    * is_active (نشط/غير نشط)

- [ ] **1.2 Employee Photo Upload**
  - رفع صورة الموظف
  - Image preview قبل الرفع
  - Crop/Resize functionality
  - عرض الصورة الحالية
  - حذف الصورة

- [ ] **1.3 Biometrics Viewer**
  - عرض البيانات البيومترية للموظف
  - Face data status
  - Fingerprint data status
  - Card number (إن وجد)

- [ ] **1.4 Employee Actions**
  - تفعيل موظف (Activate)
  - إلغاء تفعيل موظف (Deactivate)
  - حذف موظف (Delete with confirmation)
  - عرض تفاصيل الموظف (View Details)

- [ ] **1.5 Advanced Features**
  - البحث المتقدم (بالاسم، الرقم، القسم)
  - التصفية حسب المنظمة
  - التصفية حسب الحالة (نشط/غير نشط)
  - التصدير إلى Excel/CSV

**API Endpoints المتاحة:**
```
GET    /api/employees               ✅
GET    /api/employees/:id           ✅
POST   /api/employees               ✅
PUT    /api/employees/:id           ✅
DELETE /api/employees/:id           ✅
POST   /api/employees/:id/photo     ✅
GET    /api/employees/:id/photo     ✅
DELETE /api/employees/:id/photo     ✅
POST   /api/employees/:id/activate  ✅
POST   /api/employees/:id/deactivate ✅
GET    /api/employees/:id/biometrics ✅
GET    /api/employees/stats/overview ✅
GET    /api/employees/departments/list ✅
```

---

### **المرحلة 2: إدارة المنظمات** 🏢
**الأولوية:** 🔴 عالية  
**الموجود:** ⏳ صفحة placeholder  
**الباك ايند:** ✅ 12 endpoints جاهزة

#### المطلوب:
- [ ] **2.1 Organizations DataGrid**
  - عرض جميع المنظمات في جدول
  - الأعمدة:
    * Logo (الشعار - صورة مصغرة)
    * Name (الاسم)
    * Type (النوع)
    * Status (الحالة)
    * Subscription Status (حالة الاشتراك)
    * Created At (تاريخ الإنشاء)
  - البحث والتصفية
  - Server-side pagination

- [ ] **2.2 Create/Edit Organization Dialog**
  - نموذج إضافة منظمة جديدة
  - نموذج تعديل منظمة موجودة
  - الحقول:
    * name (الاسم بالعربي)
    * name_en (الاسم بالإنجليزي)
    * description (الوصف)
    * type (النوع: company, government, educational, etc.)
    * address (العنوان)
    * city, country
    * contact_name, contact_phone, contact_email
    * is_active (نشط/غير نشط)

- [ ] **2.3 Organization Logo Management**
  - رفع الشعار
  - معاينة الشعار
  - حذف الشعار
  - عرض الشعار في الجدول

- [ ] **2.4 Organization Statistics Panel**
  - عدد الموظفين
  - عدد الأجهزة
  - عدد المستخدمين
  - الموظفين النشطين
  - آخر نشاط

- [ ] **2.5 Organization Settings**
  - إعدادات خاصة بكل منظمة
  - Subscription management
  - تحديث حالة الاشتراك
  - تاريخ الانتهاء

**API Endpoints المتاحة:**
```
GET    /api/organizations               ✅
GET    /api/organizations/:id           ✅
POST   /api/organizations               ✅
PUT    /api/organizations/:id           ✅
DELETE /api/organizations/:id           ✅
POST   /api/organizations/:id/logo      ✅
GET    /api/organizations/:id/logo      ✅
DELETE /api/organizations/:id/logo      ✅
GET    /api/organizations/:id/stats     ✅
GET    /api/organizations/:id/settings  ✅
PUT    /api/organizations/:id/settings  ✅
PUT    /api/organizations/:id/subscription ✅
```

---

### **المرحلة 3: إدارة الأجهزة** 📱
**الأولوية:** 🟡 متوسطة  
**الموجود:** ⏳ صفحة placeholder  
**الباك ايند:** ✅ 10+ endpoints جاهزة

#### المطلوب:
- [ ] **3.1 Devices DataGrid**
  - عرض جميع الأجهزة
  - الأعمدة:
    * Name (الاسم)
    * IP Address (عنوان IP)
    * Model (الموديل)
    * Serial Number (الرقم التسلسلي)
    * Location (الموقع)
    * Status (online/offline) - مع مؤشر ملون
    * Last Sync (آخر مزامنة)
    * Created At
  - Status indicator ملون (أخضر = online، أحمر = offline)

- [ ] **3.2 Create/Edit Device Dialog**
  - نموذج إضافة جهاز جديد
  - نموذج تعديل جهاز موجود
  - الحقول:
    * name (الاسم)
    * ip_address (عنوان IP) - مع validation
    * port (المنفذ) - default 80
    * username (اسم المستخدم)
    * password (كلمة المرور)
    * device_type (نوع الجهاز)
    * model (الموديل)
    * serial_number (الرقم التسلسلي)
    * location (الموقع)
    * organization_id (المنظمة)
    * is_active (نشط/غير نشط)

- [ ] **3.3 Test Connection**
  - زر "اختبار الاتصال" في كل صف
  - عرض نتيجة الاختبار (نجح/فشل)
  - عرض تفاصيل الخطأ إذا فشل
  - Loading indicator أثناء الاختبار

- [ ] **3.4 Sync Employees to Device**
  - زر "مزامنة الموظفين" لكل جهاز
  - اختيار الموظفين المراد مزامنتهم
  - Progress bar أثناء المزامنة
  - عرض نتائج المزامنة (نجح/فشل لكل موظف)

- [ ] **3.5 Live Capture** (اختياري حسب الجهاز)
  - زر التقاط صورة مباشرة
  - عرض الصورة الملتقطة
  - حفظ الصورة كصورة الموظف
  - ملاحظة: ممكن يكون disabled للجهاز الحالي (DS-K1T344MX-E1)

**API Endpoints المتاحة:**
```
GET    /api/devices                    ✅
GET    /api/devices/:id                ✅
POST   /api/devices                    ✅
PUT    /api/devices/:id                ✅
DELETE /api/devices/:id                ✅
POST   /api/devices/:id/activate       ✅
POST   /api/devices/:id/deactivate     ✅
POST   /api/devices/:id/test-connection ✅
POST   /api/devices/:id/sync           ✅
POST   /api/devices/:id/live-capture/:employeeId ✅
GET    /api/devices/stats/overview     ✅
```

---

### **المرحلة 4: سجلات الدخول** 📊
**الأولوية:** 🟡 متوسطة  
**الموجود:** ⏳ صفحة placeholder  
**الباك ايند:** ⚠️ يحتاج تأكيد (ممكن موجود في القاعدة)

#### المطلوب:
- [ ] **4.1 Access Logs DataGrid**
  - عرض سجلات الدخول والخروج
  - الأعمدة:
    * Timestamp (التاريخ والوقت)
    * Employee Name (اسم الموظف)
    * Employee Number (رقم الموظف)
    * Device Name (اسم الجهاز)
    * Access Type (دخول/خروج)
    * Status (مسموح/مرفوض)
    * Photo (صورة مصغرة)
  - Server-side pagination
  - Real-time updates (اختياري)

- [ ] **4.2 Advanced Filters Panel**
  - **Date Range Filter:**
    * تاريخ من (Start Date)
    * تاريخ إلى (End Date)
    * Quick filters (اليوم، أمس، آخر 7 أيام، الشهر الحالي)
  - **Employee Filter:**
    * Autocomplete search
    * البحث بالاسم أو الرقم
  - **Device Filter:**
    * اختيار جهاز محدد
    * أو كل الأجهزة
  - **Access Type Filter:**
    * دخول (Entry)
    * خروج (Exit)
    * الكل
  - **Status Filter:**
    * مسموح (Granted)
    * مرفوض (Denied)
    * الكل
  - زر "تطبيق الفلاتر"
  - زر "إعادة تعيين"

- [ ] **4.3 Export Functionality**
  - تصدير إلى CSV
  - تصدير إلى Excel
  - تصدير إلى PDF
  - تطبيق الفلاتر على التصدير

- [ ] **4.4 Real-time Updates** (اختياري)
  - WebSocket connection
  - إضافة سجلات جديدة تلقائياً
  - إشعار صوتي عند دخول/خروج
  - تمييز السجلات الجديدة

- [ ] **4.5 Log Details Dialog**
  - عرض تفاصيل كاملة للسجل
  - صورة الموظف
  - صورة الدخول (إن وجدت)
  - معلومات الجهاز
  - الوقت بالضبط

**API Endpoints المطلوبة:**
```
GET    /api/access-logs                ⚠️ يحتاج إنشاء
GET    /api/access-logs/:id            ⚠️
GET    /api/access-logs/export         ⚠️
WebSocket: ws://localhost:3000/logs   ⚠️ (اختياري)
```

**ملاحظة:** قد نحتاج إنشاء endpoints للـ access logs في الباك ايند.

---

### **المرحلة 5: إدارة المستخدمين** 👤
**الأولوية:** 🟡 متوسطة  
**الموجود:** ⏳ صفحة placeholder  
**الباك ايند:** ✅ 9 endpoints جاهزة

#### المطلوب:
- [ ] **5.1 Users DataGrid**
  - عرض جميع المستخدمين
  - الأعمدة:
    * Full Name (الاسم الكامل)
    * Email (البريد الإلكتروني)
    * Role (الدور)
    * Organization (المنظمة)
    * Status (نشط/غير نشط)
    * Last Login (آخر تسجيل دخول)
    * Created At

- [ ] **5.2 Create/Edit User Dialog**
  - نموذج إضافة مستخدم جديد
  - نموذج تعديل مستخدم موجود
  - الحقول:
    * full_name (الاسم الكامل)
    * email (البريد الإلكتروني)
    * password (كلمة المرور) - للإضافة فقط
    * role (الدور):
      - super_admin (مدير النظام)
      - admin (مدير)
      - manager (مشرف)
      - operator (مشغل)
    * organization_id (المنظمة)
    * phone (الهاتف)
    * is_active (نشط/غير نشط)

- [ ] **5.3 Permissions Editor**
  - واجهة إدارة الصلاحيات المخصصة
  - Checkboxes للصلاحيات:
    * can_create_employees
    * can_edit_employees
    * can_delete_employees
    * can_manage_devices
    * can_view_logs
    * can_export_data
    * can_manage_users
    * can_manage_organizations
  - حفظ الصلاحيات

- [ ] **5.4 Change Password Dialog**
  - تغيير كلمة مرور المستخدم
  - الحقول:
    * New Password
    * Confirm Password
  - Password strength indicator
  - Validation

- [ ] **5.5 User Actions**
  - تفعيل مستخدم (Activate)
  - إلغاء تفعيل مستخدم (Deactivate)
  - حذف مستخدم (Soft delete with confirmation)
  - إعادة تعيين كلمة المرور

**API Endpoints المتاحة:**
```
GET    /api/users                  ✅
GET    /api/users/:id              ✅
POST   /api/users                  ✅
PUT    /api/users/:id              ✅
DELETE /api/users/:id              ✅
PUT    /api/users/:id/permissions  ✅
PUT    /api/users/:id/password     ✅
POST   /api/users/:id/activate     ✅
POST   /api/users/:id/deactivate   ✅
```

---

### **المرحلة 6: صفحة الإعدادات** ⚙️
**الأولوية:** 🟢 منخفضة  
**الموجود:** ⏳ صفحة placeholder  
**الباك ايند:** ✅ Auth endpoints جاهزة

#### المطلوب:
- [ ] **6.1 Profile Section**
  - عرض بيانات المستخدم الحالي
  - الاسم الكامل
  - البريد الإلكتروني
  - الدور
  - المنظمة
  - آخر تسجيل دخول

- [ ] **6.2 Change Password**
  - نموذج تغيير كلمة المرور
  - الحقول:
    * Current Password (كلمة المرور الحالية)
    * New Password (كلمة المرور الجديدة)
    * Confirm New Password
  - Password strength meter
  - Validation

- [ ] **6.3 Display Preferences** (اختياري)
  - اختيار اللغة (عربي/إنجليزي)
  - اختيار السمة (فاتح/داكن)
  - حجم الخط
  - عرض الجداول (rows per page default)

- [ ] **6.4 Notification Settings** (اختياري)
  - تفعيل/إلغاء الإشعارات
  - إشعارات البريد الإلكتروني
  - الإشعارات الصوتية
  - إشعارات الدخول/الخروج

- [ ] **6.5 System Information** (للمدير فقط)
  - نسخة النظام
  - معلومات الخادم
  - حالة قاعدة البيانات
  - حالة الأجهزة المتصلة

**API Endpoints المتاحة:**
```
GET    /api/auth/me               ✅
PUT    /api/auth/change-password  ✅
```

---

### **المرحلة 7: المكونات المشتركة** 🔧
**الأولوية:** 🔴 عالية (تستخدم في كل الصفحات)

#### المطلوب:
- [ ] **7.1 ConfirmDialog Component**
  - Dialog للتأكيد على العمليات الحساسة
  - استخدامات:
    * حذف موظف
    * حذف منظمة
    * حذف جهاز
    * حذف مستخدم
  - Props:
    * open (boolean)
    * title (string)
    * message (string)
    * onConfirm (function)
    * onCancel (function)
    * confirmText (string)
    * cancelText (string)
    * severity (error/warning/info)

- [ ] **7.2 Snackbar/Toast Notifications**
  - نظام إشعارات موحد
  - أنواع:
    * Success (نجاح)
    * Error (خطأ)
    * Warning (تحذير)
    * Info (معلومة)
  - Auto-hide بعد 5 ثواني
  - Close button
  - Queue system (عرض عدة إشعارات)

- [ ] **7.3 LoadingButton Component**
  - Button مع loading state
  - Spinner أثناء التحميل
  - Disabled أثناء التحميل
  - استخدامات:
    * Submit forms
    * Test connection
    * Sync devices

- [ ] **7.4 ImageUpload Component**
  - مكون موحد لرفع الصور
  - استخدامات:
    * صور الموظفين
    * شعارات المنظمات
  - Features:
    * Drag & Drop
    * Image preview
    * Crop functionality
    * File size validation
    * File type validation
    * Delete image

- [ ] **7.5 FormDialog Component**
  - قالب موحد للنماذج
  - Features:
    * Responsive dialog
    * Form validation
    * Loading state
    * Error handling
    * Success callback
    * Cancel callback
  - استخدامات:
    * Create/Edit Employee
    * Create/Edit Organization
    * Create/Edit Device
    * Create/Edit User

- [ ] **7.6 ErrorBoundary Component**
  - معالجة الأخطاء غير المتوقعة
  - عرض صفحة خطأ مناسبة
  - Log الأخطاء
  - Fallback UI

- [ ] **7.7 DataTable Component** (اختياري)
  - غلاف موحد حول MUI DataGrid
  - Features مشتركة:
    * Server-side pagination
    * Search
    * Filters
    * Export
    * Column visibility
  - تقليل التكرار في الكود

---

### **المرحلة 8: تحسينات Dashboard** 📈
**الأولوية:** 🟢 منخفضة (بعد إكمال الصفحات الأساسية)

#### المطلوب:
- [ ] **8.1 Advanced Statistics**
  - إضافة رسوم بيانية (Charts):
    * عدد الموظفين شهرياً (Line/Bar Chart)
    * توزيع الموظفين حسب المنظمة (Pie Chart)
    * معدلات الدخول/الخروج (Line Chart)
    * حالة الأجهزة (Donut Chart)
  - استخدام مكتبة: Recharts أو Chart.js

- [ ] **8.2 Recent Activities Widget**
  - عرض آخر النشاطات:
    * آخر الموظفين المضافين
    * آخر عمليات الدخول/الخروج
    * آخر الأجهزة المضافة
    * آخر المستخدمين النشطين
  - Limit: 10 items
  - مع timestamp

- [ ] **8.3 Quick Actions**
  - أزرار سريعة:
    * إضافة موظف
    * إضافة منظمة
    * إضافة جهاز
    * عرض السجلات
  - Floating Action Button (FAB)

- [ ] **8.4 System Health Dashboard**
  - حالة الأجهزة:
    * عدد الأجهزة المتصلة (Online)
    * عدد الأجهزة غير المتصلة (Offline)
    * آخر مزامنة
  - حالة قاعدة البيانات
  - استخدام الذاكرة (إن أمكن)
  - Uptime

- [ ] **8.5 Calendar View** (اختياري)
  - عرض تقويمي للإجازات
  - عرض أعياد رسمية
  - Attendance calendar

---

## � Project Setup (الخطوة الأولى)

قبل البدء بالتطوير، يجب إنشاء مشروع Vue 3 جديد:

### الخطوات:
1. **إنشاء مشروع Vue 3:**
   ```bash
   npm create vue@latest frontend-vue
   # اختيار:
   # ✅ Vue RVeeValidate** لإدارة النماذج والتحقق
- استخدام **VueQuery (@tanstack/vue-query)** لإدارة البيانات والـ cache
- استخدام **Axios** للطلبات مع interceptors للـ JWT
- استخدام **Vuetify 3** للمكونات (Material Design)
- دعم **RTL** للعربية في كل المكونات (مدمج في Vuetify)
- **Responsive Design** لجميع الصفحات
- **Composition API** مع `<script setup>` (Vue 3 style)
   ```

2. **تثبيت Vuetify:**
   ```bash
   npm install vuetify @mdi/font
   npm install -D vite-plugin-vuetify
   ```

3. **تثبيت باقي المكتبات:**
   ```bash
   npm install @tanstack/vue-query axios vee-validate
   npm install date-fns chart.js vue-chartjs
   npm install vue-advanced-cropper jquery
   ```

4. **نسخ Hikvision WebSDK:**
   - نسخ مجلد `demo/codebase` إلى `public/sdk/`
   - تضمين `webVideoCtrl.js` و `jsVideoPlugin-1.0.0.min.js`

5. **إعداد RTL و Arabic:**
   - تفعيل RTL في Vuetify
   - تحميل Cairo font
   - إعداد Arabic locale

---

## �📝 ملاحظات مهمة

### الأولويات:
1. **Priority 1 (عاجل):** المكونات المشتركة + إدارة الموظفين
2. **Priority 2 (مهم):** إدارة المنظمات + إدارة الأجهزة
3. **Priority 3 (عادي):** سجلات الدخول + إدارة المستخدمين
4. **Priority 4 (منخفض):** الإعدادات + تحسينات Dashboard

### اعتبارات فنية:
- استخدام **react-hook-form** لإدارة النماذج
- استخدام **TanStack Query** لإدارة البيانات والـ cache
- استخدام **Axios** للطلبات مع interceptors للـ JWT
- استخدام **Material-UI** للمكونات
- دعم **RTL** للعربية في كل المكونات
- **Responsive Design** لجميع الصفحات

### معايير الجودة:
- ✅ Error handling في كل API call
- ✅ Loading states لجميع العمليات
- ✅ Validation على جميع النماذج
- ✅ Success/Error notifications
- ✅ Confirmation dialogs للعمليات الحساسة
- ✅ Accessibility (a11y) considerations
- ✅ Performance optimization (pagination, lazy loading)

### نقاط تحتاج تأكيد:
⚠️ **Access Logs API** - يحتاج التحقق من وجود endpoints في الباك ايند  
⚠️ **Real-time Updates** - WebSocket implementation (اختياري)  
⚠️ **Live Face Capture** - قد لا يكون مدعوم على جهاز DS-K1T344MX-E1  
### Architecture Pattern:
```
src/
├── components/       # Reusable Vue components
│   ├── common/      # Dialogs, Buttons, etc.
│   └── layout/      # AppBar, Sidebar, Footer
├── views/           # Pages (Dashboard, Employees, etc.)
├── composables/     # Reusable logic (useAuth, useApi, etc.)
├── stores/          # Pinia stores
├── router/          # Vue Router config
├── plugins/         # Vuetify, VueQuery setup
├── utils/           # Helper functions
├── api/             # Axios instance & API calls
└── assets/          # Images, fonts, styles
```


---

## 🌟 ميزات متقدمة (Advanced Features)

> هذه الميزات ستُضاف بعد إكمال الوظائف الأساسية لجميع الأقسام

### 👥 قسم الموظفين (Employees Module)

#### 1. 📋 استيراد جماعي (Bulk Import)
- **الوصف:** رفع ملف Excel/CSV يحتوي على عشرات أو مئات الموظفين دفعة واحدة
- **الميزات:**
  - دعم تنسيقات: `.xlsx`, `.xls`, `.csv`
  - معاينة البيانات قبل الاستيراد (Preview)
  - التحقق من صحة البيانات (Validation)
  - معالجة الأخطاء وعرضها صف بصف
  - خيار تخطي السطور الخاطئة أو إلغاء العملية
  - تقرير نهائي: (X موظف تم إضافتهم، Y موظف فشل)
- **المكونات:**
  - `BulkImportDialog.vue` - حوار رفع الملف
  - `ImportPreviewTable.vue` - معاينة البيانات
  - `ImportResultsDialog.vue` - نتائج الاستيراد
- **الباك ايند:** يحتاج endpoint: `POST /api/employees/bulk-import`

#### 2. ✔️ عمليات جماعية (Bulk Actions)
- **الوصف:** تحديد عدة موظفين من الجدول وتنفيذ عملية واحدة عليهم
- **العمليات المدعومة:**
  - تفعيل/تعطيل جماعي (Bulk Activate/Deactivate)
  - حذف جماعي (Bulk Delete) مع تأكيد
  - نقل إلى قسم آخر (Bulk Move to Department)
  - تصدير المحددين فقط (Export Selected)
  - مزامنة مع أجهزة محددة (Sync to Devices)
- **المكونات:**
  - Checkbox في DataTable لتحديد الموظفين
  - شريط إجراءات علوي (Bulk Actions Toolbar)
  - Confirmation dialogs للعمليات الخطرة
- **الباك ايند:** يحتاج endpoints:
  - `POST /api/employees/bulk-activate`
  - `POST /api/employees/bulk-deactivate`
  - `DELETE /api/employees/bulk-delete`
  - `PATCH /api/employees/bulk-update`

#### 3. 📊 تقارير متقدمة (Advanced Reports)
- **الوصف:** توليد تقارير مفصلة ومخصصة عن الموظفين
- **أنواع التقارير:**
  - تقرير الحضور الشهري (Monthly Attendance Report)
  - تقرير الموظفين حسب القسم (Department Breakdown)
  - تقرير الموظفين النشطين/غير النشطين
  - تقرير الموظفين بدون بيانات بيومترية
  - تقارير مخصصة (Custom Filter Reports)
- **صيغ التصدير:**
  - PDF مع شعار المنظمة
  - Excel مع رسوم بيانية
  - CSV للتحليل الخارجي
- **المكونات:**
  - `ReportsDialog.vue` - اختيار نوع التقرير والفلاتر
  - `ReportPreview.vue` - معاينة قبل التنزيل
  - Print-friendly layouts
- **الباك ايند:** يحتاج endpoints:
  - `GET /api/reports/employees/attendance`
  - `GET /api/reports/employees/department`
  - `POST /api/reports/employees/custom`

#### 4. 🔐 صلاحيات الوصول (Access Permissions)
- **الوصف:** ربط الموظف بالأبواب والمناطق المسموح له بدخولها
- **الميزات:**
  - تحديد الأبواب المصرح للموظف بفتحها
  - تحديد الأوقات المسموح بها (Time-based access)
  - تحديد أيام الأسبوع (Weekday restrictions)
  - صلاحيات خاصة (VIP Access)
  - سجل تغييرات الصلاحيات (Audit Log)
- **المكونات:**
  - `AccessPermissionsDialog.vue` - إدارة صلاحيات الموظف
  - `DoorSelectionList.vue` - اختيار الأبواب بـ checkboxes
  - `TimeRangeSelector.vue` - تحديد الأوقات
- **الباك ايند:** موجود في:
  - `GET /api/employees/:id/access-permissions`
  - `PUT /api/employees/:id/access-permissions`

#### 5. ⏰ جداول العمل (Work Schedules)
- **الوصف:** تحديد أوقات العمل الرسمية لكل موظف أو قسم
- **الميزات:**
  - جداول ثابتة (9:00 AM - 5:00 PM)
  - جداول مرنة (Flexible hours)
  - ورديات (Shifts: صباحي، مسائي، ليلي)
  - أيام الراحة
  - الإجازات والعطل الرسمية
  - إشعارات التأخير والغياب
- **المكونات:**
  - `WorkScheduleDialog.vue` - تعيين جدول العمل
  - `ShiftCalendar.vue` - تقويم الورديات
  - `AttendanceRulesDialog.vue` - قواعد الحضور
- **الباك ايند:** يحتاج endpoints:
  - `GET /api/work-schedules`
  - `POST /api/work-schedules`
  - `PUT /api/employees/:id/work-schedule`

#### 6. 📱 QR Code للموظف (Employee QR Code)
- **الوصف:** توليد QR Code فريد لكل موظف للمسح السريع والتعرف
- **الميزات:**
  - QR Code يحتوي على: ID, Name, Employee No
  - إمكانية طباعة QR Code على البطاقة
  - مسح QR للوصول السريع لبيانات الموظف
  - QR للتسجيل في الأجهزة المحمولة
  - Export QR codes جماعي لجميع الموظفين
- **المكونات:**
  - استخدام مكتبة `qrcode.vue` أو `vue-qrcode-reader`
  - `QRCodeDisplay.vue` - عرض الـ QR
  - إضافة QR إلى `EmployeeCardDialog.vue`
- **الباك ايند:** 
  - توليد QR في الفرونت ايند (client-side)
  - أو endpoint: `GET /api/employees/:id/qr-code`

#### 7. 📸 إدارة الصور المتقدمة (Advanced Photo Management)
- **الوصف:** ميزات إضافية لإدارة صور الموظفين
- **الميزات:**
  - Crop & Resize قبل الرفع (Image Editor)
  - تحديد منطقة الوجه يدوياً
  - مكتبة صور (Photo Gallery) - تاريخ الصور
  - مقارنة الصور (Compare before/after)
  - Drag & Drop لرفع الصور
- **المكونات:**
  - `PhotoEditorDialog.vue` - محرر الصور
  - `PhotoGallery.vue` - معرض الصور
  - استخدام `vue-advanced-cropper`

#### 8. 📧 إشعارات وتنبيهات (Notifications & Alerts)
- **الوصف:** إرسال إشعارات للموظفين أو المشرفين
- **الميزات:**
  - إشعار عند إضافة موظف جديد
  - تنبيه عند انتهاء صلاحية البيانات البيومترية
  - تذكير بتحديث البيانات
  - إشعارات البريد الإلكتروني (Email notifications)
  - إشعارات SMS (اختياري)
- **المكونات:**
  - `NotificationCenter.vue`
  - Bell icon مع عداد في AppBar
- **الباك ايند:** موجود جزئياً في:
  - `GET /api/notifications`
  - `POST /api/notifications/send`

---

## 🚀 خطة التنفيذ المقترحة

### الأسبوع 1-2:
- [ ] المكونات المشتركة (Dialogs, Notifications, etc.)
- [ ] إدارة الموظفين - Create/Edit Dialog
- [ ] إدارة الموظفين - Photo Upload

### الأسبوع 3-4:
- [ ] إدارة المنظمات - صفحة كاملة
- [ ] إدارة المنظمات - Logo Upload & Stats

### الأسبوع 5-6:
- [ ] إدارة الأجهزة - صفحة كاملة
- [ ] إدارة الأجهزة - Test Connection & Sync

### الأسبوع 7:
- [ ] سجلات الدخول - صفحة كاملة
- [ ] التحقق من Access Logs API

### الأسبوع 8:
- [ ] إدارة المستخدمين - صفحة كاملة
- [ ] إدارة المستخدمين - Permissions

### الأسبوع 9:
- [ ] صفحة الإعدادات
- [ ] تحسينات Dashboard

### الأسبوع 10:
- [ ] Testing شامل
- [ ] Bug fixes
- [ ] Documentation

---

## 📞 للتواصل والاستفسارات
- يمكن تعديل هذا الملف حسب الحاجة
- إضافة ميزات جديدة
- تغيير الأولويات
- تحديث الحالة

---

## ✅ سجل التحديثات (Change Log)

### 9 فبراير 2026
- ✅ **إضافة قسم "ميزات متقدمة"** - 8 ميزات للموظفين
  - استيراد جماعي (Bulk Import)
  - عمليات جماعية (Bulk Actions)
  - تقارير متقدمة (Advanced Reports)
  - صلاحيات الوصول (Access Permissions)
  - جداول العمل (Work Schedules)
  - QR Code للموظف
  - إدارة الصور المتقدمة
  - إشعارات وتنبيهات

### 8 فبراير 2026
- ✅ إنشاء الملف الأولي
- ✅ تحديد التقنيات المستخدمة
- ✅ وضع خطة التنفيذ الأولية

**آخر تحديث:** 9 فبراير 2026
