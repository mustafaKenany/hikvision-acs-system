# 🎭 Mock Device Service - دليل الاستخدام

## ✅ تم تفعيل النظام للعمل بدون جهاز حقيقي!

تم إضافة **Mock Device Service** كامل يسمح لك بتطوير واختبار النظام **بدون الحاجة لوجود جهاز Hikvision حقيقي**.

---

## 📦 ما تم إضافته

### Backend (خادم Node.js)

✅ **ملفات جديدة:**
1. `backend/src/services/mockDeviceService.js` - محاكي الجهاز الكامل
2. `backend/src/services/biometricService.js` - خدمة البيانات البيومترية  
3. `backend/src/controllers/biometricController.js` - معالج API
4. `backend/src/routes/biometricRoutes.js` - مسارات API الجديدة

✅ **Endpoints جديدة:**
```
POST   /api/biometrics/face/register      - تسجيل بصمة الوجه
DELETE /api/biometrics/face/:employeeId   - حذف بصمة الوجه
GET    /api/biometrics/face/:employeeId   - حالة بصمة الوجه

POST   /api/biometrics/card/register      - تسجيل بطاقة RFID
DELETE /api/biometrics/card/:employeeId   - حذف البطاقة
GET    /api/biometrics/card/:employeeId   - حالة البطاقة

POST   /api/biometrics/sync/:employeeId   - مزامنة كامل البيانات
GET    /api/biometrics/status/:employeeId - الحالة الشاملة
```

### Frontend (واجهة Vue.js)

✅ **مكونات جديدة:**
1. `frontend/src/components/dialogs/FaceRegistrationDialog.vue` - واجهة تسجيل الوجه
2. `frontend/src/components/dialogs/CardRegistrationDialog.vue` - واجهة تسجيل البطاقة

✅ **تحديثات:**
- `EmployeeDialog.vue` - تم إضافة أزرار تسجيل البيومتري

---

## 🚀 كيفية التشغيل

### الخطوة 1: تفعيل Mock Mode

#### في Backend:

```bash
cd backend
```

**أنشئ/حدّث ملف `.env`:**
```dotenv
# إضافة هذا السطر
USE_MOCK_DEVICE=true
NODE_ENV=development
```

**تثبيت multer (إذا لم يكن موجوداً):**
```bash
npm install multer
```

####  إعادة تشغيل Backend:
```bash
npm start
```

### الخطوة 2: تشغيل Frontend

```bash
cd frontend
npm run dev
```

---

## 🧪 كيفية الاختبار

### 1. تسجيل موظف جديد

1. افتح المتصفح: `http://localhost:5173`
2. سجل دخول بالحساب: `admin@system.com / admin123`
3. اذهب إلى **إدارة الموظفين**
4. اضغط **إضافة موظف جديد**
5. املأ البيانات واحفظ

### 2. تسجيل بصمة الوجه

1. من قائمة الموظفين، اضغط **تعديل** على الموظف
2. ستجد أزرار جديدة في قسم الصورة:
   - **تسجيل بصمة الوجه** (أخضر)
   - **تسجيل بطاقة RFID** (أزرق)

3. اضغط **تسجيل بصمة الوجه**
4. اختر الجهاز من القائمة
5. ارفع صورة للوجه (JPG/PNG، حتى 5MB)
6. اضغط **تسجيل الوجه**
7. 🎉 سيظهر لك: **"تم تسجيل الوجه بنجاح (Mock)"**

### 3. تسجيل بطاقة RFID

1. من نفس نافذة تعديل الموظف
2. اضغط **تسجيل بطاقة RFID**
3. اختر الجهاز
4. أدخل رقم البطاقة (8-10 أرقام)
5. اختر نوع البطاقة (RFID/NFC/QR/Barcode)
6. اضغط **تسجيل البطاقة**
7. 🎉 سيظهر لك: **"تم تسجيل الكارت بنجاح (Mock)"**

---

## 📊 ميزات Mock Service

### ✅ ما يعمل الآن:

- ✅ تسجيل بصمة الوجه (مع رفع صورة)
- ✅ حذف بصمة الوجه
- ✅ تسجيل البطاقة RFID/NFC  
- ✅ حذف البطاقة
- ✅ اختبار اتصال الجهاز
- ✅ سحب السجلات (يولّد سجلات وهمية)
- ✅ مزامنة البيانات البيومترية

### 🎭 السلوك الواقعي:

- تأخير شبكي واقعي (300-1200ms)
- نسبة نجاح 90% (يفشل أحياناً للاختبار)
- توليد بيانات واقعية
- Logging كامل في Console
- رسائل نجاح/فشل واقعية

### 📝 ما يتم حفظه في Database:

- ✅ FaceTemplate (في جدول `face_templates`)
- ✅ CardTemplate (في جدول `card_templates`)
- ✅ Employee Metadata (has_face, has_card, etc.)
- ✅ Audit Logs (تتبع كل العمليات)

---

## 🔧 التخصيص

### تغيير نسبة النجاح:

في `mockDeviceService.js`:
```javascript
// السطر 25 - تسجيل الوجه
const success = Math.random() > 0.1; // 90% نجاح

// غيرها إلى 100% نجاح:
const success = true;
```

### تغيير التأخير الزمني:

```javascript
// السطر 47 - تسجيل الكارت
await this.delay(300); // 300ms

// غيرها إلى أسرع:
await this.delay(100); // 100ms
```

### إيقاف Log Messages:

```javascript
// علّق هذه السطور:
// console.log('🎭 Mock: Registering face...');
```

---

## 🔀 التبديل إلى الجهاز الحقيقي

عندما يصبح الجهاز الحقيقي متاحاً:

### 1. غيّر `.env`:
```dotenv
USE_MOCK_DEVICE=false
```

### 2. أضف معلومات الجهاز:
```dotenv
HIKVISION_DEFAULT_USERNAME=admin
HIKVISION_DEFAULT_PASSWORD=your_password
```

### 3. أعد تشغيل Backend:
```bash
npm start
```

✨ **سيتم التبديل تلقائياً إلى SDK الحقيقي!**

---

## 🐛 استكشاف الأخطاء

### المشكلة: "multer is not defined"
```bash
cd backend
npm install multer
npm start
```

### المشكلة: "Cannot POST /api/biometrics/..."
تأكد من:
1. `biometricRoutes.js` موجود في `backend/src/routes/`
2. تم إضافته في `app.js`: `app.use('/api/ biometrics', biometricRoutes)`
3. أعد تشغيل Backend

### المشكلة: الصورة كبيرة جداً
- الحد الأقصى: 5MB
- استخدم ضغط الصورة قبل الرفع
- أو غيّر الحد في `biometricRoutes.js` السطر 12:
  ```javascript
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  ```

---

## 📸 لقطات شاشة

### تسجيل بصمة الوجه:
```
┌─────────────────────────────────┐
│  تسجيل بصمة الوجه              │
├─────────────────────────────────┤
│  الموظف: أحمد محمد علي          │
│  رقم الموظف: EMP-00001          │
│                                 │
│  اختر الجهاز: [جهاز الدخول]    │
│  صورة الوجه: [ارفع صورة]       │
│                                 │
│  [معاينة الصورة]                │
│                                 │
│  [إلغاء]    [تسجيل الوجه]      │
└─────────────────────────────────┘
```

### تسجيل بطاقة RFID:
```
┌─────────────────────────────────┐
│  تسجيل بطاقة RFID               │
├─────────────────────────────────┤
│  الموظف: أحمد محمد علي          │
│                                 │
│  اختر الجهاز: [جهاز الدخول]    │
│  رقم البطاقة: [1234567890]     │
│  نوع البطاقة: [RFID]           │
│                                 │
│  [إلغاء]    [تسجيل البطاقة]    │
└─────────────────────────────────┘
```

---

## ✅ الخطوات التالية

### للتطوير:
- [x] تسجيل الوجه
- [x] تسجيل البطاقة  
- [x] حذف البيومتري
- [ ] تقارير البيومتري (قريباً)
- [ ] Bulk Registration (قريباً)

### للإنتاج:
1. اختبر مع الجهاز الحقيقي
2. عطّل Mock Mode
3. اختبر على بيئة Production
4. Deploy!

---

## 📞 المساعدة

إذا واجهت أي مشكلة:

1. **تحقق من Logs:**
   ```bash
   # في Backend terminal
   # ستجد رسائل 🎭 Mock: ...
   ```

2. **تحقق من Browser Console:**
   ```
   F12 → Console
   # ستجد رسائل Success/Error
   ```

3. **تحقق من Network:**
   ```
   F12 → Network → XHR
   # تابع الطلبات للـ /api/biometrics/...
   ```

---

**🎉 مبروك! نظامك الآن جاهز للتطوير بدون الحاجة للجهاز الحقيقي!**

**تاريخ الإنشاء:** 17 فبراير 2026  
**الإصدار:** 1.0.0 - Mock Device Service
