# مراحل التطوير - خارطة الطريق بالأولويات

## نظرة عامة
هذا الملف يحدد جميع مراحل تطوير نظام HikVision Access Control System مع تقييم الأهمية لكل مرحلة على مقياس من 10.

تم إنشاء هذا التقييم في: **5 فبراير 2026**

---

## 🔴 المرحلة 1: طبقة Middleware وإعداد Express (أولوية: 10/10) ⭐⭐⭐⭐⭐

### **لماذا هذه المرحلة حاسمة؟**
هذه هي الأساس لكل شيء! بدون Middleware صحيح، ما نقدر نسوي:
- حماية من الهجمات
- معالجة الأخطاء بشكل احترافي
- تسجيل العمليات (Logging)
- التحقق من صحة البيانات

### **الملفات المطلوبة:**
```
src/
├── middlewares/
│   ├── errorHandler.js        # معالج الأخطاء العام
│   ├── asyncHandler.js         # للتعامل مع async/await
│   ├── auth.js                 # التحقق من JWT token
│   ├── authorize.js            # التحقق من الصلاحيات
│   ├── validate.js             # التحقق من صحة البيانات
│   ├── logger.js               # تسجيل الطلبات HTTP
│   ├── rateLimiter.js          # الحماية من الطلبات الكثيرة
│   └── index.js                # تصدير شامل
├── app.js                      # إعداد Express
└── server.js                   # تشغيل السيرفر
```

### **المميزات المطلوبة:**

#### **1. Error Handler Middleware:**
- معالجة أخطاء Sequelize (ValidationError, UniqueConstraintError)
- معالجة أخطاء JWT (JsonWebTokenError, TokenExpiredError)
- معالجة 404 Not Found
- إرجاع response موحد للأخطاء
- عدم كشف تفاصيل الأخطاء في production

#### **2. Auth Middleware:**
- استخراج token من header
- التحقق من صحة token باستخدام jwt.verifyToken()
- تحميل بيانات المستخدم من database
- إضافة req.user للطلب
- معالجة حالات: token منتهي، token غير صالح، user محذوف

#### **3. Authorize Middleware:**
- التحقق من role المستخدم
- التحقق من custom_permissions
- دعم multiple roles: `authorize(['super_admin', 'admin'])`
- دعم permissions محددة: `authorize([], ['users.create'])`

#### **4. Validate Middleware:**
- استخدام Joi أو express-validator
- التحقق من body, params, query
- رسائل خطأ واضحة بالعربي والإنجليزي
- sanitization للبيانات

#### **5. Rate Limiter:**
- حد أقصى للطلبات بالدقيقة (من .env)
- حدود مختلفة حسب endpoint:
  - Login: 5 محاولات/15 دقيقة
  - API عام: 100 طلب/دقيقة
  - Upload files: 10 طلبات/دقيقة

#### **6. Logger Middleware:**
- تسجيل كل طلب HTTP
- Method, URL, Status Code, Response Time
- IP Address, User Agent
- User ID (إذا مسجل دخول)
- استخدام utils/logger.js الموجود

#### **7. Express App Setup (app.js):**
```javascript
// المميزات المطلوبة:
- helmet() للأمان
- cors() مع إعدادات من .env
- express.json() و express.urlencoded()
- morgan أو custom logger
- تسجيل جميع middlewares
- تسجيل routes
- error handler في النهاية
```

#### **8. Server Setup (server.js):**
```javascript
// المميزات المطلوبة:
- استيراد app من app.js
- الاستماع على PORT من .env
- معالجة SIGTERM و SIGINT
- graceful shutdown
- اتصال database قبل التشغيل
```

### **معايير النجاح:**
- ✅ السيرفر يشتغل على localhost:3000
- ✅ جميع middlewares تعمل بشكل صحيح
- ✅ معالجة الأخطاء تعمل بشكل احترافي
- ✅ Rate limiting يحمي من الهجمات
- ✅ Logging يسجل كل العمليات
- ✅ CORS يسمح للـ frontend بالاتصال

---

## 🔴 المرحلة 2: نظام المصادقة (Authentication System) (أولوية: 10/10) ⭐⭐⭐⭐⭐

### **لماذا هذه المرحلة حاسمة؟**
بدون نظام مصادقة، النظام مفتوح للجميع! هذه المرحلة تحمي كل شيء.

### **الملفات المطلوبة:**
```
src/
├── controllers/
│   └── authController.js       # معالجات طلبات المصادقة
├── services/
│   └── authService.js          # منطق الأعمال للمصادقة
├── routes/
│   └── authRoutes.js           # مسارات API
└── validators/
    └── authValidator.js        # التحقق من البيانات
```

### **API Endpoints المطلوبة:**

#### **1. POST /api/auth/register** (اختياري - للتسجيل الذاتي)
```javascript
// Request Body:
{
  "email": "user@example.com",
  "password": "Password@123",
  "first_name": "أحمد",
  "last_name": "محمد",
  "organization_id": 1
}

// Response:
{
  "success": true,
  "data": {
    "user": { id, email, role, ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### **2. POST /api/auth/login** (أساسي)
```javascript
// Request Body:
{
  "email": "admin@demo.test",
  "password": "Admin@123"
}

// Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@demo.test",
      "first_name": "Super",
      "last_name": "Admin",
      "role": "super_admin",
      "organization": { name: "شركة النظام التجريبية" }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}

// Errors:
- 401: Invalid credentials
- 403: Account is inactive
- 429: Too many login attempts
```

**المنطق المطلوب:**
1. التحقق من البيانات (email format, password not empty)
2. البحث عن المستخدم في database
3. التحقق من is_active = true
4. مقارنة password باستخدام bcrypt.comparePassword()
5. إنشاء access token و refresh token
6. تحديث last_login_at
7. تسجيل في audit_logs
8. إرجاع بيانات المستخدم + tokens

#### **3. POST /api/auth/logout** (أساسي)
```javascript
// Headers:
Authorization: Bearer {accessToken}

// Response:
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

**المنطق المطلوب:**
1. إضافة token إلى blacklist (Redis أو database table)
2. تسجيل في audit_logs
3. حذف refresh token من database (إذا مخزن)

#### **4. POST /api/auth/refresh-token** (أساسي)
```javascript
// Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**المنطق المطلوب:**
1. التحقق من صحة refresh token
2. استخراج user_id من token
3. التحقق أن المستخدم ما زال موجود و active
4. إنشاء access token جديد
5. إنشاء refresh token جديد (optional)
6. إرجاع tokens جديدة

#### **5. GET /api/auth/me** (أساسي)
```javascript
// Headers:
Authorization: Bearer {accessToken}

// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@demo.test",
    "first_name": "Super",
    "last_name": "Admin",
    "role": "super_admin",
    "custom_permissions": ["all"],
    "organization": {
      "id": 1,
      "name": "شركة النظام التجريبية",
      "subscription_type": "pro"
    }
  }
}
```

**المنطق المطلوب:**
1. استخدام auth middleware
2. إرجاع req.user مع organization

#### **6. POST /api/auth/forgot-password** (مهم)
```javascript
// Request Body:
{
  "email": "user@example.com"
}

// Response:
{
  "success": true,
  "message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
}
```

**المنطق المطلوب:**
1. البحث عن email في database
2. إنشاء reset token (crypto.randomBytes)
3. حفظ reset_token_hash و reset_token_expires_at في users table
4. إرسال email مع الرابط (استخدام nodemailer)
5. تسجيل في audit_logs

#### **7. POST /api/auth/reset-password** (مهم)
```javascript
// Request Body:
{
  "token": "abc123...",
  "newPassword": "NewPassword@123"
}

// Response:
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

**المنطق المطلوب:**
1. التحقق من token hash في database
2. التحقق أن token لم ينتهي (reset_token_expires_at)
3. التحقق من قوة password الجديدة
4. hash password باستخدام bcrypt
5. تحديث password في database
6. حذف reset_token و reset_token_expires_at
7. إبطال جميع tokens الحالية (optional)
8. تسجيل في audit_logs

#### **8. POST /api/auth/change-password** (للمستخدم المسجل دخول)
```javascript
// Headers:
Authorization: Bearer {accessToken}

// Request Body:
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}

// Response:
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

**المنطق المطلوب:**
1. التحقق من currentPassword باستخدام bcrypt
2. التحقق من قوة newPassword
3. تحديث password
4. إبطال جميع tokens الحالية (security)
5. تسجيل في audit_logs

### **Security Features المطلوبة:**
- ✅ Rate limiting على login (5 محاولات/15 دقيقة)
- ✅ Password complexity validation
- ✅ Bcrypt hashing (10 rounds من .env)
- ✅ JWT tokens آمنة
- ✅ HttpOnly cookies للـ refresh token (optional)
- ✅ Token blacklist بعد logout
- ✅ Reset token expiration (1 ساعة)
- ✅ Audit logging لكل عملية

### **معايير النجاح:**
- ✅ Login يعمل مع الحسابات من seeders
- ✅ Token verification يعمل بشكل صحيح
- ✅ Refresh token يجدد access token
- ✅ Password reset يعمل بالكامل
- ✅ Rate limiting يحمي من brute force
- ✅ جميع العمليات مسجلة في audit_logs

---

## 🟡 المرحلة 3: إدارة المستخدمين (Users Management API) (أولوية: 9/10) ⭐⭐⭐⭐

### **لماذا هذه المرحلة مهمة جداً؟**
المستخدمون هم من يديرون النظام! بدون إدارة مستخدمين، ما نقدر نضيف admins أو نعدل صلاحيات.

### **الملفات المطلوبة:**
```
src/
├── controllers/
│   └── userController.js
├── services/
│   └── userService.js
├── routes/
│   └── userRoutes.js
└── validators/
    └── userValidator.js
```

### **API Endpoints المطلوبة:**

#### **1. GET /api/users** (عرض جميع المستخدمين)
```javascript
// Query Parameters:
?page=1&limit=10&search=ahmed&role=admin&is_active=true&sort=-created_at

// Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@demo.test",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "super_admin",
        "is_active": true,
        "last_login_at": "2026-02-05T10:30:00Z",
        "created_at": "2026-02-04T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**المنطق المطلوب:**
- Pagination (page, limit من query)
- Search في email, first_name, last_name
- Filter حسب role, is_active, organization_id
- Sort حسب أي عمود (+field للتصاعدي، -field للتنازلي)
- Authorization: super_admin يشوف الكل، admin يشوف organization حقته فقط

#### **2. GET /api/users/:id** (عرض مستخدم واحد)
```javascript
// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@demo.test",
    "first_name": "Super",
    "last_name": "Admin",
    "role": "super_admin",
    "custom_permissions": ["all"],
    "phone": "+964XXXXXXXXXX",
    "is_active": true,
    "last_login_at": "2026-02-05T10:30:00Z",
    "organization": {
      "id": 1,
      "name": "شركة النظام التجريبية"
    },
    "created_at": "2026-02-04T12:00:00Z",
    "updated_at": "2026-02-05T08:00:00Z"
  }
}
```

**المنطق المطلوب:**
- التحقق أن المستخدم موجود (404 إذا لا)
- Authorization: super_admin يشوف أي user، admin يشوف users من organization حقته فقط
- إرجاع كل البيانات ما عدا password و reset_token

#### **3. POST /api/users** (إنشاء مستخدم جديد)
```javascript
// Request Body:
{
  "email": "newuser@example.com",
  "password": "Password@123",
  "first_name": "أحمد",
  "last_name": "محمد",
  "role": "viewer",
  "custom_permissions": ["devices.view", "employees.view"],
  "phone": "+9647XXXXXXXXX",
  "organization_id": 1
}

// Response:
{
  "success": true,
  "data": {
    "id": 4,
    "email": "newuser@example.com",
    "first_name": "أحمد",
    "last_name": "محمد",
    "role": "viewer",
    "is_active": true,
    "organization_id": 1,
    "created_at": "2026-02-05T11:00:00Z"
  }
}
```

**المنطق المطلوب:**
- Validation: email unique، password قوي، role صحيح
- Hash password باستخدام bcrypt
- Authorization: super_admin و admin فقط
- admin لا يمكنه إنشاء super_admin
- admin يمكنه فقط إنشاء users في organization حقه
- إرسال email ترحيبي (optional)
- تسجيل في audit_logs

#### **4. PUT /api/users/:id** (تحديث مستخدم)
```javascript
// Request Body:
{
  "first_name": "أحمد المحدث",
  "phone": "+9647XXXXXXXXX",
  "role": "manager",
  "custom_permissions": ["devices.edit"],
  "is_active": false
}

// Response:
{
  "success": true,
  "data": {
    "id": 4,
    "email": "newuser@example.com",
    "first_name": "أحمد المحدث",
    "role": "manager",
    "is_active": false,
    "updated_at": "2026-02-05T11:30:00Z"
  }
}
```

**المنطق المطلوب:**
- لا يمكن تحديث email (منع تغيير البريد)
- لا يمكن تحديث password (له endpoint منفصل)
- Authorization: super_admin يحدث أي user، admin يحدث users من organization حقته فقط
- admin لا يمكنه تعديل super_admin
- المستخدم لا يمكنه تعديل role أو permissions الخاص به
- تسجيل في audit_logs

#### **5. DELETE /api/users/:id** (حذف مستخدم)
```javascript
// Response:
{
  "success": true,
  "message": "تم حذف المستخدم بنجاح"
}
```

**المنطق المطلوب:**
- Soft delete (is_active = false) بدلاً من hard delete
- Authorization: super_admin و admin فقط
- admin لا يمكنه حذف super_admin
- المستخدم لا يمكنه حذف نفسه
- تسجيل في audit_logs

#### **6. POST /api/users/:id/activate** (تفعيل مستخدم)
```javascript
// Response:
{
  "success": true,
  "message": "تم تفعيل المستخدم بنجاح"
}
```

#### **7. POST /api/users/:id/deactivate** (تعطيل مستخدم)
```javascript
// Response:
{
  "success": true,
  "message": "تم تعطيل المستخدم بنجاح"
}
```

#### **8. PUT /api/users/:id/permissions** (تحديث الصلاحيات)
```javascript
// Request Body:
{
  "custom_permissions": [
    "devices.view",
    "devices.edit",
    "employees.view",
    "reports.view"
  ]
}

// Response:
{
  "success": true,
  "data": {
    "id": 4,
    "custom_permissions": ["devices.view", "devices.edit", ...],
    "updated_at": "2026-02-05T12:00:00Z"
  }
}
```

**المنطق المطلوب:**
- التحقق أن جميع permissions صحيحة
- Authorization: super_admin و admin فقط
- تسجيل في audit_logs

### **Permissions System:**
استخدام custom_permissions (JSONB array) لصلاحيات دقيقة:
```javascript
const permissions = [
  // Users
  'users.view', 'users.create', 'users.edit', 'users.delete',
  
  // Employees
  'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
  
  // Devices
  'devices.view', 'devices.create', 'devices.edit', 'devices.delete',
  
  // Access
  'access.view', 'access.edit',
  
  // Reports
  'reports.view', 'reports.export',
  
  // Settings
  'settings.view', 'settings.edit',
  
  // Special
  'all' // super_admin فقط
];
```

### **معايير النجاح:**
- ✅ CRUD كامل للمستخدمين
- ✅ Pagination و filtering يعملون بشكل صحيح
- ✅ Authorization حسب role و organization
- ✅ Permissions system محكم
- ✅ Validation شامل
- ✅ Audit logging لكل عملية

---

## 🟡 المرحلة 4: إدارة الموظفين (Employees Management API) (أولوية: 9/10) ⭐⭐⭐⭐

### **لماذا هذه المرحلة مهمة جداً؟**
الموظفين = قلب النظام! إدارة الموظفين أساسية لـ:
- ربط بيانات الحضور
- إدارة البصمات والكروت
- جدولة الدوام
- صلاحيات الدخول

### **الملفات المطلوبة:**
```
src/
├── controllers/
│   └── employeeController.js
├── services/
│   └── employeeService.js
├── routes/
│   └── employeeRoutes.js
└── validators/
    └── employeeValidator.js
```

### **API Endpoints المطلوبة:**

#### **1. GET /api/employees** (عرض جميع الموظفين)
```javascript
// Query Parameters:
?page=1&limit=20&search=أحمد&department=IT&is_active=true&sort=-hire_date

// Response:
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "employee_no": "EMP001",
        "first_name": "أحمد",
        "last_name": "محمد",
        "department": "IT",
        "position": "مطور",
        "is_active": true,
        "hire_date": "2025-01-01",
        "has_face": true,
        "has_card": false,
        "has_fingerprint": true,
        "created_at": "2026-02-01T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

**المنطق المطلوب:**
- Pagination + Search (في employee_no, first_name, last_name)
- Filter حسب department, position, is_active, organization_id
- Sort حسب أي عمود
- عرض إحصائيات: has_face, has_card, has_fingerprint (من علاقات)

#### **2. GET /api/employees/:id** (عرض موظف واحد)
```javascript
// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "employee_no": "EMP001",
    "first_name": "أحمد",
    "last_name": "محمد",
    "email": "employee@example.com",
    "phone": "+9647XXXXXXXXX",
    "department": "IT",
    "position": "مطور",
    "hire_date": "2025-01-01",
    "is_active": true,
    "organization": {
      "id": 1,
      "name": "شركة النظام التجريبية"
    },
    "face_templates": [
      {
        "id": 1,
        "template_data": "...",
        "quality_score": 95,
        "is_synced": true,
        "created_at": "2026-02-01T10:30:00Z"
      }
    ],
    "card_templates": [],
    "fingerprint_templates": [
      {
        "id": 1,
        "finger_number": 1,
        "is_synced": true
      }
    ],
    "work_schedule": {
      "id": 1,
      "name": "دوام رسمي",
      "start_time": "08:00:00",
      "end_time": "16:00:00"
    },
    "access_permissions": [
      {
        "door": {
          "id": 1,
          "name": "الباب الرئيسي"
        },
        "access_timezone": {
          "name": "ساعات العمل الرسمية"
        }
      }
    ],
    "created_at": "2026-02-01T10:00:00Z",
    "updated_at": "2026-02-05T09:00:00Z"
  }
}
```

**المنطق المطلوب:**
- جلب الموظف مع جميع العلاقات (include: FaceTemplate, CardTemplate, etc.)
- Authorization: users من نفس organization فقط

#### **3. POST /api/employees** (إضافة موظف جديد)
```javascript
// Request Body:
{
  "employee_no": "EMP002",
  "first_name": "علي",
  "last_name": "حسن",
  "email": "ali@example.com",
  "phone": "+9647XXXXXXXXX",
  "department": "HR",
  "position": "مدير الموارد البشرية",
  "hire_date": "2026-02-01",
  "is_active": true,
  "organization_id": 1
}

// Response:
{
  "success": true,
  "data": {
    "id": 2,
    "employee_no": "EMP002",
    "first_name": "علي",
    "last_name": "حسن",
    ...
  }
}
```

**المنطق المطلوب:**
- Validation: employee_no فريد ضمن organization
- email فريد (إذا موجود)
- phone validation (صيغة عراقية)
- organization_id من المستخدم المسجل (إلا إذا super_admin)
- تسجيل في audit_logs

#### **4. PUT /api/employees/:id** (تحديث موظف)
```javascript
// Request Body:
{
  "department": "Finance",
  "position": "محاسب",
  "phone": "+9647XXXXXXXXX"
}

// Response:
{
  "success": true,
  "data": { ... }
}
```

**المنطق المطلوب:**
- لا يمكن تحديث employee_no (رقم ثابت)
- Authorization: نفس organization
- تسجيل في audit_logs

#### **5. DELETE /api/employees/:id** (حذف موظف)
```javascript
// Response:
{
  "success": true,
  "message": "تم حذف الموظف بنجاح"
}
```

**المنطق المطلوب:**
- قبل الحذف: حذف جميع face/card/fingerprint templates
- حذف access_permissions
- حذف employee_schedules
- Soft delete (is_active = false) أو Hard delete
- تسجيل في audit_logs

#### **6. POST /api/employees/:id/face** (إضافة بصمة وجه)
```javascript
// Request Body (multipart/form-data):
{
  "image": File (JPG/PNG),
  "quality_score": 95
}

// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "template_data": "base64...",
    "quality_score": 95,
    "is_synced": false,
    "created_at": "2026-02-05T13:00:00Z"
  }
}
```

**المنطق المطلوب:**
- معالجة الصورة (resize, compress باستخدام sharp)
- استخراج features (أو حفظ base64 للمعالجة لاحقاً)
- حفظ في database
- sync مع devices (في background job)
- تسجيل في audit_logs

#### **7. POST /api/employees/:id/card** (إضافة كرت)
```javascript
// Request Body:
{
  "card_type": "rfid",
  "card_number": "1234567890",
  "facility_code": "001"
}

// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "card_type": "rfid",
    "card_number": "1234567890",
    "is_synced": false
  }
}
```

#### **8. POST /api/employees/:id/fingerprint** (إضافة بصمة إصبع)
```javascript
// Request Body:
{
  "finger_number": 1,
  "template_data": "base64..."
}

// Response:
{
  "success": true,
  "data": {
    "id": 1,
    "finger_number": 1,
    "is_synced": false
  }
}
```

#### **9. POST /api/employees/:id/assign-schedule** (تعيين جدول عمل)
```javascript
// Request Body:
{
  "work_schedule_id": 1,
  "start_date": "2026-02-01",
  "end_date": null  // null = دائم
}
```

#### **10. POST /api/employees/:id/grant-access** (منح صلاحية دخول)
```javascript
// Request Body:
{
  "door_id": 1,
  "access_timezone_id": 1,
  "requires_pin": false,
  "pin_code": null,
  "valid_from": "2026-02-01",
  "valid_until": "2026-12-31"
}
```

#### **11. GET /api/employees/:id/attendance** (سجل الحضور)
```javascript
// Query: ?start_date=2026-02-01&end_date=2026-02-28

// Response:
{
  "success": true,
  "data": {
    "attendance_logs": [ ... ],
    "summary": {
      "total_days": 20,
      "present_days": 18,
      "late_days": 3,
      "total_hours": 144.5
    }
  }
}
```

### **Features إضافية:**
- 📸 **Face Recognition Quality Check**: رفض الصور ذات الجودة المنخفضة
- 🔄 **Auto-sync with HikVision Devices**: مزامنة البصمات تلقائياً
- 📊 **Employee Statistics**: عدد الحضور، التأخير، الساعات
- 📤 **Bulk Import/Export**: استيراد/تصدير موظفين من Excel
- 🔔 **Notifications**: إشعار عند إضافة/تعديل موظف

### **معايير النجاح:**
- ✅ CRUD كامل للموظفين
- ✅ إدارة البصمات (وجه، كرت، إصبع)
- ✅ تعيين جداول العمل
- ✅ منح صلاحيات الدخول
- ✅ عرض سجل الحضور
- ✅ Validation شامل (employee_no فريد، email، phone)

---

## 🟠 المرحلة 5: إدارة الأجهزة (Devices Management API) (أولوية: 8/10) ⭐⭐⭐

### **لماذا هذه المرحلة مهمة؟**
الأجهزة هي واجهة النظام مع العالم الحقيقي! بدونها، النظام مجرد قاعدة بيانات.

### **الملفات المطلوبة:**
```
src/
├── controllers/
│   └── deviceController.js
├── services/
│   ├── deviceService.js
│   └── hikvisionService.js      # التواصل مع HikVision SDK
├── routes/
│   └── deviceRoutes.js
└── validators/
    └── deviceValidator.js
```

### **API Endpoints المطلوبة:**

#### **1. GET /api/devices** (عرض جميع الأجهزة)
```javascript
// Query: ?type=face_recognition&status=online&sort=-created_at

// Response:
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": 1,
        "name": "جهاز الباب الرئيسي",
        "device_type": "face_recognition",
        "serial_number": "DS-K1T671TM...",
        "ip_address": "192.168.1.100",
        "status": "online",
        "last_online_at": "2026-02-05T14:00:00Z",
        "doors_count": 1,
        "employees_count": 50
      }
    ],
    "pagination": { ... }
  }
}
```

#### **2. POST /api/devices** (إضافة جهاز جديد)
```javascript
// Request Body:
{
  "name": "جهاز الطابق الثاني",
  "device_type": "face_recognition",
  "serial_number": "DS-K1T671TMxxxxxxxxx",
  "ip_address": "192.168.1.101",
  "port": 8000,
  "username": "admin",
  "password": "Admin@123",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "organization_id": 1
}

// Response:
{
  "success": true,
  "data": {
    "id": 2,
    "name": "جهاز الطابق الثاني",
    "status": "pending",  // سيتحول إلى online بعد الاتصال
    ...
  }
}
```

**المنطق المطلوب:**
- Validation: IP address، MAC address، serial_number فريد
- اختبار الاتصال بالجهاز (HikVision SDK)
- جلب معلومات الجهاز (model, firmware_version)
- حفظ في database
- تسجيل في audit_logs

#### **3. POST /api/devices/:id/test-connection** (اختبار الاتصال)
```javascript
// Response:
{
  "success": true,
  "data": {
    "status": "online",
    "response_time": 45,  // ms
    "device_info": {
      "model": "DS-K1T671TM",
      "firmware_version": "V2.3.0",
      "capacity": {
        "faces": 3000,
        "cards": 5000,
        "fingerprints": 3000
      }
    }
  }
}
```

#### **4. POST /api/devices/:id/sync-employees** (مزامنة الموظفين)
```javascript
// Request Body (optional):
{
  "employee_ids": [1, 2, 3]  // إذا فارغ، يزامن الكل
}

// Response:
{
  "success": true,
  "data": {
    "synced": 45,
    "failed": 2,
    "total": 47,
    "failed_employees": [
      {
        "employee_id": 5,
        "reason": "Quality score too low"
      }
    ]
  }
}
```

**المنطق المطلوب:**
- جلب موظفين مع البصمات
- إرسال إلى device عبر HikVision SDK
- تحديث is_synced = true في face/card/fingerprint_templates
- معالجة الأخطاء (device offline، template invalid)

#### **5. POST /api/devices/:id/open-door** (فتح الباب يدوياً)
```javascript
// Request Body:
{
  "door_number": 1  // للأجهزة متعددة الأبواب
}

// Response:
{
  "success": true,
  "message": "تم فتح الباب بنجاح"
}
```

#### **6. GET /api/devices/:id/logs** (سجلات الجهاز)
```javascript
// Query: ?start_date=2026-02-01&limit=100

// Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "event_time": "2026-02-05T08:15:00Z",
        "event_type": "face_recognized",
        "employee_no": "EMP001",
        "employee_name": "أحمد محمد",
        "door_number": 1,
        "result": "success"
      }
    ]
  }
}
```

**المنطق المطلوب:**
- جلب logs من device (HikVision SDK)
- أو من attendance_logs في database

#### **7. POST /api/devices/:id/reboot** (إعادة تشغيل)
#### **8. PUT /api/devices/:id/settings** (تحديث إعدادات)
#### **9. DELETE /api/devices/:id** (حذف جهاز)

### **HikVision SDK Integration:**
```javascript
// src/services/hikvisionService.js

class HikvisionService {
  // اتصال بالجهاز
  async connect(ipAddress, port, username, password) { ... }
  
  // جلب معلومات الجهاز
  async getDeviceInfo(deviceId) { ... }
  
  // إضافة موظف
  async addFaceTemplate(deviceId, employeeNo, templateData) { ... }
  async addCardTemplate(deviceId, employeeNo, cardNumber) { ... }
  async addFingerprintTemplate(deviceId, employeeNo, fingerData) { ... }
  
  // حذف موظف
  async deletePerson(deviceId, employeeNo) { ... }
  
  // فتح الباب
  async openDoor(deviceId, doorNumber) { ... }
  
  // جلب السجلات
  async getAttendanceLogs(deviceId, startDate, endDate) { ... }
  
  // إعادة تشغيل
  async reboot(deviceId) { ... }
}
```

### **معايير النجاح:**
- ✅ إضافة وإدارة أجهزة HikVision
- ✅ اختبار الاتصال بالأجهزة
- ✅ مزامنة الموظفين والبصمات
- ✅ فتح الأبواب يدوياً
- ✅ جلب السجلات من الأجهزة
- ✅ معالجة أخطاء الاتصال

---

## 🟠 المرحلة 6: صلاحيات الدخول (Access Permissions API) (أولوية: 8/10) ⭐⭐⭐

### **نطاق العمل:**
- إدارة الأبواب (Doors CRUD)
- منح/سحب صلاحيات الدخول للموظفين
- إدارة Access Timezones (أوقات السماح)
- التحقق من الصلاحيات عند الدخول

### **API Endpoints الرئيسية:**
- `GET/POST/PUT/DELETE /api/doors`
- `GET/POST/PUT/DELETE /api/access-timezones`
- `POST /api/access-permissions` - منح صلاحية
- `DELETE /api/access-permissions/:id` - سحب صلاحية
- `GET /api/employees/:id/access-permissions` - عرض صلاحيات موظف
- `POST /api/access-permissions/check` - التحقق من صلاحية الدخول

---

## 🟡 المرحلة 7: نظام الحضور (Attendance System API) (أولوية: 7/10) ⭐⭐⭐

### **نطاق العمل:**
- استقبال سجلات الحضور من الأجهزة
- حساب ساعات العمل تلقائياً
- إنشاء attendance_summaries يومية
- تحديد الحالة (on_time, late, early_departure, absent)

### **API Endpoints الرئيسية:**
- `GET /api/attendance` - سجلات الحضور (مع filters قوية)
- `GET /api/attendance/summary` - الملخصات اليومية
- `POST /api/attendance/manual` - تسجيل حضور يدوي
- `GET /api/attendance/statistics` - إحصائيات (تأخير، غياب، إلخ)

---

## 🟡 المرحلة 8: جداول العمل والأوقات (Work Schedules API) (أولوية: 7/10) ⭐⭐⭐

### **نطاق العمل:**
- إدارة جداول العمل (Work Schedules CRUD)
- تعيين جداول للموظفين
- دعم جداول مؤقتة (start_date → end_date)
- إدارة أيام العمل (work_days array)

### **API Endpoints الرئيسية:**
- `GET/POST/PUT/DELETE /api/work-schedules`
- `POST /api/employees/:id/assign-schedule`
- `GET /api/employees/:id/schedule-history`

---

## 🟢 المرحلة 9: التقارير والإحصائيات (Reports & Analytics) (أولوية: 6/10) ⭐⭐

### **نطاق العمل:**
- تقرير الحضور الشهري
- تقرير التأخير
- تقرير ساعات العمل
- تقرير الأجهزة (حالة، logs)
- تصدير Excel/PDF

---

## 🟢 المرحلة 10: نظام الإشعارات (Notifications System) (أولوية: 6/10) ⭐⭐

### **نطاق العمل:**
- إنشاء إشعارات
- إرسال عبر Socket.io (real-time)
- إرسال عبر Email (optional)
- أنواع: access_denied, device_offline, low_battery، إلخ

---

## 🟢 المرحلة 11: سجلات المراجعة (Audit Logs API) (أولوية: 6/10) ⭐⭐

### **نطاق العمل:**
- تسجيل جميع العمليات الحساسة
- عرض سجلات المراجعة (مع filters)
- لا يمكن التعديل أو الحذف (append-only)

---

## 🔵 المرحلة 12: إعدادات النظام (System Settings API) (أولوية: 5/10) ⭐

### **نطاق العمل:**
- إدارة إعدادات Organization
- JSONB values (مرن لأي نوع)
- إعدادات عامة (language, timezone, currency)

---

## 🔵 المرحلة 13: الميزات الزمنية الفعلية (Real-time Features) (أولوية: 5/10) ⭐

### **نطاق العمل:**
- Socket.io للإشعارات الفورية
- تحديثات الحضور live
- Push events من الأجهزة

---

## 🟣 المرحلة 14: الميزات المتقدمة (Advanced Features) (أولوية: 4/10)

### **نطاق العمل:**
- Bulk operations (حذف/تعديل جماعي)
- Import/Export Excel
- Backup/Restore
- Multi-language support كامل

---

## 🟣 المرحلة 15: إدارة الملفات (File Management) (أولوية: 4/10)

### **نطاق العمل:**
- رفع صور الموظفين
- تخزين مرفقات
- معالجة الصور (resize, compress)

---

## خلاصة الأولويات

### **ابدأ بهذه المراحل (بالترتيب):**

1. ✅ **Middleware + Express** (10/10) - الأساس
2. ✅ **Authentication** (10/10) - الأمان
3. ✅ **Users API** (9/10) - إدارة المستخدمين
4. ✅ **Employees API** (9/10) - قلب النظام
5. ⏳ **Devices API** (8/10) - التكامل مع الأجهزة
6. ⏳ **Access Permissions** (8/10) - التحكم في الدخول
7. ⏳ **Attendance System** (7/10) - الحضور والانصراف

**بعد إتمام هذه المراحل السبع، النظام يصبح:**
- ✅ آمن (Authentication + Authorization)
- ✅ وظيفي (إدارة موظفين + أجهزة + صلاحيات)
- ✅ جاهز للاستخدام الأساسي (تسجيل حضور)

**المراحل المتبقية (8-15) اختيارية ويمكن تأجيلها.**

---

## ملاحظات مهمة

### **تقدير الوقت:**
- المراحل 1-4 (10/10 و 9/10): **أسبوع واحد** (بعمل مكثف)
- المراحل 5-7 (8/10 و 7/10): **5-7 أيام**
- المراحل 8-15: **حسب الحاجة**

### **الاعتمادية (Dependencies):**
```
Middleware (1)
    ↓
Authentication (2)
    ↓
Users (3) ←→ Employees (4)
    ↓           ↓
Devices (5) → Access (6)
    ↓           ↓
Attendance (7)
```

### **نصائح التطوير:**
- 🎯 **Focus**: ركز على مرحلة واحدة حتى تكتمل 100%
- ✅ **Testing**: اختبر كل endpoint قبل الانتقال للتالي
- 📝 **Documentation**: وثق API بعد كل مرحلة
- 🔄 **Git**: commit بعد كل feature مكتمل
- 🐛 **Debug**: لا تتجاهل warnings أو errors صغيرة

---

## 🔄 تحديث الحالة - 7 فبراير 2026

### ✅ **ما تم إنجازه:**

#### **المراحل المكتملة 100%:**
1. ✅ **Middleware + Express** (المرحلة 1) - مكتمل
2. ✅ **Authentication System** (المرحلة 2) - 7 endpoints مكتملة
3. ✅ **Users Management API** (المرحلة 3) - CRUD كامل
4. ✅ **Employees Management API** (المرحلة 4) - 9 endpoints مكتملة
5. ✅ **Devices Management API** (المرحلة 5) - 11 endpoints مكتملة

#### **الوثائق المُنشأة:**
- ✅ `HikVision_Users_API_Documentation_Feb5_2026.html`
- ✅ `HikVision_Employees_API_Documentation_Feb6_2026.html`
- ✅ `HikVision_Auth_API_Documentation_Feb6_2026.html`
- ✅ `HikVision_Devices_API_Documentation_Feb6_2026.html`
- ✅ `System_Status_and_Gaps_Feb6_2026.md` (Gap Analysis)

#### **قاعدة البيانات:**
- ✅ 17 جدول مُنشأة وتعمل بنجاح
- ✅ Database schema مُختبر ومُحدّث
- ✅ Soft delete مُفعّل في الجداول الرئيسية
- ✅ Audit trail columns موجودة

#### **الاختبارات:**
- ✅ Devices API - مُختبر يدوياً ويعمل مع Database
- ✅ Employees API - مُختبر يدوياً (6 موظفين في DB)
- ✅ Auth API - تسجيل الدخول يعمل بنجاح
- ⚠️ لا توجد automated tests بعد

---

## 🚨 النواقص الحرجة المكتشفة (CRITICAL GAPS)

بعد مراجعة شاملة للنظام، تم اكتشاف نواقص حرجة **يجب** معالجتها قبل المتابعة:

---

### ✅ المرحلة 3.5: **Organizations Management API** (أولوية: 10/10 - COMPLETE) ⭐⭐⭐⭐⭐

**✅ هذه المرحلة مكتملة بنجاح - 7 فبراير 2026**

#### **لماذا هذه المرحلة CRITICAL؟**
- 🚫 **BLOCKING:** بدون Organizations API، لا يمكن:
  - إنشاء مؤسسات جديدة
  - إدارة الاشتراكات (Subscription Plans)
  - تهيئة إعدادات المؤسسة
  - التحكم في الحدود (max_employees, max_devices)
- 🏢 النظام **Multi-tenant** ويعتمد كلياً على Organizations
- 📊 جميع الـ APIs الأخرى تفترض وجود organization_id

#### **الوضع الحالي:**
- ✅ **Model:** `Organization.js` موجود ومُعرّف بشكل كامل
- ✅ **Database Table:** `organizations` موجود وفيه بيانات
- ✅ **Service:** `organizationService.js` - **مكتمل (600+ أسطر، 13 دالة)**
- ✅ **Controller:** `organizationController.js` - **مكتمل (170 سطر، 11 معالج)**
- ✅ **Validators:** `organizationValidator.js` - **مكتمل (280+ سطر، 6 محققات)**
- ✅ **Routes:** `organizationRoutes.js` - **مكتمل (155 سطر، تفويض كامل)**
- ✅ **Tests:** اختبارات شاملة (10 حالات اختبار - كلها نجحت ✅)
- ✅ **Documentation:** HTML كامل (HikVision_Organizations_API_Documentation_Feb7_2026.html)

#### **✅ تاريخ الإنجاز:** 7 فبراير 2026
#### **✅ الحالة:** مكتمل بنجاح - جميع الاختبارات تعمل

#### **الملفات المطلوبة:**
```
src/
├── services/
│   └── organizationService.js     # منطق الأعمال
├── controllers/
│   └── organizationController.js  # معالجات الطلبات
├── validators/
│   └── organizationValidator.js   # التحقق من البيانات
└── routes/
    └── organizationRoutes.js      # مسارات API
```

#### **API Endpoints المطلوبة (10 endpoints):**

**1. GET /api/organizations/** 
- عرض جميع المؤسسات (super_admin فقط)
- Pagination + Search + Filters
- Filter: subscription_plan, is_active

**2. GET /api/organizations/:id**
- عرض تفاصيل مؤسسة
- Authorization: super_admin أو users من نفس المؤسسة

**3. POST /api/organizations/**
- إنشاء مؤسسة جديدة (super_admin فقط)
- Validation: email unique, name required
- إنشاء admin user تلقائياً للمؤسسة

**4. PUT /api/organizations/:id**
- تحديث بيانات المؤسسة
- Authorization: super_admin أو admin في نفس المؤسسة
- لا يمكن تحديث email (منع التغيير)

**5. DELETE /api/organizations/:id**
- حذف مؤسسة (soft delete)
- super_admin فقط
- التحقق من عدم وجود موظفين/أجهزة نشطة

**6. POST /api/organizations/:id/activate**
- تفعيل مؤسسة معطلة

**7. POST /api/organizations/:id/deactivate**
- تعطيل مؤسسة

**8. PUT /api/organizations/:id/subscription**
- تحديث خطة الاشتراك (super_admin فقط)
- Body: `{ subscription_plan, subscription_end, max_employees, max_devices }`

**9. PUT /api/organizations/:id/settings**
- تحديث إعدادات المؤسسة (JSONB)
- Body: `{ settings: { language: "ar", timezone: "Asia/Baghdad", ... } }`

**10. GET /api/organizations/stats/overview**
- إحصائيات المؤسسات (super_admin فقط)
- Total, Active, Inactive, بالخطة

#### **Organization Model Fields:**
```javascript
{
  id,
  name,                   // اسم المؤسسة
  email,                  // بريد رسمي (unique)
  phone,
  address,
  subscription_plan,      // free, basic, pro, enterprise
  subscription_start,
  subscription_end,
  max_employees,          // حد الموظفين
  max_devices,            // حد الأجهزة
  storage_limit_mb,       // حد التخزين
  is_active,
  settings,               // JSONB (مرن)
  created_at,
  updated_at
}
```

#### **Authorization Logic:**
- **super_admin:** الوصول الكامل لكل المؤسسات
- **admin:** يستطيع تعديل مؤسسته فقط (لا يستطيع تغيير subscription)
- **manager/viewer:** قراءة فقط لمؤسستهم

#### **Validation Rules:**
```javascript
// Create
- name: required, 2-255 chars
- email: required, unique, valid email
- phone: optional, valid format
- subscription_plan: enum [free, basic, pro, enterprise]
- max_employees: number, > 0
- max_devices: number, > 0

// Update
- name: optional, 2-255 chars
- email: cannot change (blocked)
- phone: optional
- is_active: boolean
```

#### **تقدير الوقت:** 6-8 ساعات (باستخدام templates من Devices API)

#### **معايير النجاح:**
- ✅ CRUD كامل للمؤسسات
- ✅ إدارة الاشتراكات
- ✅ Authorization محكم
- ✅ Validation شامل
- ✅ Tests يدوية تعمل
- ✅ Documentation HTML مُنشأة

---

### 🟠 المرحلة 16: **File Upload System** (أولوية: 9/10 - HIGH) ⭐⭐⭐⭐

**⚠️ تم رفع الأولوية من 4/10 إلى 9/10**

#### **لماذا هذه المرحلة مهمة جداً الآن؟**
- 📷 **صور الموظفين:** ضرورية لـ Face Recognition
- 🏢 **شعارات المؤسسات:** للعرض في التقارير
- 📄 **Bulk Import CSV:** لاستيراد موظفين بالجملة
- 📎 **مرفقات المستندات:** ID cards, certificates

#### **الوضع الحالي:**
- ❌ لا توجد middleware للـ file upload
- ❌ لا توجد معالجة للصور (resize, compress)
- ❌ لا يوجد storage strategy محدد
- ❌ Employee photo field موجود لكن غير مُستخدم

#### **المكتبات المطلوبة:**
```bash
npm install multer sharp                    # File upload + Image processing
npm install @types/multer --save-dev        # TypeScript types (optional)
```

#### **الملفات المطلوبة:**
```
src/
├── middlewares/
│   ├── upload.js              # Multer configuration
│   └── imageProcessor.js      # Sharp image processing
├── utils/
│   └── fileValidator.js       # File validation utilities
└── uploads/                   # Storage directory (local)
    ├── employees/
    │   └── photos/
    ├── organizations/
    │   └── logos/
    └── temp/
```

#### **Upload Middleware Setup:**
```javascript
// middlewares/upload.js
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/${req.uploadPath || 'temp'}`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('نوع الملف غير مدعوم. يُسمح فقط بـ: JPEG, PNG, GIF, PDF', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  }
});
```

#### **Image Processing:**
```javascript
// middlewares/imageProcessor.js
import sharp from 'sharp';

export const processEmployeePhoto = async (file) => {
  const outputPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '-processed.jpg');
  
  await sharp(file.path)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
  
  return outputPath;
};
```

#### **استخدام في Routes:**
```javascript
// routes/employeeRoutes.js
import { upload } from '../middlewares/upload.js';
import { processEmployeePhoto } from '../middlewares/imageProcessor.js';

// Upload single photo
router.post('/:id/photo', 
  authenticate,
  authorize(['admin', 'manager']),
  (req, res, next) => {
    req.uploadPath = 'employees/photos';
    next();
  },
  upload.single('photo'),
  async (req, res, next) => {
    if (req.file) {
      req.file.processedPath = await processEmployeePhoto(req.file);
    }
    next();
  },
  employeeController.uploadPhoto
);

// Upload organization logo
router.post('/:id/logo',
  authenticate,
  authorize(['super_admin', 'admin']),
  (req, res, next) => {
    req.uploadPath = 'organizations/logos';
    next();
  },
  upload.single('logo'),
  organizationController.uploadLogo
);

// Bulk import CSV
router.post('/import',
  authenticate,
  authorize(['admin']),
  upload.single('csvFile'),
  employeeController.bulkImport
);
```

#### **Security Considerations:**
- ✅ File type validation (whitelist)
- ✅ File size limits (5MB للصور، 10MB للـ CSV)
- ✅ Filename sanitization (منع path traversal)
- ✅ Virus scanning (optional - ClamAV integration)
- ✅ Store outside public directory
- ✅ Serve files via API (access control)

#### **Serving Uploaded Files:**
```javascript
// app.js
// ❌ DON'T: app.use('/uploads', express.static('uploads'));  // Insecure!

// ✅ DO: Serve via protected endpoint
router.get('/employees/:id/photo', 
  authenticate,
  employeeController.getPhoto
);

// Controller
async getPhoto(req, res) {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee || !employee.photo_path) {
    throw new AppError('الصورة غير موجودة', 404);
  }
  
  // Check authorization (same organization)
  if (req.user.organization_id !== employee.organization_id && req.user.role !== 'super_admin') {
    throw new AppError('غير مصرح', 403);
  }
  
  res.sendFile(path.resolve(employee.photo_path));
}
```

#### **تقدير الوقت:** 1 يوم عمل (8 ساعات)

#### **معايير النجاح:**
- ✅ رفع صور الموظفين بنجاح
- ✅ معالجة الصور (resize + compress)
- ✅ رفع شعارات المؤسسات
- ✅ CSV import للموظفين
- ✅ Authorization على الملفات
- ✅ Validation شامل

---

### 🟠 المرحلة 17: **Automated Testing Suite** (أولوية: 9/10 - HIGH) ⭐⭐⭐⭐

**⚠️ مرحلة جديدة - لم تكن في الخطة الأصلية**

#### **لماذا Testing ضروري الآن؟**
- 🐛 **منع Bugs:** اكتشاف الأخطاء قبل Production
- 🔄 **Regression Prevention:** التأكد أن التحديثات لا تكسر features قديمة
- 📈 **Code Quality:** زيادة الثقة في الكود
- 🚀 **Faster Development:** اختبار سريع بدلاً من Manual Testing

#### **الوضع الحالي:**
- ✅ Manual PowerShell tests موجودة
- ❌ لا توجد automated tests
- ❌ لا يوجد test framework
- ❌ لا يوجد CI/CD pipeline

#### **المكتبات المطلوبة:**
```bash
npm install --save-dev jest supertest @types/jest
npm install --save-dev @faker-js/faker      # Test data generation
```

#### **File Structure:**
```
backend/
├── tests/
│   ├── setup.js                    # Test setup & teardown
│   ├── helpers/
│   │   ├── authHelper.js           # Login helper
│   │   ├── dbHelper.js             # Database seeding
│   │   └── faker.js                # Fake data generator
│   ├── unit/
│   │   ├── services/
│   │   │   ├── authService.test.js
│   │   │   ├── userService.test.js
│   │   │   ├── employeeService.test.js
│   │   │   └── deviceService.test.js
│   │   └── utils/
│   │       ├── jwt.test.js
│   │       ├── bcrypt.test.js
│   │       └── validators.test.js
│   └── integration/
│       ├── auth.test.js            # Auth endpoints
│       ├── users.test.js           # Users CRUD
│       ├── employees.test.js       # Employees CRUD
│       ├── devices.test.js         # Devices CRUD
│       └── organizations.test.js   # Organizations CRUD
└── package.json                    # Test scripts
```

#### **package.json Configuration:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:unit": "jest --testPathPattern=tests/unit"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/server.js",
      "!src/database/**"
    ],
    "testMatch": [
      "**/tests/**/*.test.js"
    ],
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"]
  }
}
```

#### **Sample Integration Test:**
```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/app.js';
import { sequelize } from '../../src/models/index.js';

describe('Authentication API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Seed test data
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@demo.test',
          password: 'Admin@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@demo.test',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

#### **Test Coverage Goals:**
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All major endpoints
- **Priority APIs:** Auth, Users, Employees, Devices, Organizations

#### **تقدير الوقت:** 1-2 أسابيع (تدريجياً مع التطوير)

#### **معايير النجاح:**
- ✅ Jest configured ويعمل
- ✅ Auth API: 100% endpoints مُختبرة
- ✅ Users API: CRUD كامل مُختبر
- ✅ Employees API: CRUD مُختبر
- ✅ Devices API: مُختبر
- ✅ Organizations API: مُختبر (بعد إنشائه)
- ✅ Coverage > 70%

---

### 🟡 المرحلة 18: **Email Templates System** (أولوية: 8/10 - MEDIUM) ⭐⭐⭐

**⚠️ تحديث: Templates غير مكتملة**

#### **الوضع الحالي:**
- ✅ Nodemailer configured
- ✅ Email service موجود (`utils/emailService.js`)
- ⚠️ Password reset email موجود (بسيط)
- ❌ Welcome email - مفقود
- ❌ Subscription expiry alert - مفقود
- ❌ Device offline notification - مفقود
- ❌ HTML templates احترافية - مفقودة

#### **الملفات المطلوبة:**
```
backend/
└── templates/
    └── emails/
        ├── layout.html              # Base template
        ├── welcome.html             # ترحيب مستخدم جديد
        ├── password-reset.html      # إعادة تعيين كلمة المرور
        ├── subscription-expiry.html # تنبيه انتهاء الاشتراك
        ├── device-offline.html      # جهاز غير متصل
        ├── attendance-report.html   # تقرير الحضور الشهري
        └── styles/
            └── email.css            # Inline CSS
```

#### **Email Templates المطلوبة:**

**1. Welcome Email** (عند إنشاء user جديد)
- العنوان: "مرحباً بك في نظام HikVision ACS"
- المحتوى: اسم المستخدم، دوره، رابط تسجيل الدخول، بيانات الاتصال

**2. Password Reset** (تحسين الموجود)
- Responsive HTML design
- زر واضح للـ reset link
- تحذير أمني (إذا لم تطلب هذا، تجاهل الرسالة)

**3. Subscription Expiry Alert** (قبل انتهاء الاشتراك بـ 7 أيام)
- تنبيه بقرب انتهاء الاشتراك
- تفاصيل الخطة والتكلفة
- رابط للتجديد

**4. Device Offline Notification**
- إشعار للـ admin عند انقطاع device
- Device name, location, last_seen
- تعليمات troubleshooting

**5. Monthly Attendance Report**
- تقرير شهري تلقائي
- إحصائيات: حضور، تأخير، غياب
- جدول بتفاصيل الأيام

#### **تقدير الوقت:** 2-3 أيام

---

### 🟡 المرحلة 19: **Security Hardening** (أولوية: 8/10 - MEDIUM) ⭐⭐⭐

**⚠️ مرحلة جديدة - حماية إضافية**

#### **الوضع الحالي:**
- ✅ Helmet.js configured
- ✅ CORS setup
- ✅ Rate limiting (basic)
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ❌ XSS protection - ناقص
- ❌ NoSQL injection prevention - ناقص
- ❌ Input sanitization - ناقص
- ❌ CSRF protection - ناقص

#### **المكتبات المطلوبة:**
```bash
npm install xss-clean express-mongo-sanitize hpp validator
```

#### **Implementations المطلوبة:**

**1. XSS Protection:**
```javascript
// app.js
import xss from 'xss-clean';
app.use(xss());  // Clean any user input
```

**2. NoSQL Injection Prevention:**
```javascript
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());  // Remove $ and . from user input
```

**3. HTTP Parameter Pollution:**
```javascript
import hpp from 'hpp';
app.use(hpp());  // Protect against parameter pollution
```

**4. Input Sanitization in Validators:**
```javascript
// validators/userValidator.js
import validator from 'validator';

const createUserValidator = [
  body('email')
    .isEmail().withMessage('بريد إلكتروني غير صحيح')
    .normalizeEmail()
    .trim()
    .escape(),
  
  body('first_name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()  // منع XSS
];
```

**5. CSRF Protection (للـ form-based requests):**
```javascript
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });
```

**6. Security Headers Audit:**
```javascript
// app.js - Enhanced Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

#### **تقدير الوقت:** 1 يوم

#### **معايير النجاح:**
- ✅ XSS protection enabled
- ✅ NoSQL injection prevented
- ✅ Input sanitization في جميع validators
- ✅ Security headers محسّنة
- ✅ Dependency vulnerability scan (npm audit)

---

### 🟡 المرحلة 20: **HikVision SDK Integration** (أولوية: 8/10 - MEDIUM) ⭐⭐⭐

**⚠️ حالياً: Placeholder فقط**

#### **الوضع الحالي:**
- ✅ `POST /api/devices/:id/sync` موجود (يحدث timestamp فقط)
- ❌ لا يوجد اتصال حقيقي بالأجهزة
- ❌ SDK غير مُثبّت
- ❌ لا توجد معالجة للـ events

#### **المطلوب:**
- تثبيت HikVision SDK
- إنشاء `hikvisionService.js`
- تكامل حقيقي مع الأجهزة:
  - Upload face templates
  - Upload fingerprints
  - Upload card data
  - Get attendance logs
  - Open doors remotely

#### **تقدير الوقت:** 2-3 أسابيع (learning curve)

---

### 🟡 المرحلة 21: **WebSocket Real-time System** (أولوية: 8/10 - MEDIUM) ⭐⭐⭐

**⚠️ غير موجود حالياً**

#### **Use Cases:**
- إشعارات فورية (device offline, access denied)
- Live attendance updates
- Real-time dashboard
- Device status monitoring

#### **المكتبات:**
```bash
npm install socket.io
```

#### **تقدير الوقت:** 1 أسبوع

---

## 📊 ملخص الأولويات المُحدّثة

### **✅ مكتمل:**
1. ✅ **Organizations API** (10/10) - مكتمل 7 فبراير 2026

### **يجب إنجازها فوراً (الأسبوع الحالي):**
1. 🟠 **File Upload System** (9/10) - 1 يوم ⚡ **NEXT**
2. 🟡 **Security Hardening** (8/10) - 1 يوم

### **الأسبوعين القادمين:**
4. 🟠 **Testing Suite** (9/10) - تدريجياً
5. 🟡 **Email Templates** (8/10) - 2-3 أيام

### **الشهر القادم:**
6. 🟡 **HikVision SDK** (8/10) - 2-3 أسابيع
7. 🟡 **WebSocket Real-time** (8/10) - 1 أسبوع

---

## 🎯 خطة العمل المُوصى بها

### **✅ اليوم الأول (مكتمل - 7 فبراير 2026):**
- ✅ Organizations API (كامل)
- ✅ Documentation

### **اليوم الثاني (8 ساعات):**
- ✅ File Upload System
- ✅ Testing
- ✅ Security Hardening (XSS, Sanitization)

### **الأسبوع الثاني:**
- ✅ Email Templates (يومين)
- ✅ Jest Setup + Auth Tests (يومين)
- ✅ Users/Employees Tests (يوم)

### **الأسبوع الثالث-الرابع:**
- ✅ HikVision SDK Integration
- ✅ WebSocket Setup

---

**آخر تحديث:** 7 فبراير 2026  
**الحالة:** 
- ✅ المراحل 1-5 مكتملة (Auth, Users, Employees, Devices, Organizations)
- 🚨 Organizations API - **CRITICAL** (يجب البدء فوراً)
- 🔄 النظام جاهز للاستخدام الأساسي بعد Organizations API
