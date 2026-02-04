# 🌟 القواعد الذهبية | Golden Rules

> **دليل المبادئ والممارسات الأساسية لتطوير نظام HikVision Access Control**

> آخر تحديث: 4 فبراير 2026

---

## 📜 المبادئ الأساسية | Core Principles

### 1. البساطة أولاً | Simplicity First
> "Make things as simple as possible, but not simpler." - Albert Einstein

- ✅ اكتب كود بسيط وواضح
- ✅ تجنب التعقيد غير الضروري
- ✅ إذا كان هناك طريقتان، اختر الأبسط
- ❌ لا تضف ميزات "قد نحتاجها لاحقاً"
- ❌ لا تستخدم أنماط معقدة إلا للضرورة

**مثال:**
```javascript
// ❌ معقد وغير ضروري
const getEmployeeName = (employee) => {
  return employee && employee.name ? employee.name : null;
};

// ✅ بسيط وواضح
const getEmployeeName = (employee) => employee?.name || null;
```

---

### 2. الأمان دائماً | Security Always
> "Security is not a product, but a process."

- ✅ **كل** input يجب التحقق منه (Validation)
- ✅ استخدم prepared statements (لا SQL injection)
- ✅ hash كلمات المرور (bcrypt)
- ✅ استخدم HTTPS في الإنتاج
- ✅ احفظ secrets في .env (لا تكتبها في الكود)
- ❌ لا تعرض error details للمستخدم في production
- ❌ لا تحفظ passwords في plain text أبداً

**مثال:**
```javascript
// ✅ آمن
const hashedPassword = await bcrypt.hash(password, 10);
await User.create({ email, password: hashedPassword });

// ❌ خطير جداً
await User.create({ email, password }); // Plain text!
```

---

### 3. اكتب كود قابل للصيانة | Write Maintainable Code
> "Code is read more often than it is written."

- ✅ أسماء متغيرات واضحة ومعبرة
- ✅ دوال صغيرة (دالة واحدة = مهمة واحدة)
- ✅ اكتب تعليقات للأجزاء المعقدة فقط
- ✅ استخدم naming conventions ثابتة
- ❌ لا تكتب دوال طويلة (> 50 lines)
- ❌ لا تكرر نفسك (DRY - Don't Repeat Yourself)

**مثال:**
```javascript
// ❌ اسم غير واضح
const d = new Date();
const t = d.getTime();

// ✅ واضح ومعبر
const currentDate = new Date();
const timestamp = currentDate.getTime();
```

---

### 4. عزل المسؤوليات | Separation of Concerns
> "Each module should do one thing and do it well."

- ✅ Models = بيانات فقط (data structure)
- ✅ Controllers = معالجة الطلبات (request handling)
- ✅ Services = منطق الأعمال (business logic)
- ✅ Routes = تعريف endpoints فقط
- ❌ لا تكتب business logic في controllers
- ❌ لا تضع database queries في routes

**البنية الصحيحة:**
```
Route → Controller → Service → Model → Database
  ↓         ↓           ↓         ↓
endpoint  validate   business   data
          handle     logic      access
          response
```

---

### 5. اختبر كل شيء | Test Everything
> "Untested code is broken code."

- ✅ اكتب tests مع كل feature
- ✅ Unit tests للدوال المعقدة
- ✅ Integration tests للـ APIs
- ✅ Coverage > 80%
- ✅ Test edge cases (حالات غير عادية)
- ❌ لا تنشر كود بدون اختبار

**أنواع الاختبارات:**
```javascript
// Unit Test
test('calculateWorkingHours returns correct hours', () => {
  expect(calculateWorkingHours('08:00', '17:00')).toBe(9);
});

// Integration Test
test('POST /api/employees creates employee', async () => {
  const response = await request(app)
    .post('/api/v1/employees')
    .send({ name: 'Ahmed', employeeNo: '1001' });
  expect(response.status).toBe(201);
});
```

---

## 💻 قواعد البرمجة | Coding Rules

### 6. التعامل مع الأخطاء | Error Handling

#### القاعدة الذهبية:
**"Every async operation MUST have error handling"**

```javascript
// ❌ خطأ - لا error handling
async function getEmployee(id) {
  const employee = await Employee.findByPk(id);
  return employee;
}

// ✅ صحيح - معالجة كاملة
async function getEmployee(id) {
  try {
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
    
    return employee;
  } catch (error) {
    logger.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
}
```

#### أنواع الأخطاء:
```javascript
// تعريف custom errors
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}
```

---

### 7. Async/Await دائماً | Always Use Async/Await

#### القاعدة:
**"No callbacks, no .then() chains - use async/await"**

```javascript
// ❌ قديم - callbacks
Employee.findByPk(id, (err, employee) => {
  if (err) return handleError(err);
  // ...
});

// ❌ قديم - promises
Employee.findByPk(id)
  .then(employee => {
    // ...
  })
  .catch(err => {
    // ...
  });

// ✅ حديث - async/await
try {
  const employee = await Employee.findByPk(id);
  // ...
} catch (error) {
  // ...
}
```

---

### 8. Validation دائماً | Always Validate Input

#### القاعدة:
**"Never trust user input"**

```javascript
// استخدم express-validator أو Joi
const { body, validationResult } = require('express-validator');

// تعريف validation rules
const createEmployeeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('employeeNo')
    .trim()
    .notEmpty().withMessage('Employee number is required')
    .isNumeric().withMessage('Employee number must be numeric'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .matches(/^07[0-9]{9}$/).withMessage('Invalid Iraqi phone number')
];

// استخدام في route
router.post('/employees', createEmployeeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

---

### 9. Database Queries Optimization

#### القاعدة:
**"Select only what you need"**

```javascript
// ❌ يجلب كل البيانات
const employees = await Employee.findAll();

// ✅ يجلب فقط ما تحتاج
const employees = await Employee.findAll({
  attributes: ['id', 'name', 'employeeNo'], // columns فقط
  where: { isActive: true },
  limit: 10,
  offset: 0,
  include: [{
    model: Department,
    attributes: ['id', 'name'] // لا تجلب كل department data
  }]
});
```

#### استخدم Indexes:
```javascript
// في الـ migration
queryInterface.addIndex('employees', ['organization_id']);
queryInterface.addIndex('employees', ['employee_no']);
queryInterface.addIndex('attendance_logs', ['employee_id', 'event_time']);
```

---

### 10. استخدم Transactions للعمليات المترابطة

#### القاعدة:
**"If multiple operations must succeed together, use transactions"**

```javascript
// ✅ مثال: تسجيل موظف + وجه + بطاقة
async function registerEmployee(employeeData) {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Create employee
    const employee = await Employee.create(employeeData, { transaction });
    
    // 2. Upload face to device
    await isapiClient.addUser({
      employeeNo: employee.employee_no,
      name: employee.name
    });
    
    await isapiClient.uploadFacePicture(
      employee.employee_no,
      employeeData.faceImage
    );
    
    // 3. Save face template
    await FaceTemplate.create({
      employee_id: employee.id,
      device_id: employeeData.deviceId
    }, { transaction });
    
    // 4. Commit
    await transaction.commit();
    return employee;
    
  } catch (error) {
    // Rollback if any step fails
    await transaction.rollback();
    throw error;
  }
}
```

---

### 11. Logging المناسب

#### القاعدة:
**"Log important events, errors, and security-related actions"**

```javascript
// استخدم Winston
const logger = require('./utils/logger');

// Levels: error, warn, info, debug

// ✅ Log errors
logger.error('Failed to sync employee', { 
  employeeId: employee.id, 
  error: error.message,
  stack: error.stack 
});

// ✅ Log important events
logger.info('Employee registered', { 
  employeeId: employee.id,
  userId: req.user.id,
  ip: req.ip
});

// ✅ Log security events
logger.warn('Failed login attempt', { 
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});

// ❌ لا تكتب كل شيء
// logger.debug('Starting loop'); // unnecessary
```

#### ما تكتبه في الـ logs:
- ✅ Errors مع stack trace
- ✅ Authentication events (login, logout, failed attempts)
- ✅ Data modifications (create, update, delete)
- ✅ External API calls (success/failure)
- ✅ Performance metrics (slow queries)
- ❌ Passwords أو sensitive data
- ❌ Personal information (comply with privacy laws)

---

### 12. استخدم Environment Variables

#### القاعدة:
**"No hardcoded secrets, URLs, or configuration"**

```javascript
// ❌ خطأ
const dbHost = 'localhost';
const apiKey = 'abc123xyz';

// ✅ صحيح
const dbHost = process.env.DB_HOST;
const apiKey = process.env.API_KEY;

// ✅ مع default values
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
```

#### .env file structure:
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hikvision_acs
DB_USER=postgres
DB_PASSWORD=secret123

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRE=7d

# HikVision
DEVICE_TIMEOUT=10000
```

---

## 🗂️ قواعد البنية | Structure Rules

### 13. Folder Structure (البنية المجلدات)

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # Sequelize models
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Middleware functions
│   ├── utils/            # Utility functions
│   ├── cron/             # Cron jobs
│   ├── websocket/        # WebSocket handlers
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── uploads/              # User uploads
├── logs/                 # Log files
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── server.js             # Entry point
```

---

### 14. Naming Conventions

#### Files:
```
camelCase.js          ❌
PascalCase.js         ❌ (except Models)
kebab-case.js         ✅ (preferred)
snake_case.js         ❌

Examples:
✅ user.controller.js
✅ employee.service.js
✅ auth.middleware.js
✅ User.js (Model only)
```

#### Variables:
```javascript
// camelCase for variables and functions
const employeeName = 'Ahmed';
function calculateHours() {}

// PascalCase for Classes and Models
class Employee {}
const User = require('./models/User');

// UPPER_SNAKE_CASE for constants
const MAX_UPLOAD_SIZE = 10485760; // 10MB
const DEFAULT_PAGE_SIZE = 20;
```

#### Database:
```
snake_case for everything
✅ employee_no
✅ created_at
✅ organization_id
❌ employeeNo
❌ createdAt
```

---

### 15. API Response Format

#### القاعدة:
**"Consistent response structure everywhere"**

```javascript
// ✅ Success Response
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 123,
    "name": "Ahmed Ali",
    "employee_no": "1001"
  }
}

// ✅ Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

// ✅ Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95
  }
}
```

#### Status Codes:
```
200 - OK (GET, PUT)
201 - Created (POST)
204 - No Content (DELETE)
400 - Bad Request (validation error)
401 - Unauthorized (not logged in)
403 - Forbidden (no permission)
404 - Not Found
409 - Conflict (duplicate)
422 - Unprocessable Entity (business logic error)
500 - Internal Server Error
```

---

## 🔒 قواعد الأمان | Security Rules

### 16. Authentication & Authorization

```javascript
// ✅ Middleware للتحقق من JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// ✅ Middleware للتحقق من الصلاحية
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }
    next();
  };
};

// Usage
router.delete('/employees/:id', 
  authenticate, 
  authorize('admin', 'super_admin'), 
  deleteEmployee
);
```

---

### 17. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// ✅ عام
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests, please try again later'
});

// ✅ Login endpoint (أكثر تشدداً)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts only
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.use('/api', generalLimiter);
app.use('/api/v1/auth/login', loginLimiter);
```

---

### 18. SQL Injection Prevention

```javascript
// ✅ استخدم Sequelize (prepared statements)
const employee = await Employee.findOne({
  where: { employee_no: employeeNo } // Safe
});

// ❌ لا تستخدم raw queries مع user input
const employees = await sequelize.query(
  `SELECT * FROM employees WHERE name = '${name}'` // SQL Injection!
);

// ✅ إذا اضطررت لـ raw query
const employees = await sequelize.query(
  'SELECT * FROM employees WHERE name = :name',
  {
    replacements: { name: name }, // Safe
    type: QueryTypes.SELECT
  }
);
```

---

### 19. XSS Prevention

```javascript
// ✅ Sanitize user input
const sanitizeHtml = require('sanitize-html');

const sanitizedName = sanitizeHtml(req.body.name, {
  allowedTags: [], // No HTML tags
  allowedAttributes: {}
});

// ✅ في Frontend (React)
// React automatically escapes, but be careful with:
// dangerouslySetInnerHTML - avoid if possible
```

---

### 20. CORS Configuration

```javascript
const cors = require('cors');

// ✅ Development
if (process.env.NODE_ENV === 'development') {
  app.use(cors()); // Allow all
}

// ✅ Production
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [
      'https://yourdomain.com',
      'https://app.yourdomain.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}
```

---

## ⚡ قواعد الأداء | Performance Rules

### 21. Database Connection Pooling

```javascript
// ✅ في database.js
module.exports = {
  production: {
    pool: {
      max: 30,      // Maximum connections
      min: 10,      // Minimum connections
      acquire: 30000,
      idle: 10000
    }
  }
};
```

---

### 22. Caching Strategy

```javascript
const redis = require('redis');
const client = redis.createClient();

// ✅ Cache frequently accessed data
async function getOrganization(id) {
  const cacheKey = `org:${id}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Not in cache, get from DB
  const org = await Organization.findByPk(id);
  
  // Store in cache (1 hour TTL)
  await client.setex(cacheKey, 3600, JSON.stringify(org));
  
  return org;
}

// ✅ Invalidate cache on update
async function updateOrganization(id, data) {
  const org = await Organization.update(data, { where: { id } });
  
  // Invalidate cache
  await client.del(`org:${id}`);
  
  return org;
}
```

---

### 23. Pagination دائماً

```javascript
// ✅ Always paginate lists
async function getEmployees(req, res) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;
  
  const { count, rows } = await Employee.findAndCountAll({
    limit: pageSize,
    offset: offset,
    where: { organization_id: req.user.organization_id }
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count
    }
  });
}
```

---

### 24. Eager Loading (تجنب N+1 queries)

```javascript
// ❌ N+1 Problem
const employees = await Employee.findAll();
for (let emp of employees) {
  emp.department = await Department.findByPk(emp.department_id);
}
// Total queries: 1 + N

// ✅ Eager Loading
const employees = await Employee.findAll({
  include: [{
    model: Department,
    attributes: ['id', 'name']
  }]
});
// Total queries: 1
```

---

## 📝 قواعد التوثيق | Documentation Rules

### 25. Code Comments

```javascript
// ✅ Comment complex logic only
/**
 * Calculate working hours including overtime
 * Grace period: 15 minutes
 * Overtime: after 8 hours
 * 
 * @param {Date} checkIn - Check-in time
 * @param {Date} checkOut - Check-out time
 * @param {Object} schedule - Work schedule
 * @returns {Object} { regularHours, overtimeHours }
 */
function calculateWorkingHours(checkIn, checkOut, schedule) {
  // Complex calculation logic here...
}

// ❌ Don't comment obvious code
// Get employee by ID
const employee = await Employee.findByPk(id); // No need!
```

---

### 26. API Documentation

```javascript
/**
 * @route   POST /api/v1/employees
 * @desc    Create new employee
 * @access  Private (Admin, Manager)
 * @body    { name, employeeNo, email, phone, department_id }
 * @returns { success, message, data: employee }
 */
router.post('/employees', 
  authenticate, 
  authorize('admin', 'manager'),
  createEmployeeValidation,
  createEmployee
);
```

---

## 🧹 قواعد النظافة | Clean Code Rules

### 27. No Magic Numbers

```javascript
// ❌ Magic numbers
if (user.role === 1) { ... }
setTimeout(callback, 300000);

// ✅ Named constants
const USER_ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  VIEWER: 3
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

if (user.role === USER_ROLES.ADMIN) { ... }
setTimeout(callback, FIVE_MINUTES_MS);
```

---

### 28. No Dead Code

```javascript
// ❌ Commented code
// function oldFunction() {
//   // old implementation
// }

// ❌ Unused variables
const unusedVar = 'something';

// ✅ Delete them! Git history keeps everything
```

---

### 29. Consistent Formatting

```javascript
// ✅ Use Prettier + ESLint
// Install
npm install --save-dev prettier eslint

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

// .eslintrc.js
module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

---

## 🚨 قواعد الطوارئ | Emergency Rules

### 30. في حالة Production Error:

1. **لا تهلع! (Don't Panic)**
2. Check logs أولاً
3. Identify the issue
4. Fix in development
5. Test thoroughly
6. Deploy fix
7. Monitor after deployment
8. Document the incident

### Rollback Plan:
```bash
# Always able to rollback
git checkout previous-stable-tag
npm install
npm run build
pm2 restart all
```

---

## ✅ Checklist قبل كل Commit

```
□ الكود يعمل بدون أخطاء
□ Tests تمر بنجاح
□ لا warnings في console
□ لا TODO comments (أو في issue tracker)
□ Formatting صحيح (Prettier)
□ Linting نظيف (ESLint)
□ No console.log() في production code
□ No sensitive data (passwords, keys)
□ Commit message واضح ومعبر
```

---

## 📚 الخلاصة | Summary

### الأساسيات:
1. ✅ **Simple** code
2. ✅ **Secure** by default
3. ✅ **Test** everything
4. ✅ **Document** when needed
5. ✅ **Clean** and organized

### التذكير الدائم:
> **"Write code as if the person maintaining it is a violent psychopath who knows where you live."**

---

**💡 ملاحظة أخيرة:**  
هذه القواعد **ليست اختيارية** - هي **معايير إلزامية** لضمان جودة المشروع.

**آخر تحديث:** 4 فبراير 2026
