# تقرير فحص Hikvision SDK - دعم Face & Card Registration
**التاريخ:** 17 فبراير 2026  
**SDK Version:** HCNetSDK V6.1.9.48 (Build 20230410)  
**المصدر:** Device Network SDK Documentation + Demo Code Analysis

---

## 📋 ملخص تنفيذي

تم فحص SDK Documentation وأمثلة الكود في المسار:
```
c:\Users\My Laptop\Downloads\WebSDK V3.3.1\EN-HCNetSDKV6.1.9.48_build20230410_win64\
```

**النتيجة الرئيسية:**
- ✅ يدعم Face Registration
- ✅ يدعم Card Registration  
- ⚠️ **لكن عبر SDK Binary APIs فقط (NET_DVR_*)، وليس عبر HTTP/ISAPI مباشرة**

---

## 🔍 التحليل التفصيلي

### 1️⃣ Face Recognition Support

#### ✅ **ما هو مدعوم:**

**SDK APIs (Binary Protocol):**
- `NET_DVR_SET_FACE` (Command: 2567) - لإضافة/تحديث وجه
- `NET_DVR_GET_FACE` (Command: 2566) - لاسترجاع معلومات الوجه
- `NET_DVR_DEL_FACE_PARAM_CFG` (Command: 2509) - لحذف وجه
- `NET_DVR_CAPTURE_FACE_INFO` (Command: 2510) - لالتقاط وجه مباشر

**البيانات المطلوبة:**
```csharp
NET_DVR_FACE_RECORD {
    byCardNo[32]        // رقم الكارت المرتبط بالوجه
    dwFaceLen           // حجم صورة الوجه (max 200KB)
    pFaceBuffer         // Buffer الصورة (JPG format)
    dwReaderNo          // رقم قارئ الوجه
}
```

**الآلية:**
1. Login إلى الجهاز عبر `NET_DVR_Login_V40`
2. Start Remote Config عبر `NET_DVR_StartRemoteConfig(NET_DVR_SET_FACE)`
3. إرسال صورة الوجه (JPG, max 200KB) + Card Number
4. استقبال Status Response
5. Stop Remote Config

**مثال من Demo Code:**
```csharp
// من FaceManagement.cs
m_lSetFaceCfgHandle = CHCNetSDK.NET_DVR_StartRemoteConfig(
    m_UserID, 
    CHCNetSDK.NET_DVR_SET_FACE, 
    ptrstruCond, 
    dwInBufferSize, 
    null, 
    IntPtr.Zero
);

// قراءة صورة الوجه
FileStream fs = new FileStream(textBoxFilePath.Text, FileMode.OpenOrCreate);
struRecord.dwFaceLen = (int)fs.Length; // يجب أن تكون < 200KB
struRecord.pFaceBuffer = Marshal.AllocHGlobal(iLen);
fs.Read(by, 0, iLen);
Marshal.Copy(by, 0, struRecord.pFaceBuffer, iLen);

// إرسال البيانات
dwStatus = CHCNetSDK.NET_DVR_SendWithRecvRemoteConfig(
    m_lSetFaceCfgHandle, 
    ref struRecord, 
    dwInBuffSize, 
    ref struStatus, 
    dwOutBuffSize, 
    ptrOutDataLen
);
```

---

### 2️⃣ Card Registration Support

#### ✅ **ما هو مدعوم:**

**SDK APIs (Binary Protocol):**
- `NET_DVR_SET_CARD` - لإضافة/تحديث كارت
- `NET_DVR_GET_CARD` - لاسترجاع معلومات كارت
- `NET_DVR_DEL_CARD` - لحذف كارت

**البيانات المطلوبة:**
```csharp
NET_DVR_CARD_RECORD {
    byCardNo[32]        // رقم الكارت (Card Number)
    byCardType          // نوع الكارت (1=Normal Card)
    dwEmployeeNo        // رقم الموظف
    byName[32]          // اسم الموظف
    wCardRightPlan[0]   // خطة الصلاحيات
    byDoorRight[0]      // صلاحية الباب
    struValid           // فترة صلاحية الكارت
}
```

**مثال من Demo Code:**
```csharp
// من CardManagement.cs
CHCNetSDK.NET_DVR_CARD_RECORD struData = new CHCNetSDK.NET_DVR_CARD_RECORD();
struData.byCardType = 1; // نوع الكارت العادي
struData.byCardNo = UTF8.GetBytes(textBoxCardNo.Text);
struData.dwEmployeeNo = uint.Parse(textBoxEmployeeNo.Text);
struData.byName = Encoding.Default.GetBytes(textBoxName.Text);
struData.wCardRightPlan[0] = ushort.Parse(textBoxCardRightPlan.Text);
struData.byDoorRight[0] = 1; // صلاحية الباب

// تحديد فترة الصلاحية
struData.struValid.byEnable = 1;
struData.struValid.struBeginTime.wYear = 2000;
struData.struValid.struEndTime.wYear = 2030;

// إرسال البيانات
m_lSetCardCfgHandle = CHCNetSDK.NET_DVR_StartRemoteConfig(
    m_UserID, 
    CHCNetSDK.NET_DVR_SET_CARD, 
    ptrStruCond, 
    struCond.dwSize, 
    null, 
    IntPtr.Zero
);
```

---

### 3️⃣ ربط Face مع Card

**الآلية:**
1. أولاً: إضافة Card عبر `NET_DVR_SET_CARD` مع `dwEmployeeNo`
2. ثانياً: إضافة Face عبر `NET_DVR_SET_FACE` مع نفس `byCardNo`
3. الجهاز يربط Face مع Card تلقائياً عبر `CardNo`

**مثال:**
```
Step 1: Add Card
  CardNo = "12345678"
  EmployeeNo = 1001
  Name = "Ahmed Ali"

Step 2: Add Face
  CardNo = "12345678"  // نفس رقم الكارت
  FaceImage = [JPG Binary Data]
  
Result: Face مربوط بـ Card رقم 12345678
```

---

## ❌ ما هو غير مدعوم (HTTP/ISAPI)

### **المشكلة الرئيسية:**

الـ SDK يستخدم **Binary Protocol over TCP** وليس **HTTP/ISAPI REST APIs**

**السبب:**
- الـ Documentation المتوفر يركز على **Device Network SDK** (Binary)
- لا يوجد أمثلة أو ملفات تشير إلى ISAPI endpoints لـ Face/Card Management
- ملف `curl_httpclient.cpp` موجود لكنه للاستخدامات العامة فقط

**ملاحظة مهمة:**
يوجد دعم لـ **ISAPI Login Mode** في الـ SDK:
```csharp
NET_DVR_USER_LOGIN_INFO {
    byLoginMode  // 0=Private, 1=ISAPI, 2=Auto-detect
}
```

لكن هذا للـ **Authentication فقط**، وليس لـ Face/Card Management APIs.

---

## 🔧 كيف نستخدمه في نظامنا؟

### **الخيارات المتاحة:**

#### ✅ **الخيار 1: SDK Wrapper Service (الموصى به)**

**الهيكلية:**
```
Frontend (Vue.js)
    ↓ HTTP/REST
Backend (Node.js)
    ↓ TCP Binary Protocol
SDK Wrapper Service (C# / C++)
    ↓ HCNetSDK.dll
Hikvision Device
```

**المميزات:**
- ✅ استخدام الـ SDK الرسمي (مستقر وموثوق)
- ✅ دعم كامل لجميع ميزات الجهاز
- ✅ Updates والـ Bug Fixes من Hikvision

**العيوب:**
- ⚠️ يتطلب خدمة إضافية (Microservice)
- ⚠️ يجب أن يكون مكتوباً بـ C# أو C++ (لاستخدام HCNetSDK.dll)

**Implementation:**
```
1. إنشاء C# Service:
   - WebAPI Service (ASP.NET Core)
   - يستخدم HCNetSDK.dll
   - يوفر REST endpoints:
     POST /api/face/register
     POST /api/card/register
     DELETE /api/face/delete
     GET /api/card/list

2. Backend (Node.js) يتصل بـ C# Service:
   axios.post('http://localhost:5000/api/face/register', {
     cardNo: '12345678',
     employeeNo: 1001,
     faceImage: base64Image
   })

3. C# Service يترجم الطلب إلى SDK calls
```

---

#### ⚠️ **الخيار 2: ISAPI Discovery (يحتاج بحث إضافي)**

**الاحتمال:** قد تدعم بعض أجهزة Hikvision الحديثة ISAPI endpoints لـ Face Management

**ISAPI Endpoints المحتملة (غير مؤكدة):**
```
POST /ISAPI/AccessControl/UserInfo/Record?format=json
POST /ISAPI/AccessControl/FaceDataRecord?format=json
DELETE /ISAPI/AccessControl/UserInfo/Delete?format=json
```

**كيفية التحقق:**
1. Login إلى الجهاز عبر ISAPI:
   ```bash
   curl -u admin:password http://device-ip/ISAPI/System/capabilities
   ```

2. البحث عن capabilities:
   ```xml
   <isSupportFaceUpload>true</isSupportFaceUpload>
   <isSupportAccessControl>true</isSupportAccessControl>
   ```

3. قراءة Device Manual الخاص بجهازك المحدد

**المميزات:**
- ✅ مباشر من Backend (No SDK Service needed)
- ✅ HTTP REST APIs (سهل التطوير)

**العيوب:**
- ❌ غير مؤكد أن جميع الأجهزة تدعمه
- ❌ قد يكون محدود الميزات مقارنة بـ SDK
- ❌ Documentation قليل

---

#### ❌ **الخيار 3: Direct TCP Binary Protocol**

**غير موصى به:**
- يتطلب Reverse Engineering للـ Protocol
- معقد جداً (Binary Structures, Marshalling, etc.)
- عُرضة للأخطاء
- يفقد فائدة SDK الرسمي

---

## 📊 مقارنة الخيارات

| المعيار | SDK Wrapper | ISAPI Direct | TCP Binary |
|--------|-------------|--------------|------------|
| **الاستقرار** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (حسب الجهاز) | ⭐⭐ |
| **سهولة التطوير** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| **الميزات المتاحة** | ⭐⭐⭐⭐⭐ (كل شيء) | ⭐⭐⭐ (محدود) | ⭐⭐⭐⭐⭐ |
| **التعقيد** | متوسط | بسيط | عالي جداً |
| **الموصى به** | ✅ نعم | ⚠️ للتجربة | ❌ لا |

---

## 🎯 التوصية النهائية

### **للنظام الحالي:**

**1. المرحلة الأولى (Immediate):**
- ✅ إنشاء **SDK Wrapper Service** بـ C#
- ✅ استخدام Demo Code الموجود كـ Base
- ✅ توفير REST APIs لـ:
  - Face Registration (مع صورة)
  - Card Registration
  - Employee + Face + Card Linking
  - Delete/Update operations

**2. المرحلة الثانية (Research):**
- 🔍 فحص جهاز Hikvision المحدد لديك
- 🔍 قراءة Device Manual للبحث عن ISAPI support
- 🔍 اختبار ISAPI endpoints إن وجدت

**3. المرحلة الثالثة (Optimization):**
- إذا ISAPI مدعوم → الانتقال إليه (أبسط)
- إذا لا → الاستمرار مع SDK Wrapper (أكثر استقراراً)

---

## 📝 ملفات مرجعية تم فحصها

### **Documentation:**
- ✅ `Device Network SDK (Person-Based Access Control)_Developer Guide_V6.1.7.X_20230330.pdf`
- ✅ `Device Network SDK (Card-Based Access Control)_Developer Guide_V6.1.5.X_20230330.pdf`

### **Demo Code:**
- ✅ `C# demo/8-ACS_Optimization_ALL/FaceManagement/FaceManagement.cs`
- ✅ `C# demo/8-ACS_Optimization_ALL/CardManagement/CardManagement.cs`
- ✅ `ClientDemo/curl_httpclient.cpp` (HTTP client للاستخدامات العامة)

### **SDK Headers:**
- ✅ `incEn/HCNetSDK.h` (51,561 lines)
- ✅ `C# demo/.../CHCNetSDK.cs` (Constants & Structures)

---

## ⚡ Next Steps

1. **قرار:** اختيار بين SDK Wrapper أو ISAPI
2. **Setup:** إعداد بيئة C# Development (إذا SDK Wrapper)
3. **POC:** Proof of Concept لـ Face + Card Registration
4. **Integration:** ربط مع Backend الحالي (Node.js)
5. **Testing:** اختبار على جهاز Hikvision الفعلي

---

## 📞 ملاحظات إضافية

### **Limitations معروفة:**
- صورة الوجه يجب أن تكون **JPG** و **< 200KB**
- Card Number يجب أن يكون **unique** (32 characters max)
- Employee Number يجب أن يكون **unique**
- الجهاز له **capacity محدود** للوجوه (يعتمد على الموديل)

### **Security Considerations:**
- SDK يدعم **TLS/HTTPS** للاتصال الآمن
- يدعم **Dual/Single Authentication**
- Password يجب أن يكون strong (min 8 characters)

---

**خلاصة القول:**
النظام **جاهز** لدعم Face + Card Registration، لكن يتطلب **SDK Wrapper Service** كـ middleware بين Backend و Hikvision Device.

✅ **الحل موجود وموثوق**  
⚠️ **يحتاج تطوير إضافي (C# Service)**  
🚀 **قابل للتنفيذ خلال 1-2 أسبوع**
