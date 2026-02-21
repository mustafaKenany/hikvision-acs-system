# 🚀 دليل سريع: حل Error Code 7

## ❓ ما هي المشكلة؟

```
Error: Login failed. Error code: 7
```

**المعنى:** الجهاز لا يستجيب على البورت 8000 (SDK Port)

---

## 🎯 الحلول السريعة

### ✅ الحل 1: تفعيل البورت 8000 (الأفضل)

**5 خطوات بسيطة:**

1. **افتح المتصفح**
   ```
   http://192.168.1.84
   ```

2. **سجل دخول**
   - Username: `admin`
   - Password: `Admin@123`

3. **اذهب للإعدادات**
   ```
   Configuration → Network → Advanced Settings → Platform Access
   ```

4. **فعّل SDK Service**
   - ✅ Enable HCNetSDK Service
   - Port: `8000`
   - Save

5. **أعد تشغيل الجهاز**

---

### 🔄 الحل 2: استخدام البورت 80 (بديل)

**خطوات:**

1. أضف حقل `sdk_port` للجدول:
   ```bash
   cd backend/migrations
   .\run-migration.ps1
   ```

2. حدّث بورت الجهاز:
   ```sql
   UPDATE devices 
   SET sdk_port = 80 
   WHERE ip_address = '192.168.1.84';
   ```

3. أعد تشغيل Backend:
   ```bash
   npm start
   ```

⚠️ **تنبيه:** البورت 80 قد لا يعمل مع HCNetSDK Binary Protocol!

---

## 🔍 فحص البورتات

```powershell
# فحص البورت 80
Test-NetConnection 192.168.1.84 -Port 80

# فحص البورت 8000
Test-NetConnection 192.168.1.84 -Port 8000
```

**النتيجة المتوقعة:**
```
TcpTestSucceeded : True  ✅
```

---

## 📊 البورتات المهمة

| البورت | الاستخدام | الأهمية |
|--------|-----------|---------|
| **80** | HTTP/ISAPI، صفحة الويب | متوسطة |
| **8000** | SDK Binary Protocol، البصمات | **عالية ⭐** |
| 443 | HTTPS | منخفضة |
| 554 | RTSP (الفيديو) | منخفضة |

---

## 📁 الملفات المعدّلة

1. **biometricService.js**
   - الآن يدعم `sdk_port` من قاعدة البيانات
   - افتراضياً يستخدم 8000

2. **Migration SQL**
   - `backend/migrations/add-sdk-port-to-devices.sql`
   - يضيف حقل `sdk_port` لجدول `devices`

3. **PowerShell Script**
   - `backend/migrations/run-migration.ps1`
   - يطبق التغييرات تلقائياً

---

## ✅ التحقق النهائي

بعد تطبيق أي حل:

```bash
# 1. اختبر C# Service
cd backend
node test-sdk-service.js

# 2. جرب رفع صورة في النظام
```

**النتيجة المتوقعة:**
```
✅ تم تسجيل الوجه على الجهاز بنجاح!
```

---

## 🆘 إذا استمرت المشكلة

### Error Code 7 (ما زال موجود)
- تأكد من IP الجهاز صحيح
- جرب ping الجهاز: `ping 192.168.1.84`
- تحقق من Firewall

### Error Code 3 (Login Failed)
- اسم المستخدم أو كلمة السر خطأ
- حدّث معلومات الجهاز في Database

### Error Code 1 (SDK Not Init)
- C# Service مو شغال
- شغّله: `cd sdk-service; dotnet run`

---

## 📚 المصادر

- [دليل تفعيل البورت 8000](ENABLE-SDK-PORT-8000.md)
- [إصلاح مشكلة رفع الصور](FACE-UPLOAD-FIX.md)

---

**آخر تحديث:** 2026-02-21  
**الحالة:** ✅ جاهز للاستخدام
