# 🔧 Backend APIs المطلوبة للأجهزة
## APIs التي يحتاجها Frontend

---

## ✅ **APIs الموجودة حالياً:**

### 1. `GET /api/devices` ✅
```javascript
// جلب جميع الأجهزة مع فلاتر
params: { page, limit, search, device_type, is_active, is_online }
```

### 2. `GET /api/devices/:id` ✅
```javascript
// جلب جهاز واحد
```

### 3. `POST /api/devices` ✅
```javascript
// إضافة جهاز جديد
body: { name, device_type, ip_address, port, username, password, ... }
```

### 4. `PUT /api/devices/:id` ✅
```javascript
// تعديل جهاز
```

### 5. `DELETE /api/devices/:id` ✅
```javascript
// حذف جهاز
```

### 6. `POST /api/devices/:id/test-connection` ✅
```javascript
// اختبار الاتصال
```

### 7. `POST /api/devices/:id/activate` ✅
```javascript
// تفعيل جهاز
```

### 8. `POST /api/devices/:id/deactivate` ✅
```javascript
// تعطيل جهاز
```

### 9. `POST /api/devices/:id/sync` ✅
```javascript
// مزامنة الموظفين للجهاز
```

---

## 🆕 **APIs المطلوبة (جديدة):**

### 1. `POST /api/devices/discover` 🆕
**الوصف:** البحث عن أجهزة Hikvision في الشبكة
**المدخلات:**
```json
{
  "ipStart": "192.168.1.1",
  "ipEnd": "192.168.1.254",
  "port": 80,
  "timeout": 5
}
```
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "ip": "192.168.1.84",
        "deviceInfo": {
          "deviceName": "DS-K1T671MF",
          "model": "DS-K1T671MF",
          "serialNumber": "DS-K1T671MF20210512AAWRC12345678",
          "firmwareVersion": "V3.2.50",
          "firmwareReleasedDate": "build 210512"
        }
      }
    ],
    "totalScanned": 254
  }
}
```

### 2. `GET /api/devices/:id/info` 🆕
**الوصف:** جلب معلومات تفصيلية عن الجهاز
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "deviceName": "DS-K1T671MF",
    "deviceID": "123456",
    "model": "DS-K1T671MF",
    "serialNumber": "DS-K1T671MF20210512AAWRC12345678",
    "firmwareVersion": "V3.2.50",
    "firmwareReleasedDate": "build 210512",
    "capacity": {
      "maxFaceLibNum": 1,
      "maxFaceNumPerLib": 3000,
      "currentFaceNum": 125
    }
  }
}
```

### 3. `POST /api/devices/:id/sync-time` 🆕
**الوصف:** مزامنة تاريخ ووقت الجهاز مع السيرفر
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "deviceTime": "2026-02-11T14:30:25Z",
    "serverTime": "2026-02-11T14:30:25Z",
    "synced": true
  }
}
```

### 4. `POST /api/devices/:id/pull-logs` 🆕
**الوصف:** سحب سجلات الحضور من الجهاز وحفظها في قاعدة البيانات
**المدخلات (اختياري):**
```json
{
  "startTime": "2026-02-01T00:00:00Z",
  "endTime": "2026-02-11T23:59:59Z"
}
```
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "count": 125,
    "logs": [
      {
        "employeeNo": "12345",
        "timestamp": "2026-02-11T08:30:15Z",
        "verificationMethod": "face",
        "temperature": 36.5,
        "saved": true
      }
    ]
  }
}
```

### 5. `POST /api/devices/:id/reboot` 🆕
**الوصف:** إعادة تشغيل الجهاز
**المخرجات:**
```json
{
  "success": true,
  "message": "تم إرسال أمر إعادة التشغيل للجهاز"
}
```

### 6. `POST /api/devices/:id/clear-logs` 🆕
**الوصف:** مسح سجلات الحضور من ذاكرة الجهاز
**⚠️ تحذير:** يجب سحب السجلات أولاً قبل المسح
**المخرجات:**
```json
{
  "success": true,
  "message": "تم مسح سجلات الجهاز بنجاح"
}
```

### 7. `POST /api/devices/:id/factory-reset` 🆕
**الوصف:** إعادة الجهاز لإعدادات المصنع (عملية خطرة جداً)
**⚠️ تحذير:** ستحذف جميع البيانات والإعدادات
**المدخلات:**
```json
{
  "confirmation": "RESET"  // للتأكيد
}
```
**المخرجات:**
```json
{
  "success": true,
  "message": "تم إرسال أمر إعادة التعيين"
}
```

### 8. `POST /api/devices/:id/open-door` 🆕
**الوصف:** فتح الباب المرتبط بالجهاز
**المدخلات (اختياري):**
```json
{
  "doorNumber": 1,  // رقم الباب (default: 1)
  "duration": 5     // المدة بالثواني (default: 5)
}
```
**المخرجات:**
```json
{
  "success": true,
  "message": "تم فتح الباب"
}
```

### 9. `GET /api/devices/:id/status` 🆕
**الوصف:** جلب حالة الجهاز الحالية
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "lastSeen": "2026-02-11T14:30:25Z",
    "uptime": 86400,  // ثواني
    "cpuUsage": 45,   // نسبة مئوية
    "memoryUsage": 60, // نسبة مئوية
    "temperature": 42, // درجة حرارة الجهاز
    "storage": {
      "total": 8192,  // MB
      "used": 2048,   // MB
      "free": 6144    // MB
    }
  }
}
```

### 10. `GET /api/devices/:id/employees` 🆕
**الوصف:** جلب قائمة الموظفين المسجلين في الجهاز
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "employees": [
      {
        "employeeNo": "12345",
        "name": "أحمد محمد",
        "hasface": true,
        "hasFingerprint": false,
        "hasCard": false
      }
    ]
  }
}
```

---

## 📊 **Access Logs APIs:**

### 1. `GET /api/access-logs` ✅
```javascript
// جلب جميع السجلات مع فلاتر
params: { page, limit, search, device_id, date_from, date_to, log_type }
```

### 2. `GET /api/access-logs/:id` ✅
```javascript
// جلب سجل واحد
```

### 3. `POST /api/access-logs/pull-all` 🆕
**الوصف:** سحب السجلات من جميع الأجهزة المتصلة
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "totalDevices": 5,
    "totalLogs": 450,
    "results": [
      {
        "deviceId": 1,
        "deviceName": "جهاز الدخول",
        "count": 125,
        "success": true
      },
      {
        "deviceId": 2,
        "deviceName": "جهاز الخروج",
        "count": 98,
        "success": true
      }
    ]
  }
}
```

### 4. `GET /api/access-logs/stats` 🆕
**الوصف:** إحصائيات السجلات
**المخرجات:**
```json
{
  "success": true,
  "data": {
    "today": 45,
    "thisWeek": 230,
    "thisMonth": 985,
    "total": 12500,
    "byDevice": [
      { "deviceId": 1, "deviceName": "جهاز الدخول", "count": 6250 },
      { "deviceId": 2, "deviceName": "جهاز الخروج", "count": 6250 }
    ]
  }
}
```

---

## 🔐 **Authentication & Authorization:**

جميع الـ APIs تحتاج:
- ✅ Authentication (JWT Token)
- ✅ Authorization based on role:
  - `super_admin` - كل الصلاحيات
  - `admin` - صلاحيات محدودة في منظمته
  - `manager` - قراءة فقط
  - `user` - لا يوجد

---

## 🛠️ **Implementation Notes:**

### Device Discovery:
```javascript
// deviceService.js
export async function discoverDevices(userId, config) {
  const { ipStart, ipEnd, port, timeout } = config;
  
  // Generate IP range
  const ipList = generateIPRange(ipStart, ipEnd);
  
  // Scan each IP
  const devices = [];
  for (const ip of ipList) {
    try {
      const client = new HikvisionClient({ 
        ip_address: ip, 
        port, 
        username: 'admin', 
        password: 'admin123' // default password for scanning
      });
      
      const result = await Promise.race([
        client.testConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout * 1000)
        )
      ]);
      
      if (result.success && result.connected) {
        devices.push({
          ip,
          deviceInfo: result.deviceInfo
        });
      }
    } catch (error) {
      // Skip this IP
    }
  }
  
  return {
    devices,
    totalScanned: ipList.length
  };
}
```

### Sync Time:
```javascript
// deviceService.js
export async function syncDeviceTime(userId, deviceId) {
  const device = await getDeviceById(userId, deviceId);
  
  const client = new HikvisionClient(device);
  
  const serverTime = new Date().toISOString();
  await client.setTime(serverTime);
  
  return {
    deviceTime: serverTime,
    serverTime,
    synced: true
  };
}
```

### Pull Logs:
```javascript
// deviceService.js  
export async function pullDeviceLogs(userId, deviceId, filters = {}) {
  const device = await getDeviceById(userId, deviceId);
  
  const client = new HikvisionClient(device);
  
  // Get logs from device
  const logs = await client.getAccessLogs(filters);
  
  // Save to database
  const savedLogs = [];
  for (const log of logs) {
    const saved = await AccessLog.create({
      device_id: deviceId,
      employee_no: log.employeeNo,
      timestamp: log.timestamp,
      verification_method: log.verificationMethod,
      temperature: log.temperature,
      // ... other fields
    });
    savedLogs.push(saved);
  }
  
  return {
    count: savedLogs.length,
    logs: savedLogs
  };
}
```

---

## 📋 **Priority Order:**

### 🔥 **High Priority (للعمل الآن):**
1. ✅ `POST /api/devices/discover` - للبحث عن جهازك
2. ✅ `GET /api/devices/:id/info` - لعرض معلومات الجهاز
3. ✅ `POST /api/devices/:id/sync-time` - لمزامنة الوقت
4. ✅ `POST /api/devices/:id/pull-logs` - لسحب البصمات

### ⚡ **Medium Priority:**
5. `POST /api/devices/:id/reboot` - إعادة تشغيل
6. `POST /api/devices/:id/clear-logs` - مسح السجلات
7. `GET /api/access-logs/stats` - إحصائيات
8. `POST /api/access-logs/pull-all` - سحب من الكل

### 🔹 **Low Priority (لاحقاً):**
9. `POST /api/devices/:id/factory-reset` - خطر
10. `POST /api/devices/:id/open-door` - ميزة إضافية
11. `GET /api/devices/:id/status` - مراقبة متقدمة
12. `GET /api/devices/:id/employees` - معلومات

---

## 🚀 **Next Steps:**

**الآن نحتاج:**
1. إضافة الـ 4 APIs ذات الأولوية العالية
2. اختبارها مع جهازك (192.168.1.84)
3. التأكد من عملها
4. ثم نضيف الباقي تدريجياً

**هل تريد أن أبدأ بإنشاء هذه الـ APIs في الباك إند؟** 🤔
