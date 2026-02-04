# 📚 مراجع ومصادر المشروع | Project References

> آخر تحديث: 4 فبراير 2026

---

## 🎯 نظرة عامة | Overview

هذا الملف يحتوي على **جميع المراجع والمصادر الثابتة** المستخدمة في تطوير نظام التحكم بالوصول HikVision.

---

## 📁 ملفات SDK المتاحة | Available SDK Files

### 1. WebSDK V3.3.1 (JavaScript)
- **المسار:** `c:\Users\My Laptop\Downloads\WebSDK V3.3.1`
- **النوع:** SDK للويب (JavaScript)
- **الاستخدام:** معاينة الفيديو فقط (Video Preview Only)
- **القيود:**
  - ❌ لا يدعم إدارة الوجوه
  - ❌ لا يدعم Access Control
  - ❌ لا يدعم إدارة الموظفين
  - ✅ يدعم فقط Video Streaming
  
**الملفات الرئيسية:**
```
demo/codebase/
├── jsVideoPlugin-1.0.0.min.js    # Video player
└── webVideoCtrl.js                # Video control
```

### 2. WebSDK 3.2 (JavaScript)
- **المسار:** `c:\Users\My Laptop\Downloads\WebSDK 3.2`
- **النوع:** نسخة أقدم من WebSDK
- **الاستخدام:** غير مستخدم (Deprecated)
- **الحالة:** 🔴 Not in Use

### 3. HCNetSDK V6.1.9.48 (C++/C#)
- **المسار:** `c:\Users\My Laptop\Downloads\HCNetSDK V6.1.9.48`
- **النوع:** SDK كامل للـWindows
- **القيود:**
  - ❌ Windows Only
  - ❌ يحتاج COM/ActiveX
  - ❌ صعوبة التكامل مع Node.js
  - ✅ ميزات كاملة (Full Features)

---

## 🌐 ISAPI Protocol (المستخدم الفعلي)

### ما هو ISAPI؟
**ISAPI (Internet Server Application Programming Interface)** هو بروتوكول REST API من HikVision يسمح بالتحكم الكامل بالأجهزة عبر HTTP/HTTPS.

### لماذا ISAPI؟
- ✅ **Cross-platform** (يعمل على Windows, Linux, macOS)
- ✅ **REST API** (سهل الاستخدام مع Node.js)
- ✅ **ميزات كاملة** (Face, Card, Fingerprint, Events)
- ✅ **Real-time events** (عبر Long Polling/Streaming)
- ✅ **لا يحتاج تثبيت** SDK

---

## 📡 ISAPI Endpoints Reference

### 🔐 Authentication
```
Method: Digest Authentication
Username: admin (default)
Password: device password
```

### 📋 Device Information

#### 1. Get Device Info
```http
GET /ISAPI/System/deviceInfo
Response: XML
```
**يرجع:**
- Device Name
- Model
- Serial Number
- Firmware Version
- MAC Address

#### 2. Get Device Status
```http
GET /ISAPI/System/status
Response: XML
```
**يرجع:**
- CPU Usage
- Memory Usage
- Uptime
- Temperature

#### 3. Get Capabilities
```http
GET /ISAPI/System/capabilities
Response: XML
```
**يرجع:**
- Supported Features
- Max Face Count
- Max User Count
- Supported Card Types

---

### 👤 User Management

#### 1. Add User
```http
POST /ISAPI/AccessControl/UserInfo/Record?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<UserInfo>
  <employeeNo>1001</employeeNo>
  <name>Ahmed Ali</name>
  <userType>normal</userType>
  <Valid>
    <enable>true</enable>
    <beginTime>2024-01-01T00:00:00</beginTime>
    <endTime>2025-12-31T23:59:59</endTime>
  </Valid>
</UserInfo>
```

#### 2. Update User
```http
PUT /ISAPI/AccessControl/UserInfo/Modify?format=json
Content-Type: application/xml
Body: Same as Add User
```

#### 3. Delete User
```http
PUT /ISAPI/AccessControl/UserInfo/Delete?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<UserInfoDelCond>
  <EmployeeNoList>
    <employeeNo>1001</employeeNo>
  </EmployeeNoList>
</UserInfoDelCond>
```

#### 4. Search Users
```http
POST /ISAPI/AccessControl/UserInfo/Search?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<UserInfoSearchCond>
  <searchID>1</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>100</maxResults>
</UserInfoSearchCond>
```

---

### 😊 Face Management

#### 1. Upload Face Picture
```http
POST /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
Content-Type: multipart/form-data

Parts:
1. FaceDataRecord (XML):
   <?xml version="1.0" encoding="UTF-8"?>
   <FaceDataRecord>
     <employeeNo>1001</employeeNo>
     <faceLibType>blackFD</faceLibType>
   </FaceDataRecord>

2. FaceImage (JPEG):
   Binary image data
```

**متطلبات الصورة:**
- Format: JPEG
- Size: 200x200 to 1920x1080
- Face visible and clear
- Good lighting
- Frontal face (not tilted)

#### 2. Delete Face
```http
DELETE /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<FaceDataRecord>
  <FDID>face-id</FDID>
</FaceDataRecord>
```

#### 3. Get Face Count
```http
GET /ISAPI/Intelligent/FDLib/Count
Response: XML with current face count
```

---

### 💳 Card Management

#### 1. Add Card
```http
POST /ISAPI/AccessControl/CardInfo/Record?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<CardInfo>
  <employeeNo>1001</employeeNo>
  <cardNo>1234567890</cardNo>
  <cardType>1</cardType>
</CardInfo>
```

**Card Types:**
- 1 = Normal Card
- 2 = Disabled Card
- 3 = Blacklist Card
- 4 = Patrol Card
- 5 = Duress Card

#### 2. Delete Card
```http
PUT /ISAPI/AccessControl/CardInfo/Delete?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<CardInfoDelCond>
  <CardNoList>
    <cardNo>1234567890</cardNo>
  </CardNoList>
</CardInfoDelCond>
```

---

### 👆 Fingerprint Management

#### 1. Upload Fingerprint
```http
POST /ISAPI/AccessControl/FingerPrintUpload?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<FingerPrintCfg>
  <employeeNo>1001</employeeNo>
  <fingerPrintID>1</fingerPrintID>
  <fingerType>normalFP</fingerType>
  <fingerData>BASE64_ENCODED_DATA</fingerData>
</FingerPrintCfg>
```

#### 2. Delete Fingerprint
```http
PUT /ISAPI/AccessControl/FingerPrint/Delete?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<FingerPrintDelete>
  <employeeNo>1001</employeeNo>
  <fingerPrintID>1</fingerPrintID>
</FingerPrintDelete>
```

---

### 📊 Events & Logs

#### 1. Get Access Control Events
```http
POST /ISAPI/AccessControl/AcsEvent?format=json
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<AcsEventCond>
  <searchID>1</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>30</maxResults>
  <startTime>2024-01-01T00:00:00</startTime>
  <endTime>2024-12-31T23:59:59</endTime>
  <major>5</major>
  <minor>75</minor>
</AcsEventCond>
```

**Event Types (Major/Minor):**
- Major 5 = Access Control Events
  - Minor 0 = All Events
  - Minor 75 = Face Recognition Success
  - Minor 76 = Face Recognition Failed
  - Minor 77 = Card Swipe Success
  - Minor 78 = Card Swipe Failed

#### 2. Subscribe to Real-time Events
```http
GET /ISAPI/Event/notification/alertStream
Response: Streaming XML (Long Polling)
```

**يرجع real-time events:**
- Door open/close
- Face recognition
- Card swipe
- Fingerprint verification
- Attendance events

---

### 🚪 Door Control

#### 1. Open Door
```http
PUT /ISAPI/AccessControl/RemoteControl/door/1
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>open</cmd>
</RemoteControlDoor>
```

#### 2. Close Door
```http
PUT /ISAPI/AccessControl/RemoteControl/door/1
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>close</cmd>
</RemoteControlDoor>
```

#### 3. Get Door Status
```http
GET /ISAPI/AccessControl/DoorStatus
Response: XML with door state (open/closed)
```

---

## 🔧 أمثلة عملية | Practical Examples

### Example 1: Full User Registration Flow

```javascript
// 1. Add user to device
await isapiClient.addUser({
  employeeNo: '1001',
  name: 'أحمد علي',
  userType: 'normal',
  valid: {
    enable: true,
    beginTime: '2024-01-01T00:00:00',
    endTime: '2025-12-31T23:59:59'
  }
});

// 2. Upload face picture
const faceImage = fs.readFileSync('ahmed-face.jpg');
await isapiClient.uploadFacePicture('1001', faceImage);

// 3. Add card
await isapiClient.addCard({
  employeeNo: '1001',
  cardNo: '1234567890',
  cardType: 1
});

// 4. Add fingerprint (optional)
await isapiClient.uploadFingerprint('1001', fingerprintData);
```

### Example 2: Get Today's Attendance

```javascript
const today = new Date();
const startTime = new Date(today.setHours(0, 0, 0, 0));
const endTime = new Date(today.setHours(23, 59, 59, 999));

const events = await isapiClient.getEvents({
  startTime: startTime.toISOString(),
  endTime: endTime.toISOString(),
  major: 5,  // Access Control
  minor: 75  // Face Recognition Success
});
```

### Example 3: Real-time Event Monitoring

```javascript
// Subscribe to real-time events
const eventStream = await isapiClient.subscribeToEvents((event) => {
  console.log('New event:', event);
  
  // Send to WebSocket clients
  io.to('organization-123').emit('attendance_event', {
    employeeNo: event.employeeNo,
    name: event.name,
    time: event.time,
    type: event.eventType,
    photo: event.pictureUrl
  });
});
```

---

## 📱 أجهزة HikVision المدعومة | Supported Devices

### 1. DS-K1T673DG1X-E1 (Pro Model)
- **النوع:** Face Recognition Terminal (7-inch)
- **المواصفات:**
  - Face capacity: 3,000 faces
  - Card capacity: 10,000 cards
  - Fingerprint capacity: 3,000 templates
  - Event capacity: 150,000 records
  - Display: 7-inch touch screen
  - Camera: 2 MP wide-angle dual-lens
  - Wiegand input/output: Supported
  - Network: TCP/IP, WiFi
  - Reader distance: 0.3m to 1.5m

### 2. DS-K1T344EBFWX-E1 (Value Model)
- **النوع:** Face Recognition Terminal (4.3-inch)
- **المواصفات:**
  - Face capacity: 1,500 faces
  - Card capacity: 3,000 cards
  - Event capacity: 100,000 records
  - Display: 4.3-inch LCD
  - Camera: 2 MP
  - Network: TCP/IP
  - Reader distance: 0.3m to 1.5m

---

## 🌍 مصادر خارجية | External Resources

### Official Documentation
1. **HikVision ISAPI Specification**
   - URL: https://www.hikvision.com/en/support/tools/isapi/
   - نوع: PDF Documentation
   - اللغة: English

2. **HikVision Developer Portal**
   - URL: https://open.hikvision.com/
   - نوع: API Documentation
   - اللغة: English, Chinese

3. **HikVision Forum**
   - URL: https://www.hikvision.com/en/support/forum/
   - نوع: Community Support

### GitHub Repositories (References)
1. **node-hikvision-api**
   - URL: https://github.com/AlucardZero/node-hikvision-api
   - نوع: Node.js ISAPI Client
   - Stars: 100+

2. **hikvision-client**
   - URL: https://github.com/fbertone/hikvision-client
   - نوع: Python ISAPI Client
   - Stars: 50+

### Stack Overflow Tags
- `hikvision`
- `isapi`
- `access-control`
- `face-recognition`

---

## 📝 ملاحظات مهمة | Important Notes

### 🔴 القيود والمحددات | Limitations

1. **Device Capacity Limits:**
   - Pro Model: 3,000 faces max
   - Value Model: 1,500 faces max
   - يجب مراقبة السعة وعدم تجاوزها

2. **Network Requirements:**
   - يجب أن يكون الجهاز على نفس الشبكة
   - فتح Port 80 (HTTP) أو 443 (HTTPS)
   - Firewall يجب أن يسمح بالاتصال

3. **Image Requirements:**
   - الوجه يجب أن يكون واضح ومضاء جيداً
   - صورة JPEG فقط
   - حجم 200x200 إلى 1920x1080
   - الوجه يجب أن يكون frontal (مو مايل)

4. **Real-time Events:**
   - Long Polling فقط (مو WebSocket)
   - Connection قد ينقطع ويحتاج reconnect
   - يجب معالجة الـ timeout

### ✅ Best Practices

1. **Always test connection first:**
   ```javascript
   const result = await isapiClient.testConnection();
   if (!result.success) {
     throw new Error('Device offline');
   }
   ```

2. **Handle errors gracefully:**
   ```javascript
   try {
     await isapiClient.addUser(userData);
   } catch (error) {
     if (error.response?.status === 401) {
       // Wrong credentials
     } else if (error.code === 'ECONNREFUSED') {
       // Device offline
     }
   }
   ```

3. **Use retry logic:**
   ```javascript
   const retry = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await sleep(1000 * (i + 1));
       }
     }
   };
   ```

4. **Cache device info:**
   - لا تطلب device info في كل request
   - احفظها في الـ database وحدثها كل ساعة

5. **Sync periodically:**
   - اعمل sync كل 5 دقائق للـ events
   - استخدم cron job
   - احفظ آخر event ID لتجنب التكرار

---

## 🔄 التحديثات | Updates

| التاريخ | التغيير | الملاحظات |
|--------|---------|-----------|
| 2026-02-04 | Initial creation | أول نسخة من المراجع |

---

**💡 نصيحة:** احفظ هذا الملف كمرجع دائم. كل المعلومات هنا مأخوذة من التجربة العملية والـ documentation الرسمي.
