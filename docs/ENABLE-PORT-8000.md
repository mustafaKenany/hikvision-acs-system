# 🚀 كيف تفعّل البورت 8000 في جهاز Hikvision

## المشكلة  
الجهاز `192.168.1.84` يشتغل على البورت 80 (HTTP/ISAPI) فقط، لكن **HCNetSDK** يحتاج البورت 8000.

**Error Code 7** = الجهاز يرفض الاتصال لأن البورت 8000 مغلق أو غير مفعّل.

---

## 🔍 الحل: تفعيل البورت 8000

### 1️⃣ عن طريق Web UI ↗

1. افتح متصفح واذهب إلى: [http://192.168.1.84](http://192.168.1.84)
2. **Configuration** → **Network** → **Advanced Settings** → **Other**
3. ابحث عن: **"Device Server Port"** أو **"SDK Service Port"**
4. فعّل الخيار وحدد البورت: **8000**
5. احفظ البورت اعمل **Reboot** للجهاز

### 2️⃣ عن طريق SADP Tool 🔧

[SADP Tool](https://www.hikvision.com/en/support/tools/hitools/) هو أداة من Hikvision لإدارة الأجهزة:

1. حمّل وثبّت SADP
2. افتح البرنامج - سيظهر جهازك `192.168.1.84`
3. اضغط دبل كليك على الجهاز
4. **Network** → **Port Settings**
5. فعّل **SDK Port 8000**
6. احفظ وعمل Reboot

### 3️⃣ عن طريق IVMS-4200 📱

إذا عندك تطبيق [IVMS-4200](https://www.hikvision.com/en/support/tools/ivms-4200/):

1. افتح التطبيق
2. اذهب إلى **Device Management**
3. اختر جهازك `192.168.1.84`
4. **Remote Configuration** → **Network** → **Port**
5. فعّل **SDK Port: 8000**
6. Apply وعمل Reboot

---

## ✅ بعد تفعيل البورت 8000

### 1. حدّث الجهاز في قاعدة البيانات:

```sql
UPDATE devices 
SET sdk_port = 8000 
WHERE ip_address = '192.168.1.84';
```

أو عن طريق Node.js:

```javascript
// في backend folder
node migrations/run-migration.js
```

### 2. أعد تشغيل Backend:

```bash
cd backend
npm start
```

### 3. جرب رفع صورة من جديد!

---

## 🧪 تحقق من البورت 8000

### Windows PowerShell:
```powershell
Test-NetConnection -ComputerName 192.168.1.84 -Port 8000
```

يجب تظهر: **TcpTestSucceeded : True**

### عن طريق cmd:
```cmd
telnet 192.168.1.84 8000
```

إذا اتصل = البورت شغال ✅  
إذا رفض = البورت مغلق ❌

---

## 📚 معلومات إضافية

### بورتات Hikvision الشائعة:
- **80**: HTTP/Web Interface (ISAPI)
- **443**: HTTPS (Secure Web)
- **554**: RTSP (Video Streaming)
- **8000**: HCNetSDK (Binary Protocol) ⭐
- **7681/7682**: WebSocket

### لماذا 8000 مهم؟
- يستخدم **بروتوكول ثنائي Binary Protocol** أسرع من HTTP
- يدعم جميع ميزات SDK (الوجه، البصمة، الكارت)
- مخصص للتطبيقات وليس للمتصفحات

---

## ❓ إذا ما ظهر خيار البورت 8000

1. **تحديث Firmware**: ممكن السوفتوير قديم
   - حمّل آخر تحديث من موقع Hikvision
   
2. **اتصل بالدعم الفني**: بعض الأجهزة أو الموديلات ما تدعم تخصيص البورت

3. **استخدم SADP**: أفضل طريقة لتفعيل البورت

---

## 🔄 الخطوات المختصرة

```bash
1. افتح SADP Tool
2. فعّل SDK Port 8000
3. Reboot الجهاز
4. حدّث قاعدة البيانات (sdk_port = 8000)
5. أعد تشغيل Backend
6. جرب رفع الصورة 🚀
```

---

## ⚠️ تذكير

إذا ما ظهر خيار البورت 8000 في الجهاز، معناها الجهاز أو الـ firmware ما يدعم تخصيص البورت. في هذه الحالة، يجب استخدام **ISAPI REST API** بدلاً من **HCNetSDK**.
