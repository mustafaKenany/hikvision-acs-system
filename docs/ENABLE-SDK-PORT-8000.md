# 🔌 تفعيل البورت 8000 (SDK Port) في أجهزة Hikvision

## 📋 الفرق بين البورتات:

| البورت | الاستخدام | البروتوكول |
|--------|-----------|------------|
| **80** | صفحة الويب، ISAPI | HTTP |
| **8000** | SDK، البصمات، التحكم بالجهاز | HCNetSDK Binary Protocol |

---

## ✅ طريقة تفعيل البورت 8000:

### **الطريقة 1: من صفحة الويب** (الأسهل)

#### **الخطوات:**

1. **افتح المتصفح** واذهب لصفحة الجهاز:
   ```
   http://192.168.1.84
   ```

2. **سجل دخول** باستخدام:
   - Username: `admin`
   - Password: `Admin@123` (أو كلمة السر الخاصة بك)

3. **اذهب للإعدادات:**
   ```
   Configuration → Network → Advanced Settings → Platform Access
   ```
   أو
   ```
   الإعدادات → الشبكة → إعدادات متقدمة → وصول المنصة
   ```

4. **فعّل SDK Service:**
   - ✅ Enable HCNetSDK Service
   - Port: `8000`
   - Maximum Connections: `128` (أو أكثر)

5. **احفظ الإعدادات** واضغط **Save**

6. **أعد تشغيل الجهاز** (مهم!)

---

### **الطريقة 2: من برنامج SADP Tool** 

إذا ما تقدر تدخل على صفحة الويب:

1. **حمّل SADP Tool** من موقع Hikvision
2. **شغّل البرنامج** - سيكتشف جميع الأجهزة على الشبكة
3. **اختر جهازك** من القائمة
4. **اختر "Modify Network Parameters"**
5. **تحقق من أن SDK Port مفعّل**

---

### **الطريقة 3: من IVMS-4200**

1. شغّل برنامج **iVMS-4200**
2. اذهب لـ **Device Management**
3. اضغط بالزر الأيمن على الجهاز → **Remote Configuration**
4. اذهب لـ **Network → Advanced Settings**
5. فعّل **SDK Service** على البورت **8000**

---

## 🧪 اختبار الاتصال:

بعد تفعيل البورت 8000، جرب:

### **1. اختبار من PowerShell:**
```powershell
Test-NetConnection 192.168.1.84 -Port 8000
```

يجب تشوف:
```
TcpTestSucceeded : True  ✅
```

### **2. اختبار من Telnet:**
```powershell
telnet 192.168.1.84 8000
```

إذا اتصل، معناها البورت مفتوح!

### **3. اختبار من النظام:**
ارجع للنظام وجرب رفع صورة مرة ثانية. يجب يشتغل!

---

## ⚠️ إذا البورت 8000 محظور في Firewall:

### **Windows Firewall:**
```powershell
# افتح البورت 8000 للخروج (Outbound)
New-NetFirewallRule -DisplayName "Hikvision SDK Port" -Direction Outbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### **على الجهاز نفسه:**
تحقق من إعدادات Firewall في الجهاز:
```
Configuration → System → Security → Firewall
```

---

## 🔍 استكشاف الأخطاء:

### **Error Code 7: Connection Failed**
- **السبب:** الجهاز لا يستجيب على البورت 8000
- **الحل:** 
  1. تأكد من تفعيل البورت في الجهاز
  2. تأكد من أن الـ IP صحيح
  3. جرب ping الجهاز أولاً

### **Error Code 3: Login Failed**
- **السبب:** اسم المستخدم أو كلمة السر خطأ
- **الحل:** تحقق من معلومات الدخول في قاعدة البيانات

### **Error Code 1: SDK Not Initialized**
- **السبب:** C# Service مو شغال
- **الحل:** شغّل `dotnet run` في مجلد sdk-service

---

## 📝 معلومات إضافية:

### **البورتات الافتراضية لأجهزة Hikvision:**

| البورت | الاستخدام |
|--------|-----------|
| 80 | HTTP (صفحة الويب) |
| 443 | HTTPS |
| 554 | RTSP (الفيديو) |
| 8000 | SDK Service (الأهم للبصمات!) ⭐ |
| 8080 | HTTP Alternative |

### **ملاحظات هامة:**

1. ✅ البورت 8000 **مطلوب** لتسجيل البصمات
2. ⚠️ البورت 80 لا يدعم HCNetSDK Protocol
3. 🔒 تأكد من أن Firewall لا يحظر البورت 8000
4. 🔄 أعد تشغيل الجهاز بعد تغيير الإعدادات

---

## ✅ التحقق النهائي:

بعد تفعيل البورت، جرب هذا الـ Test:

```powershell
cd backend
node test-sdk-service.js
```

يجب تشوف:
```
✅ Health Check: OK
✅ Device Communication: OK
```

بدل من:
```
❌ Device Communication: Failed (Error code: 7)
```

---

تم التحديث: 2026-02-21
