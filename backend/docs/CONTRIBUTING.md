# 🤝 دليل المساهمة | Contributing Guide

> **نرحب بمساهماتك في تطوير نظام HikVision Access Control!**

> آخر تحديث: 4 فبراير 2026

---

## 📋 جدول المحتويات

1. [قواعد السلوك](#قواعد-السلوك)
2. [كيف أساهم؟](#كيف-أساهم)
3. [معايير الكود](#معايير-الكود)
4. [عملية Pull Request](#عملية-pull-request)
5. [الإبلاغ عن Bugs](#الإبلاغ-عن-bugs)
6. [اقتراح ميزات جديدة](#اقتراح-ميزات-جديدة)
7. [Development Setup](#development-setup)
8. [اتفاقيات Git](#اتفاقيات-git)

---

## 🌟 قواعد السلوك | Code of Conduct

### المبادئ:
- ✅ **احترم الآخرين** - نقاشات مهنية وبناءة
- ✅ **كن صبوراً** - الجميع يتعلم
- ✅ **شارك المعرفة** - ساعد الآخرين
- ✅ **اقبل النقد البناء** - للتطوير والنمو
- ❌ **لا للتنمر** أو التمييز
- ❌ **لا للسب** أو الإهانات

### السلوك المتوقع:
- استخدم لغة محترمة ومهنية
- احترم وجهات النظر المختلفة
- قدم وتقبل النقد البناء بلطف
- ركز على ما هو أفضل للمشروع والمجتمع

### السلوك غير المقبول:
- استخدام لغة أو صور جنسية
- التعليقات المسيئة أو الشخصية
- المضايقة العامة أو الخاصة
- نشر معلومات خاصة للآخرين

**الإبلاغ:** إذا شاهدت سلوكاً غير مقبول، تواصل مع مسؤولي المشروع على: conduct@yourproject.com

---

## 🚀 كيف أساهم؟ | How to Contribute

### أنواع المساهمات:

#### 1. 🐛 الإبلاغ عن Bugs
- ابحث أولاً في [Issues](https://github.com/your-repo/issues) الموجودة
- إذا لم تجد، افتح Issue جديد
- استخدم قالب Bug Report

#### 2. 💡 اقتراح ميزات جديدة
- تأكد أن الميزة غير موجودة في [ROADMAP.md](./ROADMAP.md)
- افتح Issue بـ label "feature request"
- اشرح الميزة والفائدة منها

#### 3. 📝 تحسين التوثيق
- تصحيح أخطاء إملائية
- توضيح أجزاء غامضة
- إضافة أمثلة
- ترجمة

#### 4. 🔧 تطوير الكود
- اختر Issue من [قائمة المهام](https://github.com/your-repo/issues)
- أو ابدأ feature جديدة بعد الموافقة
- اتبع معايير الكود ([GOLDEN_RULES.md](./GOLDEN_RULES.md))

---

## 💻 معايير الكود | Code Standards

### يجب أن يكون الكود:

#### 1. ✅ نظيف وواضح
```javascript
// ❌ سيء
function f(a,b){return a+b;}

// ✅ جيد
function calculateTotal(price, tax) {
  return price + tax;
}
```

#### 2. ✅ موثق
```javascript
/**
 * Calculate working hours between check-in and check-out
 * 
 * @param {Date} checkIn - Check-in timestamp
 * @param {Date} checkOut - Check-out timestamp
 * @returns {number} Working hours (decimal)
 */
function calculateWorkingHours(checkIn, checkOut) {
  const diffMs = checkOut - checkIn;
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
}
```

#### 3. ✅ مُختبَر
```javascript
describe('calculateWorkingHours', () => {
  it('should calculate correct hours', () => {
    const checkIn = new Date('2026-02-04T08:00:00');
    const checkOut = new Date('2026-02-04T17:00:00');
    
    expect(calculateWorkingHours(checkIn, checkOut)).toBe(9);
  });
  
  it('should handle overnight shifts', () => {
    const checkIn = new Date('2026-02-04T22:00:00');
    const checkOut = new Date('2026-02-05T06:00:00');
    
    expect(calculateWorkingHours(checkIn, checkOut)).toBe(8);
  });
});
```

#### 4. ✅ يتبع الأنماط الموجودة
- استخدم نفس naming conventions
- اتبع نفس folder structure
- استخدم نفس libraries

### Code Style:

#### JavaScript/Node.js:
```javascript
// استخدم ESLint + Prettier
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

#### Formatting:
```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

---

## 🔄 عملية Pull Request | PR Process

### الخطوات:

#### 1. Fork المشروع
```bash
# انقر Fork على GitHub
# ثم clone مشروعك
git clone https://github.com/YOUR-USERNAME/hikvision-acs-system.git
cd hikvision-acs-system
```

#### 2. أضف upstream
```bash
git remote add upstream https://github.com/original-owner/hikvision-acs-system.git
```

#### 3. Create branch جديد
```bash
# استخدم اسم واضح
git checkout -b feature/add-employee-import
# أو
git checkout -b fix/login-error
```

#### 4. اعمل التغييرات
```bash
# اكتب الكود
# اكتب tests
# اختبر محلياً
npm test
```

#### 5. Commit التغييرات
```bash
git add .
git commit -m "feat: add employee bulk import feature"
```

#### 6. Push للـ branch
```bash
git push origin feature/add-employee-import
```

#### 7. افتح Pull Request
- اذهب لـ GitHub
- اضغط "New Pull Request"
- املأ القالب
- أرسل!

### قالب Pull Request:

```markdown
## الوصف | Description
<!-- اشرح ما عملت بوضوح -->

إضافة ميزة استيراد الموظفين من ملف Excel

## نوع التغيير | Type of Change
- [ ] Bug fix (تصليح مشكلة)
- [x] New feature (ميزة جديدة)
- [ ] Breaking change (تغيير يؤثر على الكود الموجود)
- [ ] Documentation update (تحديث توثيق)

## التغييرات | Changes Made
- إضافة endpoint جديد `/api/v1/employees/import`
- إضافة ExcelJS library
- إضافة validation للبيانات المستوردة
- إضافة tests للـ import feature

## الاختبار | Testing
- [x] Unit tests passed
- [x] Integration tests passed
- [x] Manual testing done
- [x] No console errors

## Screenshots (إذا كان UI)
<!-- أضف صور إذا كان في تغييرات UI -->

## Checklist
- [x] الكود يتبع style guidelines
- [x] Self-review done
- [x] Commented complex code
- [x] Documentation updated
- [x] No new warnings
- [x] Tests added
- [x] All tests pass

## Related Issues
Closes #123
```

---

## 🐛 الإبلاغ عن Bugs | Reporting Bugs

### قبل الإبلاغ:
- ✅ ابحث في Issues الموجودة
- ✅ تأكد أنها bug وليست feature request
- ✅ اختبر على آخر نسخة
- ✅ اجمع معلومات كافية

### قالب Bug Report:

```markdown
## وصف المشكلة | Bug Description
<!-- وصف واضح ومختصر للمشكلة -->

عند محاولة تسجيل موظف جديد، يظهر خطأ 500

## خطوات إعادة المشكلة | Steps to Reproduce
1. اذهب إلى صفحة الموظفين
2. اضغط "إضافة موظف"
3. املأ النموذج
4. اضغط "حفظ"
5. خطأ 500 يظهر

## النتيجة المتوقعة | Expected Behavior
يجب أن يتم إنشاء الموظف بنجاح وإظهار رسالة "تم الإضافة بنجاح"

## النتيجة الفعلية | Actual Behavior
رسالة خطأ: "Internal Server Error"

## Screenshots
<!-- إذا ممكن -->

## البيئة | Environment
- OS: Windows 11
- Browser: Chrome 120
- Node version: v18.17.0
- Database: PostgreSQL 14.5

## Logs
```
Error: Cannot read property 'name' of undefined
    at createEmployee (employee.controller.js:45)
    ...
```

## معلومات إضافية | Additional Context
المشكلة تحدث فقط عند ترك حقل القسم فارغاً
```

---

## 💡 اقتراح ميزات جديدة | Suggesting Features

### قالب Feature Request:

```markdown
## الميزة المقترحة | Feature Description
<!-- وصف واضح للميزة -->

إضافة إمكانية تصدير التقارير إلى PDF

## المشكلة التي تحلها | Problem it Solves
حالياً، يمكن فقط عرض التقارير على الشاشة. المستخدمون يحتاجون 
طباعة أو مشاركة التقارير، لذلك يحتاجون صيغة PDF.

## الحل المقترح | Proposed Solution
إضافة زر "تصدير PDF" في صفحة التقارير. عند النقر، يتم توليد 
ملف PDF يحتوي على:
- شعار المؤسسة
- عنوان التقرير
- البيانات في جدول
- تاريخ التوليد

## البدائل | Alternatives Considered
- تصدير Excel: جيد للبيانات لكن ليس للطباعة
- Print من المتصفح: غير احترافي

## معلومات إضافية | Additional Context
مكتبات مقترحة: PDFKit أو Puppeteer

## الأولوية | Priority
- [x] Nice to have
- [ ] Important
- [ ] Critical
```

---

## 🛠️ Development Setup

### 1. متطلبات النظام

```bash
# Node.js 18+
node --version  # v18.17.0+

# PostgreSQL 14+
psql --version

# Git
git --version

# Redis (optional)
redis-cli --version
```

### 2. Clone و Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/hikvision-acs-system.git
cd hikvision-acs-system

# Install dependencies
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Create database
createdb hikvision_acs

# Run migrations (when available)
npm run db:migrate

# Run seeds (optional)
npm run db:seed
```

### 3. Development Workflow

```bash
# Start backend in dev mode
npm run dev

# In another terminal - run tests
npm test

# Watch mode for tests
npm run test:watch

# Check code style
npm run lint

# Fix code style
npm run lint:fix

# Format code
npm run format
```

### 4. قبل الـ Commit

```bash
# تأكد من:
npm run lint        # ✅ No errors
npm test           # ✅ All pass
npm run build      # ✅ Builds successfully

# ثم commit
git add .
git commit -m "feat: your feature"
```

---

## 📝 اتفاقيات Git | Git Conventions

### Commit Messages:

#### Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types:
- `feat`: ميزة جديدة
- `fix`: إصلاح bug
- `docs`: تغيير في التوثيق
- `style`: تنسيق الكود (لا يؤثر على الوظيفة)
- `refactor`: إعادة هيكلة الكود
- `test`: إضافة أو تعديل tests
- `chore`: مهام صيانة (dependencies, build, etc.)
- `perf`: تحسين الأداء

#### أمثلة:

```bash
# Feature
git commit -m "feat(employees): add bulk import from Excel"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(readme): update installation steps"

# Refactor
git commit -m "refactor(database): optimize employee queries"

# Test
git commit -m "test(attendance): add unit tests for calculation"

# With body
git commit -m "feat(reports): add PDF export

- Add PDFKit dependency
- Create report generator service
- Add export endpoint
- Update UI with export button"
```

### Branch Naming:

```bash
# Features
feature/employee-bulk-import
feature/pdf-reports
feature/mobile-app

# Bug fixes
fix/login-error
fix/sync-issue
fix/validation-bug

# Documentation
docs/api-reference
docs/deployment-guide

# Refactoring
refactor/database-queries
refactor/authentication

# Hot fixes (urgent)
hotfix/critical-security-issue
```

---

## 🧪 Testing Guidelines

### كل PR يجب أن يحتوي:

#### 1. Unit Tests
```javascript
// tests/unit/services/employee.service.test.js
describe('EmployeeService', () => {
  describe('create', () => {
    it('should create employee successfully', async () => {
      const data = {
        name: 'Ahmed Ali',
        employeeNo: '1001',
        email: 'ahmed@example.com'
      };
      
      const employee = await EmployeeService.create(data);
      
      expect(employee).toBeDefined();
      expect(employee.name).toBe(data.name);
    });
    
    it('should throw error if employeeNo exists', async () => {
      // Test duplicate
    });
    
    it('should validate email format', async () => {
      // Test validation
    });
  });
});
```

#### 2. Integration Tests
```javascript
// tests/integration/employees.test.js
describe('Employee API', () => {
  it('POST /api/v1/employees should create employee', async () => {
    const response = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ahmed Ali',
        employeeNo: '1001'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

#### 3. Test Coverage
```bash
# يجب أن يكون coverage > 80%
npm run test:coverage

# Report
Statements   : 85.23% ( 1234/1448 )
Branches     : 82.15% ( 456/555 )
Functions    : 87.50% ( 210/240 )
Lines        : 85.10% ( 1220/1434 )
```

---

## 📚 Documentation

### يجب تحديث التوثيق عند:

1. **إضافة API endpoint جديد** → Update REFERENCES.md
2. **إضافة ميزة جديدة** → Update FEATURES.md
3. **تغيير في Database** → Update DATABASE_SCHEMA.md
4. **تغيير في Setup** → Update README.md
5. **إضافة قاعدة برمجية** → Update GOLDEN_RULES.md

---

## 🎯 Priorities

### ما نحتاجه الآن (High Priority):

- [ ] Sequelize Models implementation
- [ ] Authentication endpoints
- [ ] Employee CRUD APIs
- [ ] Device management APIs
- [ ] Face sync service
- [ ] Unit tests

### ما نحتاجه لاحقاً (Medium Priority):

- [ ] Reports generation
- [ ] Analytics dashboard
- [ ] Mobile app features
- [ ] Advanced security

### Nice to Have (Low Priority):

- [ ] Dark mode
- [ ] Multi-language
- [ ] AI features
- [ ] Integrations

---

## 💬 التواصل | Communication

### القنوات:

- **GitHub Issues** - للـ bugs و features
- **GitHub Discussions** - للأسئلة والنقاشات
- **Email** - dev@yourproject.com
- **Telegram** - @YourProjectChannel (إذا موجود)

### قواعد النقاش:

- ✅ كن محترماً
- ✅ ابق في الموضوع
- ✅ قدم أمثلة وأدلة
- ✅ كن صبوراً
- ❌ لا تكرر نفس السؤال
- ❌ لا تطلب "urgent help" بدون سبب

---

## 🏆 المساهمون | Contributors

شكراً لكل من ساهم في تطوير هذا المشروع! 🙏

<!-- سيتم تحديثه تلقائياً -->

---

## ❓ أسئلة شائعة | FAQ

### س: كيف أبدأ كمساهم جديد؟
**ج:** ابدأ بـ Issues المعلمة بـ "good first issue" - هذه مهام بسيطة للمبتدئين.

### س: كم يستغرق review الـ PR؟
**ج:** عادة 1-3 أيام. إذا تأخر، اترك تعليق بعد أسبوع.

### س: هل يجب أن أفتح Issue قبل PR؟
**ج:** للميزات الكبيرة - نعم. للـ bug fixes البسيطة - لا.

### س: ماذا لو رُفِض PR الخاص بي؟
**ج:** لا تقلق! اقرأ التعليقات، عدل، وأعد المحاولة. التعلم من الأخطاء جزء من العملية.

### س: هل يمكنني العمل على أكثر من Issue؟
**ج:** نعم، لكن ركز على واحد حتى تنتهي منه.

---

## 📜 الخلاصة | Summary

### قبل كل Pull Request، تأكد:

- [ ] الكود يعمل بدون أخطاء
- [ ] Tests تمر كلها
- [ ] Code style صحيح (ESLint + Prettier)
- [ ] Documentation محدث
- [ ] Commit messages واضحة
- [ ] No console.log() متبقي
- [ ] No commented code
- [ ] Branch من آخر نسخة main

---

<div align="center">

**شكراً لمساهمتك! 🙏**

**معاً نبني نظام أفضل** 🚀

</div>
