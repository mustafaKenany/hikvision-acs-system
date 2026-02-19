# 🧪 Organizations Module - Testing Checklist

## 📋 **دليل الفحص الشامل**

---

## 1️⃣ **فحص Redis Cache**

### الخطوات:
1. افتح **DevTools** → Console (F12)
2. اذهب لصفحة المنظمات
3. **First Load** - تحقق من:
   ```
   ❌ Cache MISS for organizations list - fetching from DB
   ```
4. اضغط **Refresh** (F5) - تحقق من:
   ```
   ✅ Cache HIT for organizations list
   ```
5. **جرب الفلترة** - كل فلتر يسوي cache key جديد:
   - فلتر حسب Subscription Plan
   - فلتر حسب Active/Inactive
   - Search بالاسم

### النتيجة المتوقعة:
- ✅ أول request: CACHE MISS (~50-80ms)
- ⚡ ثاني request: CACHE HIT (~20-40ms) **أسرع**
- 🔄 بعد الفلترة: CACHE MISS جديد (لأن الـ cache key مختلف)

---

## 2️⃣ **فحص CRUD Operations**

### ✅ **Create (إضافة منظمة)**

**الخطوات:**
1. اضغط **"إضافة منظمة"**
2. املأ البيانات:
   - ✅ الاسم (مطلوب)
   - ✅ البريد الإلكتروني (unique)
   - ✅ الهاتف
   - ✅ العنوان
   - ✅ خطة الاشتراك
3. اضغط **حفظ**
4. تحقق من:
   - ✅ Toast notification: "تم حفظ المنظمة بنجاح"
   - ✅ المنظمة الجديدة تظهر في القائمة (بعد 2 ثانية)
   - ✅ Cache تم تحديثه

**Test Cases:**
- ✅ إضافة بدون اسم → يرفض
- ✅ إضافة بـ email مكرر → يرفض
- ✅ إضافة ببيانات صحيحة → ينجح

---

### ✏️ **Update (تعديل منظمة)**

**الخطوات:**
1. اضغط **أيقونة التعديل** (✏️) على منظمة موجودة
2. عدّل البيانات:
   - غيّر الاسم
   - غيّر خطة الاشتراك
3. اضغط **حفظ**
4. تحقق من:
   - ✅ Toast notification: "تم حفظ المنظمة بنجاح"
   - ✅ البيانات المحدثة تظهر
   - ✅ Cache تم invalidation (Console: MISS ثم HIT)

**Test Cases:**
- ✅ تعديل الاسم فقط → ينجح
- ✅ تعديل Email لـ email موجود → يرفض
- ✅ تعديل Subscription Plan → ينجح

---

### 🗑️ **Delete (حذف منظمة)**

**الخطوات:**
1. اضغط **أيقونة الحذف** (🗑️) على منظمة
2. اقرأ رسالة التحذير
3. اضغط **"حذف / تعطيل"**
4. تحقق من:
   - **إذا كانت فارغة**: تظهر رسالة "تم حذف المنظمة نهائياً"
   - **إذا فيها موظفين/أجهزة**: تظهر "تم تعطيل المنظمة وجميع البيانات المرتبطة"
   - ✅ المنظمة تختفي من القائمة (أو تظهر كـ inactive)

**Test Cases:**
- ✅ حذف منظمة فارغة → حذف نهائي
- ✅ حذف منظمة فيها موظفين → تعطيل soft delete
- ✅ Cache يتحدث → Console: invalidation

---

## 3️⃣ **فحص Bulk Actions**

### ☑️ **Bulk Selection:**
1. اضغط **checkbox في Header** → يحدد الكل
2. أو حدد منظمات محددة واحدة واحدة
3. تحقق من:
   - ✅ الـ Blue Toolbar يظهر
   - ✅ العدد صحيح: "تم تحديد X منظمة"

---

### ✅ **Bulk Activate:**
1. حدد عدة منظمات **غير نشطة**
2. اضغط **أيقونة ✅** من الـ Toolbar
3. تحقق من:
   - ✅ Toast: "تم تفعيل X منظمة"
   - ✅ الحالة تتغير → **نشطة** (Status = Active)
   - ✅ Cache يتحدث

---

### ❌ **Bulk Deactivate:**
1. حدد عدة منظمات **نشطة**
2. اضغط **أيقونة ❌** من الـ Toolbar
3. تحقق من:
   - ✅ Toast: "تم إلغاء تفعيل X منظمة"
   - ✅ الحالة تتغير → **غير نشطة**
   - ✅ Cache يتحدث

---

### 🗑️ **Bulk Delete:**
1. حدد عدة منظمات
2. اضغط **أيقونة 🗑️** من الـ Toolbar
3. Dialog يظهر مع رسالة تحذير
4. اضغط **"حذف / تعطيل"**
5. تحقق من:
   - ✅ Toast: "تم حذف X منظمة"
   - ✅ المنظمات تختفي أو تتعطل
   - ✅ Cache يتحدث

---

### 📤 **Export Selected:**
1. حدد عدة منظمات
2. اضغط **أيقونة 📤** من الـ Toolbar
3. تحقق من:
   - ✅ ملف Excel ينزّل
   - ✅ فقط المنظمات المحددة موجودة في الملف
   - ✅ Toast: "تم التصدير بنجاح"

---

## 4️⃣ **فحص Export**

### 📗 **Export Excel:**
1. اضغط زر **"تصدير Excel"** (الأخضر)
2. ملف `.xlsx` ينزّل
3. **افتح الملف** بـ Excel
4. تحقق من:
   - ✅ كل البيانات موجودة
   - ✅ Columns منظمة بالعربي
   - ✅ لا توجد مشاكل ترميز
   - ✅ البيانات:
     - الاسم
     - البريد الإلكتروني
     - الهاتف
     - العنوان
     - خطة الاشتراك (مجاني/أساسي/احترافي/مؤسسي)
     - عدد الموظفين
     - عدد الأجهزة
     - الحالة (نشطة/غير نشطة)
     - تاريخ الإنشاء

---

### 📕 **Export PDF:**
1. اضغط زر **"تصدير PDF"** (الأحمر)
2. ملف `.pdf` ينزّل
3. **افتح الملف** بـ PDF Reader
4. تحقق من:
   - ✅ Header: "قائمة المنظمات"
   - ✅ Stats في الأعلى: إجمالي | نشطة | غير نشطة | التاريخ
   - ✅ جدول منسق بـ RTL
   - ✅ Columns من اليمين لليسار
   - ✅ البيانات واضحة وقابلة للطباعة
   - ✅ Alternate row colors (رمادي فاتح)

---

## 5️⃣ **فحص Filters**

### 🔍 **Search:**
1. اكتب في خانة **"بحث"**:
   - اسم منظمة
   - email
   - phone
2. تحقق من:
   - ✅ النتائج تتفلتر فوراً
   - ✅ يبحث في Name, Email, Phone

---

### 📋 **Subscription Plan Filter:**
1. اختر خطة من Dropdown:
   - مجاني
   - أساسي
   - احترافي
   - مؤسسي
2. اضغط **"تطبيق"**
3. تحقق من:
   - ✅ فقط المنظمات بهذه الخطة تظهر
   - ✅ Console: Cache MISS (لأن filter جديد)

---

### 🔄 **Status Filter:**
1. اختر من Dropdown:
   - نشطة
   - غير نشطة
2. اضغط **"تطبيق"**
3. تحقق من:
   - ✅ فقط المنظمات بهذه الحالة تظهر

---

### 🗑️ **Clear Filters:**
1. املأ الفلاتر
2. اضغط **Clear** على كل فلتر
3. تحقق من:
   - ✅ جميع المنظمات تظهر مرة ثانية

---

## 6️⃣ **فحص Performance (Network Tab)**

### الخطوات:
1. افتح **DevTools** → **Network Tab**
2. اذهب لصفحة المنظمات
3. **First Request:**
   - ابحث عن Request: `GET /api/organizations`
   - شوف **Time**: مثلاً ~80ms
4. **اضغط Refresh** (F5)
5. **Second Request:**
   - نفس الـ Request: `GET /api/organizations`
   - شوف **Time**: مثلاً ~35ms (أسرع!)

### النتيجة المتوقعة:
- ✅ **MISS**: 50-100ms
- ⚡ **HIT**: 20-40ms (تقريباً **50% أسرع**)

---

## 7️⃣ **فحص Toast Notifications**

### الخطوات:
1. قم بأي عملية (Create/Update/Delete)
2. تحقق من:
   - ✅ Toast notification تظهر في الأسفل
   - ✅ النص واضح ومفهوم
   - ✅ اللون مناسب:
     - 🟢 Green: نجاح
     - 🔴 Red: خطأ
     - 🔵 Blue: معلومة
   - ✅ تختفي تلقائياً بعد 3 ثواني
   - ✅ زر "إغلاق" يعمل

**Test:**
- ✅ لا يوجد Success Dialog مزعج (تم استبداله بـ Toast)

---

## 8️⃣ **فحص Database Indexes**

### طريقة الفحص (من Backend):
```sql
-- تحقق من الـ indexes الموجودة
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'organizations';
```

### النتيجة المتوقعة (8 indexes):
1. ✅ `idx_organizations_email` (UNIQUE)
2. ✅ `idx_organizations_subscription_plan`
3. ✅ `idx_organizations_is_active`
4. ✅ `idx_organizations_active_plan`
5. ✅ `idx_organizations_subscription_end`
6. ✅ `idx_organizations_name`
7. ✅ `idx_organizations_created_at`
8. ✅ `idx_organizations_phone`

---

## 9️⃣ **فحص Error Handling**

### Test Cases:

#### ❌ **Validation Errors:**
1. محاولة إضافة بدون اسم → Error
2. محاولة إضافة بـ Email مكرر → "البريد الإلكتروني موجود مسبقاً"
3. محاولة إضافة بـ Email غير صحيح → "البريد الإلكتروني غير صحيح"

#### ❌ **Network Errors:**
1. افصل الـ Backend
2. حاول إضافة منظمة → Toast Error: "حدث خطأ..."

---

## 🎯 **ملخص Checklist سريع:**

- [ ] **Cache HIT/MISS** يعمل في Console
- [ ] **Create** منظمة جديدة ينجح
- [ ] **Update** منظمة موجودة ينجح
- [ ] **Delete** منظمة فارغة → حذف نهائي
- [ ] **Delete** منظمة فيها بيانات → soft delete (تعطيل)
- [ ] **Bulk Selection** يعمل (checkbox)
- [ ] **Bulk Activate** يعمل
- [ ] **Bulk Deactivate** يعمل
- [ ] **Bulk Delete** يعمل
- [ ] **Export Selected** يعمل
- [ ] **Export Excel** ينتج ملف صحيح
- [ ] **Export PDF** ينتج ملف صحيح
- [ ] **Search** يبحث في Name/Email/Phone
- [ ] **Filter by Subscription** يعمل
- [ ] **Filter by Status** يعمل
- [ ] **Toast Notifications** تظهر بشكل صحيح
- [ ] **Performance** - Request الثاني أسرع من الأول
- [ ] **Validation** تمنع البيانات الخاطئة

---

## 📊 **Expected Results:**

| الميزة | النتيجة المتوقعة |
|--------|------------------|
| Cache MISS | ~50-100ms |
| Cache HIT | ~20-40ms ⚡ |
| Create | Toast → 2s delay → تظهر في القائمة |
| Update | Toast → 2s delay → تظهر التعديلات |
| Delete (Empty) | "تم حذف المنظمة نهائياً" |
| Delete (Data) | "تم تعطيل المنظمة" |
| Bulk Actions | Toast + تحديث القائمة |
| Export Excel | ملف .xlsx صحيح |
| Export PDF | ملف .pdf منسق RTL |
| Filters | نتائج فورية |
| Performance | HIT أسرع 50% من MISS |

---

## 🚀 **جاهز للفحص!**

**URL:** http://localhost:5173  
**Login:** admin@system.com / admin123  
**الصفحة:** المنظمات (Organizations)

---

**ملاحظات:**
- افتح Console دائماً لمتابعة Cache logs
- افتح Network Tab لفحص Performance
- جرب كل سيناريو مرة واحدة على الأقل
- إذا واجهت أي مشكلة، تحقق من Console للـ errors

**Happy Testing! 🎉**
