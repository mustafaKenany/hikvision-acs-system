# 📱 دليل سريع لربط أجهزة Hikvision

## ✅ حالة النظام
- **قاعدة البيانات**: سليمة ✅ (18 جدول، 7 مؤسسات، 6 موظفين)
- **Backend API**: يعمل على Port 3000 ✅
- **File Upload**: جاهز ✅
- **Device API**: 9 endpoints جاهزة ✅

---

## 🔌 ربط جهاز Hikvision الخاص بك

### 1️⃣ تحضير الجهاز
```
✓ تأكد من اتصال الجهاز بنفس الشبكة (LAN/WiFi)
✓ احصل على IP Address للجهاز من إعدادات الشبكة
✓ تأكد من تفعيل SDK في إعدادات الجهاز
✓ Default credentials: admin / 12345 (غيّرها إذا لزم)
```

### 2️⃣ اختبار الاتصال
```powershell
# اختبر ping للجهاز
ping 192.168.1.100

# يجب أن تحصل على رد
```

### 3️⃣ إضافة الجهاز عبر API

#### سجل دخول أولاً:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "super@hikvision-acs.com",
  "password": "Super@123456"
}

# احفظ الـ access_token
```

#### أضف الجهاز:
```bash
POST http://localhost:3000/api/devices
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Main Entrance Controller",
  "device_type": "face_recognition",
  "ip_address": "192.168.1.100",
  "port": 80,
  "username": "admin",
  "password": "12345",
  "organization_id": 1,
  "location": "Main Building - Entrance"
}
```

### 4️⃣ اختبر الاتصال بالجهاز
```bash
POST http://localhost:3000/api/devices/1/test-connection
Authorization: Bearer YOUR_TOKEN
```

### 5️⃣ مزامنة البيانات
```bash
POST http://localhost:3000/api/devices/1/sync
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 الـ Endpoints المتاحة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/devices` | جلب قائمة الأجهزة |
| GET | `/api/devices/:id` | جلب جهاز معين |
| POST | `/api/devices` | إضافة جهاز جديد |
| PUT | `/api/devices/:id` | تحديث جهاز |
| DELETE | `/api/devices/:id` | حذف جهاز |
| POST | `/api/devices/:id/test-connection` | اختبار الاتصال |
| POST | `/api/devices/:id/sync` | مزامنة البيانات |
| GET | `/api/devices/:id/status` | حالة الجهاز |
| POST | `/api/devices/:id/activate` | تفعيل جهاز |

---

## 🔧 معلومات الشبكة

### IP Address الخاص بالسيرفر:
```powershell
# لمعرفة IP الخاص بك:
ipconfig | findstr IPv4
```

### فتح Port 3000 (إذا لزم):
```powershell
# Windows Firewall
New-NetFirewallRule -DisplayName "Hikvision ACS API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## 📱 أنواع الأجهزة المدعومة

- `face_recognition` - أجهزة التعرف على الوجه
- `fingerprint` - أجهزة البصمة
- `card_reader` - قارئات البطاقات
- `mixed` - أجهزة مختلطة (تدعم أكثر من نوع)

---

## 💡 نصائح مهمة

1. **الشبكة**: تأكد من أن الجهاز والسيرفر في نفس الـ Subnet
2. **الأمان**: غيّر كلمة المرور الافتراضية للجهاز
3. **الصلاحيات**: تحتاج super_admin أو admin لإضافة أجهزة
4. **السعة**: تحقق من max_devices للمؤسسة قبل الإضافة
5. **الاختبار**: استخدم test-connection قبل المزامنة

---

## 📂 WebSDK

الـ WebSDK موجود في: `WebSDK V3.3.1/`

للاستخدام:
- `demo/index.html` - مثال تطبيق
- `codebase/webVideoCtrl.js` - المكتبة الرئيسية

---

## 🐛 استكشاف الأخطاء

### الجهاز لا يستجيب:
- ✓ تحقق من ping
- ✓ تأكد من Port 80 مفتوح
- ✓ راجع إعدادات Firewall

### خطأ في الاتصال:
- ✓ تحقق من Username/Password
- ✓ تأكد من تفعيل SDK في الجهاز
- ✓ راجع IP Address

### فشل المزامنة:
- ✓ تحقق من صلاحيات الجهاز
- ✓ تأكد من مساحة التخزين
- ✓ راجع audit_logs للتفاصيل

---

## 📞 الدعم

راجع التوثيق الكامل:
- `docs/system-readiness-report.html` - تقرير الجاهزية
- `docs/file-upload-api.html` - دليل رفع الملفات
- `docs/organizations-api.html` - دليل المؤسسات

---

**آخر تحديث**: February 7, 2026
**الحالة**: ✅ جاهز للعمل 100%
