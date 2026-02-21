# 🔄 ISAPI vs SDK Binary Protocol

## المشكلة الأصلية

جهازك `192.168.1.84` لا يدعم البورت **8000** (SDK Binary Protocol).
لكنه يدعم البورت **80** (HTTP/ISAPI REST API).

---

## ✅ الحل المطبّق

النظام الآن يدعم **طريقتين** لتسجيل الوجوه:

### 1️⃣ SDK Binary Protocol (Port 8000)
- **المميزات**: أسرع، أكثر موثوقية
- **العيوب**: يحتاج البورت 8000 مفتوح
- **الاستخدام**: عبر C# SDK Service

### 2️⃣ ISAPI HTTP REST API (Port 80/443) ⭐
- **المميزات**: يعمل على البورت 80 (HTTP)
- **العيوب**: أبطأ قليلاً
- **الاستخدام**: مباشرة من Node.js Backend

---

## 🎯 كيف يختار النظام تلقائياً؟

```javascript
// في biometricService.js

if (device.sdk_port === 80 || device.sdk_port === 443) {
    // استخدم ISAPI HTTP API
    uploadFaceViaISAPI(device, employee, imageBuffer);
} else {
    // استخدم SDK Binary Protocol
    uploadFaceViaSDKService(device, employee, imageBuffer);
}
```

---

## 📊 جهازك الحالي

```sql
SELECT * FROM devices WHERE ip_address = '192.168.1.84';
```

| ID | Name | IP | HTTP Port | SDK Port |
|----|------|-------------|-----------|----------|
| 4 | test | 192.168.1.84 | 80 | **80** ⭐ |

لأن `sdk_port = 80`، النظام سيستخدم **ISAPI HTTP API** تلقائياً! ✅

---

## 🧪 اختبار الاتصال

### 1. اختبر ISAPI:
```bash
node test-isapi-connection.js
```

### 2. اختبر البورتات:
```bash
.\test-port-8000.ps1
```

---

## 🚀 التشغيل

1. **أعد تشغيل Backend:**
   ```bash
   npm start
   ```

2. **افتح النظام:** http://localhost:5173

3. **جرب رفع صورة موظف** - يجب أن يعمل الآن! ✅

---

## 📝 ISAPI Endpoints المستخدمة

### رفع الوجه (Primary):
```
POST http://192.168.1.84/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
```

### رفع الوجه (Alternative):
```
POST http://192.168.1.84/ISAPI/AccessControl/UserInfo/Record?format=json
```

### حذف الوجه:
```
DELETE http://192.168.1.84/ISAPI/Intelligent/FDLib/FDSearch/Delete?FDID=1&FPID=123
```

---

## ⚙️ إعدادات إضافية

في `.env` يمكنك إجبار استخدام ISAPI:
```env
USE_ISAPI=true
```

---

## 🔧 استكشاف الأخطاء

### ❌ Error: Authentication Failed
```
الحل: تأكد من username/password الجهاز
```

### ❌ Error: 404 Not Found
```
الحل: الجهاز قد لا يدعم Face Recognition
تحقق من Firmware Version
```

### ❌ Error: Timeout
```
الحل: تأكد من الجهاز متصل بالشبكة
ping 192.168.1.84
```

---

## 📚 الملفات المعدّلة

| ملف | التغيير |
|-----|---------|
| `src/services/isapiFaceService.js` | ✅ جديد - خدمة ISAPI |
| `src/services/biometricService.js` | ✏️ معدّل - يختار الطريقة تلقائياً |
| `test-isapi-connection.js` | ✅ جديد - اختبار ISAPI |
| `migrations/run-migration.js` | ✓ موجود - تحديث sdk_port |

---

## 🎉 النتيجة

**الآن النظام يدعم كلا الطريقتين!**

- أجهزة بالبورت 8000 → SDK Binary ⚡
- أجهزة بالبورت 80 → ISAPI HTTP ✅

جهازك سيستخدم ISAPI تلقائياً لأن `sdk_port = 80`.
