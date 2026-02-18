# Employee Validation & Auto-Increment Update (2026-02-14)

## التغييرات المطبقة ✅

### 1. رقم الموظف (Employee Number) - Auto Increment

**قبل:**
- المستخدم يدخل رقم الموظف يدوياً
- احتمال تكرار الأرقام
- صعوبة في إدارة الأرقام

**بعد:**
- ✅ رقم الموظف يتم توليده تلقائياً (Auto-generated)
- ✅ Format: `EMP-00001`, `EMP-00002`, `EMP-00003`...
- ✅ Sequential numbering لكل منظمة
- ✅ لا يمكن للمستخدم تعديله

**الكود:**
```javascript
// backend/src/services/employeeService.js
async function generateEmployeeNo(organizationId) {
  const lastEmployee = await Employee.findOne({
    where: { organization_id: organizationId },
    order: [['id', 'DESC']],
    attributes: ['employee_no']
  });

  if (!lastEmployee) {
    return 'EMP-00001';
  }

  const lastNumber = parseInt(lastEmployee.employee_no.split('-')[1]) || 0;
  const newNumber = lastNumber + 1;
  
  return `EMP-${String(newNumber).padStart(5, '0')}`;
}
```

---

### 2. Unique Validation للحقول المهمة

**الحقول التي يجب أن تكون unique:**

#### 2.1 الاسم الكامل (name) - UNIQUE ✅
- ✅ لا يمكن تكرار نفس الاسم في النظام
- ✅ Validation في Backend و Frontend
- ✅ Database constraint
- ❌ رسالة خطأ: "الاسم موجود مسبقاً. الرجاء إدخال اسم مختلف"

#### 2.2 رقم الهاتف (phone) - UNIQUE ✅
- ✅ لا يمكن تكرار نفس رقم الهاتف
- ✅ Partial unique (only if not null)
- ✅ Validation في Backend
- ❌ رسالة خطأ: "رقم الهاتف مستخدم مسبقاً"

#### 2.3 البريد الإلكتروني (email) - UNIQUE ✅
- ✅ لا يمكن تكرار نفس الإيميل
- ✅ Partial unique (only if not null)
- ✅ Case-insensitive (يحول لـ lowercase قبل الحفظ)
- ❌ رسالة خطأ: "البريد الإلكتروني مستخدم مسبقاً"

**الحقول الأخرى:**
- ❌ Department - يمكن تكرارها (عادي)
- ❌ Position - يمكن تكرارها (عادي)
- ❌ Organization - بالتأكيد يمكن أن يكون أكثر من موظف في نفس المنظمة

---

### 3. التحقق من الاسم الثلاثي

**المطلوب:**
- ✅ يفضل إدخال الاسم الثلاثي (الاسم الأول + اسم الأب + العائلة)
- ✅ الحد الأدنى: اسمين على الأقل (الاسم الأول + الأخير)

**Validation:**
```javascript
// Frontend validation
fullName: v => {
  if (!v) return 'هذا الحقل مطلوب'
  const parts = v.trim().split(/\s+/)
  if (parts.length < 2) {
    return 'الرجاء إدخال الاسم الكامل (الاسم الأول والأخير على الأقل)'
  }
  return true
}

// Backend validation
function validateFullName(name) {
  const nameParts = name.trim().split(/\s+/);
  
  if (nameParts.length < 2) {
    return { 
      valid: false, 
      message: 'الرجاء إدخال الاسم الكامل (الاسم الأول والأخير على الأقل)' 
    };
  }
  
  if (nameParts.length === 2) {
    return { 
      valid: true, 
      warning: 'يفضل إدخال الاسم الثلاثي (الاسم الأول واسم الأب والعائلة)' 
    };
  }
  
  return { valid: true };
}
```

---

## Database Migration

**File:** `backend/migrations/20260214-add-unique-constraints-employees.js`

**التغييرات في قاعدة البيانات:**
```sql
-- 1. Unique constraint على الاسم
ALTER TABLE employees ADD CONSTRAINT unique_employee_name UNIQUE (name);

-- 2. Unique index على التلفون (partial - فقط للقيم الموجودة)
CREATE UNIQUE INDEX unique_employee_phone 
ON employees (phone) 
WHERE phone IS NOT NULL AND phone != '';

-- 3. Unique index على الإيميل (partial - فقط للقيم الموجودة)
CREATE UNIQUE INDEX unique_employee_email 
ON employees (email) 
WHERE email IS NOT NULL AND email != '';
```

**تشغيل Migration:**
```bash
cd backend
node run-migrations.js
```

---

## Frontend Changes

### EmployeeDialog.vue

**التغييرات:**

1. **حقل رقم الموظف:**
   - ❌ REMOVED من form في حالة الإنشاء
   - ✅ READ-ONLY في حالة التعديل
   - ℹ️ Hint: "يتم إنشاء الرقم تلقائياً"

2. **حقل الاسم:**
   - ✅ Label: "الاسم الكامل (ثلاثي) *"
   - ✅ Hint: "يفضل إدخال الاسم الثلاثي (مثال: أحمد محمد علي) - يجب أن يكون الاسم مختلف عن الموظفين الآخرين"
   - ✅ Validation: يجب إدخال اسمين على الأقل

3. **حقل التلفون:**
   - ✅ Hint: "يجب أن يكون رقم الهاتف مختلف عن جميع الموظفين"

4. **حقل الإيميل:**
   - ✅ Hint: "يجب أن يكون الإيميل مختلف عن جميع الموظفين"

---

## API Changes

### POST /api/employees (Create)

**Before:**
```json
{
  "employee_no": "EMP-001",  // ❌ Required from user
  "name": "Ahmed Ali",
  "email": "ahmed@test.com",
  "phone": "0501234567"
}
```

**After:**
```json
{
  // ❌ employee_no is NOT sent - auto-generated
  "name": "Ahmed Mohammad Ali",  // ✅ Must be unique, at least 2 words
  "email": "ahmed@test.com",     // ✅ Must be unique (if provided)
  "phone": "0501234567"          // ✅ Must be unique (if provided)
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "employee_no": "EMP-00001",  // ✅ Auto-generated
    "name": "Ahmed Mohammad Ali",
    "email": "ahmed@test.com",
    "phone": "0501234567"
  }
}
```

**Error Responses:**
```json
// Duplicate name
{
  "status": "error",
  "message": "الاسم موجود مسبقاً. الرجاء إدخال اسم مختلف أو إضافة رقم الهاتف للتمييز",
  "statusCode": 409
}

// Duplicate phone
{
  "status": "error",
  "message": "رقم الهاتف مستخدم مسبقاً",
  "statusCode": 409
}

// Duplicate email
{
  "status": "error",
  "message": "البريد الإلكتروني مستخدم مسبقاً",
  "statusCode": 409
}

// Invalid name (less than 2 words)
{
  "status": "error",
  "message": "خطأ في التحقق من البيانات",
  "details": [
    {
      "field": "name",
      "message": "الرجاء إدخال الاسم الكامل (الاسم الأول والأخير على الأقل)"
    }
  ],
  "statusCode": 400
}
```

---

## Testing Scenarios

### ✅ Scenario 1: Create Employee - Success
```
Input:
- Name: "أحمد محمد علي"
- Email: "ahmad@company.com"
- Phone: "0501234567"

Expected:
- employee_no: "EMP-00001" (auto-generated)
- Status: 201 Created
```

### ❌ Scenario 2: Duplicate Name
```
Input (after Scenario 1):
- Name: "أحمد محمد علي"  (same name)
- Email: "ahmad2@company.com"
- Phone: "0509876543"

Expected:
- Error: "الاسم موجود مسبقاً"
- Status: 409 Conflict
```

### ❌ Scenario 3: Duplicate Phone
```
Input:
- Name: "خالد سعيد أحمد"
- Email: "khaled@company.com"
- Phone: "0501234567"  (same as Scenario 1)

Expected:
- Error: "رقم الهاتف مستخدم مسبقاً"
- Status: 409 Conflict
```

### ❌ Scenario 4: Invalid Name (Single Word)
```
Input:
- Name: "أحمد"  (only one word)

Expected:
- Error: "الرجاء إدخال الاسم الكامل (الاسم الأول والأخير على الأقل)"
- Status: 400 Bad Request
```

### ✅ Scenario 5: Update Employee - Success
```
Input:
- ID: 1 (existing employee)
- Name: "أحمد محمد علي السعيد"  (updated name)

Expected:
- employee_no: "EMP-00001" (unchanged)
- Name updated successfully
- Status: 200 OK
```

---

## Rollback (إذا احتجت التراجع)

```bash
# Rollback migration
cd backend
node run-migrations.js --rollback

# Or manually:
psql -U postgres -d hikvision_acs_dev
DROP INDEX IF EXISTS unique_employee_phone;
DROP INDEX IF EXISTS unique_employee_email;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS unique_employee_name;
```

---

## Summary الخلاصة

### ✅ ما تم إنجازه:
1. ✅ Auto-increment لرقم الموظف (EMP-00001, EMP-00002...)
2. ✅ Unique validation للاسم الكامل
3. ✅ Unique validation لرقم الهاتف
4. ✅ Unique validation للبريد الإلكتروني
5. ✅ التحقق من الاسم الثلاثي (حد أدنى: اسمين)
6. ✅ Database migration للـ constraints
7. ✅ Frontend updates (إخفاء employee_no، hints، validation)
8. ✅ Backend validation في createEmployee و updateEmployee
9. ✅ Error messages واضحة باللغة العربية

### 📋 الحقول الباقية (يمكن تكرارها):
- ✅ Department (القسم)
- ✅ Position (المنصب)  
- ✅ Organization (المنظمة)
- ✅ Notes (الملاحظات)
- ✅ Hire Date (تاريخ التوظيف)

### 🎯 الهدف المحقق:
- منع التكرار في البيانات المهمة
- سهولة في إدارة أرقام الموظفين
- UX أفضل مع رسائل واضحة
- Data integrity على مستوى Database و Application
