# ISAPI Alternative Implementation Guide
**للأجهزة التي تدعم HTTP/ISAPI APIs (بديل للـ SDK)**

---

## ⚠️ تنبيه مهم

هذا الدليل **افتراضي** ويعتمد على ISAPI endpoints المحتملة.  
يجب **التحقق من دعم جهازك** قبل التنفيذ.

---

## 🔍 خطوة 1: فحص دعم ISAPI في جهازك

### **Test 1: Check Device Capabilities**

```bash
# Login and get capabilities
curl -u admin:password http://192.168.1.64/ISAPI/System/capabilities

# Expected response (if supported):
<DeviceCapabilities>
  <AccessControl>
    <isSupportFaceUpload>true</isSupportFaceUpload>
    <isSupportCardManagement>true</isSupportCardManagement>
    <isSupportPersonManagement>true</isSupportPersonManagement>
  </AccessControl>
</DeviceCapabilities>
```

---

### **Test 2: Check Face API Support**

```bash
# Try to access face management endpoint
curl -u admin:password http://192.168.1.64/ISAPI/AccessControl/FaceDataRecord/capabilities

# أو
curl -u admin:password http://192.168.1.64/ISAPI/AccessControl/UserInfo/capabilities
```

---

## 📚 ISAPI Endpoints (المحتملة)

### **1. Person/Employee Management**

```http
# Get all persons
GET /ISAPI/AccessControl/UserInfo/Record?format=json

# Add new person
POST /ISAPI/AccessControl/UserInfo/Record?format=json
Content-Type: application/json

{
  "UserInfo": {
    "employeeNo": "1001",
    "name": "Ahmed Ali",
    "userType": "normal",
    "Valid": {
      "enable": true,
      "beginTime": "2000-01-01T00:00:00",
      "endTime": "2030-12-31T23:59:59"
    },
    "doorRight": "1",
    "RightPlan": [{
      "doorNo": 1,
      "planTemplateNo": "1"
    }]
  }
}

# Update person
PUT /ISAPI/AccessControl/UserInfo/Modify?format=json

# Delete person
DELETE /ISAPI/AccessControl/UserInfo/Delete?format=json
{
  "UserInfoDelCond": {
    "EmployeeNoList": [{
      "employeeNo": "1001"
    }]
  }
}
```

---

### **2. Face Management**

```http
# Add face to person
PUT /ISAPI/AccessControl/FaceDataRecord?format=json
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="FaceDataRecord"

{
  "employeeNo": "1001",
  "faceLibType": "blackFD",
  "FDID": "1"
}

--boundary
Content-Disposition: form-data; name="FaceImage"; filename="face.jpg"
Content-Type: image/jpeg

[Binary JPG Data]
--boundary--

# Get face data
POST /ISAPI/AccessControl/FaceDataRecord/Search?format=json
{
  "FaceDataRecordSearchCond": {
    "searchID": "1",
    "searchResultPosition": 0,
    "maxResults": 30,
    "EmployeeNoList": [{
      "employeeNo": "1001"
    }]
  }
}

# Delete face
PUT /ISAPI/AccessControl/FaceDataRecord/Delete?format=json
{
  "FaceDataRecordCond": {
    "employeeNo": "1001",
    "FDID": "1"
  }
}
```

---

### **3. Card Management**

```http
# Add card to person
POST /ISAPI/AccessControl/CardInfo/Record?format=json
{
  "CardInfo": {
    "employeeNo": "1001",
    "cardNo": "12345678",
    "cardType": "normalCard"
  }
}

# Get card info
POST /ISAPI/AccessControl/CardInfo/Search?format=json
{
  "CardInfoSearchCond": {
    "searchID": "1",
    "searchResultPosition": 0,
    "maxResults": 30,
    "EmployeeNoList": [{
      "employeeNo": "1001"
    }]
  }
}

# Delete card
PUT /ISAPI/AccessControl/CardInfo/Delete?format=json
{
  "CardInfoDelCond": {
    "EmployeeNoList": [{
      "employeeNo": "1001"
    }]
  }
}
```

---

## 💻 Node.js Implementation (ISAPI)

### **services/hikvisionISAPIService.js**

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class HikvisionISAPIService {
  constructor(config) {
    this.baseURL = `http://${config.ip}:${config.port}/ISAPI`;
    this.auth = {
      username: config.username,
      password: config.password
    };
    
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: this.auth,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.client.get('/System/deviceInfo');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Check capabilities
  async getCapabilities() {
    try {
      const response = await this.client.get('/System/capabilities');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Add Person/Employee
  async addPerson(personData) {
    try {
      const payload = {
        UserInfo: {
          employeeNo: personData.employeeNo.toString(),
          name: personData.name,
          userType: 'normal',
          Valid: {
            enable: true,
            beginTime: '2000-01-01T00:00:00',
            endTime: '2030-12-31T23:59:59'
          },
          doorRight: '1',
          RightPlan: [{
            doorNo: 1,
            planTemplateNo: '1'
          }]
        }
      };

      const response = await this.client.post('/AccessControl/UserInfo/Record?format=json', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Add Face to Person
  async addFace(employeeNo, faceImageBase64) {
    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(faceImageBase64, 'base64');
      
      // Create form data
      const form = new FormData();
      
      // Add face metadata
      const faceData = {
        employeeNo: employeeNo.toString(),
        faceLibType: 'blackFD',
        FDID: '1'
      };
      
      form.append('FaceDataRecord', JSON.stringify(faceData), {
        contentType: 'application/json'
      });
      
      // Add face image
      form.append('FaceImage', imageBuffer, {
        filename: 'face.jpg',
        contentType: 'image/jpeg'
      });

      const response = await this.client.put('/AccessControl/FaceDataRecord?format=json', form, {
        headers: {
          ...form.getHeaders()
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Add Card to Person
  async addCard(employeeNo, cardNo) {
    try {
      const payload = {
        CardInfo: {
          employeeNo: employeeNo.toString(),
          cardNo: cardNo,
          cardType: 'normalCard'
        }
      };

      const response = await this.client.post('/AccessControl/CardInfo/Record?format=json', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Complete registration (Person + Face + Card)
  async registerComplete(employeeData, faceImageBase64) {
    try {
      // Step 1: Add Person
      const personResult = await this.addPerson(employeeData);
      if (!personResult.success) {
        return {
          success: false,
          message: 'Failed to add person: ' + personResult.message
        };
      }

      // Step 2: Add Card (if provided)
      if (employeeData.cardNo) {
        const cardResult = await this.addCard(employeeData.employeeNo, employeeData.cardNo);
        if (!cardResult.success) {
          return {
            success: false,
            message: 'Person added but card registration failed: ' + cardResult.message
          };
        }
      }

      // Step 3: Add Face (if provided)
      if (faceImageBase64) {
        const faceResult = await this.addFace(employeeData.employeeNo, faceImageBase64);
        if (!faceResult.success) {
          return {
            success: false,
            message: 'Person and card added but face registration failed: ' + faceResult.message
          };
        }
      }

      return {
        success: true,
        message: 'Employee registered successfully',
        data: {
          employeeNo: employeeData.employeeNo,
          hasCard: !!employeeData.cardNo,
          hasFace: !!faceImageBase64
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get Person Info
  async getPerson(employeeNo) {
    try {
      const payload = {
        UserInfoSearchCond: {
          searchID: '1',
          searchResultPosition: 0,
          maxResults: 1,
          EmployeeNoList: [{
            employeeNo: employeeNo.toString()
          }]
        }
      };

      const response = await this.client.post('/AccessControl/UserInfo/Search?format=json', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Delete Person
  async deletePerson(employeeNo) {
    try {
      const payload = {
        UserInfoDelCond: {
          EmployeeNoList: [{
            employeeNo: employeeNo.toString()
          }]
        }
      };

      const response = await this.client.delete('/AccessControl/UserInfo/Delete?format=json', {
        data: payload
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Delete Face
  async deleteFace(employeeNo) {
    try {
      const payload = {
        FaceDataRecordCond: {
          employeeNo: employeeNo.toString(),
          FDID: '1'
        }
      };

      const response = await this.client.put('/AccessControl/FaceDataRecord/Delete?format=json', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }

  // Delete Card
  async deleteCard(employeeNo) {
    try {
      const payload = {
        CardInfoDelCond: {
          EmployeeNoList: [{
            employeeNo: employeeNo.toString()
          }]
        }
      };

      const response = await this.client.put('/AccessControl/CardInfo/Delete?format=json', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || error.message
      };
    }
  }
}

module.exports = HikvisionISAPIService;
```

---

### **routes/hikvisionISAPI.js**

```javascript
const express = require('express');
const router = express.Router();
const HikvisionISAPIService = require('../services/hikvisionISAPIService');

// Initialize service
const hikvisionService = new HikvisionISAPIService({
  ip: process.env.HIKVISION_IP || '192.168.1.64',
  port: process.env.HIKVISION_PORT || 80,
  username: process.env.HIKVISION_USERNAME || 'admin',
  password: process.env.HIKVISION_PASSWORD || 'admin123'
});

// Test connection
router.get('/test', async (req, res) => {
  try {
    const result = await hikvisionService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get capabilities
router.get('/capabilities', async (req, res) => {
  try {
    const result = await hikvisionService.getCapabilities();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Register complete employee
router.post('/employee/register', async (req, res) => {
  try {
    const { employeeNo, name, cardNo, faceImageBase64 } = req.body;

    const result = await hikvisionService.registerComplete(
      { employeeNo, name, cardNo },
      faceImageBase64
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get employee info
router.get('/employee/:employeeNo', async (req, res) => {
  try {
    const result = await hikvisionService.getPerson(req.params.employeeNo);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete employee
router.delete('/employee/:employeeNo', async (req, res) => {
  try {
    // Delete face first
    await hikvisionService.deleteFace(req.params.employeeNo);
    
    // Delete card
    await hikvisionService.deleteCard(req.params.employeeNo);
    
    // Delete person
    const result = await hikvisionService.deletePerson(req.params.employeeNo);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

---

### **.env Configuration**

```bash
# Hikvision Device Configuration
HIKVISION_IP=192.168.1.64
HIKVISION_PORT=80
HIKVISION_USERNAME=admin
HIKVISION_PASSWORD=admin123
```

---

## 🧪 Testing ISAPI Implementation

### **Test Script (test-isapi.js)**

```javascript
const HikvisionISAPIService = require('./services/hikvisionISAPIService');

async function testISAPI() {
  const service = new HikvisionISAPIService({
    ip: '192.168.1.64',
    port: 80,
    username: 'admin',
    password: 'admin123'
  });

  console.log('=== Testing Hikvision ISAPI ===\n');

  // Test 1: Connection
  console.log('1. Testing connection...');
  const connectionResult = await service.testConnection();
  console.log('Result:', connectionResult);
  console.log('');

  // Test 2: Capabilities
  console.log('2. Getting capabilities...');
  const capabilitiesResult = await service.getCapabilities();
  console.log('Result:', capabilitiesResult);
  console.log('');

  // Test 3: Add Person
  console.log('3. Adding person...');
  const personResult = await service.addPerson({
    employeeNo: 9999,
    name: 'Test Employee'
  });
  console.log('Result:', personResult);
  console.log('');

  // Test 4: Add Card
  if (personResult.success) {
    console.log('4. Adding card...');
    const cardResult = await service.addCard(9999, '99999999');
    console.log('Result:', cardResult);
    console.log('');
  }

  // Test 5: Get Person Info
  console.log('5. Getting person info...');
  const getPersonResult = await service.getPerson(9999);
  console.log('Result:', getPersonResult);
  console.log('');

  // Test 6: Delete Person
  console.log('6. Deleting person...');
  const deleteResult = await service.deletePerson(9999);
  console.log('Result:', deleteResult);
  console.log('');

  console.log('=== Tests completed ===');
}

testISAPI().catch(console.error);
```

**Run:**
```bash
node test-isapi.js
```

---

## 📊 ISAPI vs SDK Comparison

| Feature | ISAPI (HTTP) | SDK (Binary) |
|---------|--------------|--------------|
| **Setup Complexity** | ⭐ بسيط | ⭐⭐⭐ معقد |
| **Language** | أي لغة تدعم HTTP | C# / C++ فقط |
| **Performance** | ⭐⭐⭐ جيد | ⭐⭐⭐⭐⭐ ممتاز |
| **Documentation** | ⭐⭐ قليل | ⭐⭐⭐⭐ كثير |
| **Device Support** | ⚠️ Depends | ✅ All devices |
| **Maintenance** | ⭐⭐⭐⭐ سهل | ⭐⭐ متوسط |
| **Recommended** | ✅ إذا مدعوم | ✅ الأكثر استقراراً |

---

## 🎯 Decision Flowchart

```
هل تريد تنفيذ Face + Card Registration؟
    ↓
    نعم
    ↓
هل جهازك يدعم ISAPI؟ (اختبر بـ curl)
    ↓
    ├─ نعم → استخدم ISAPI Implementation
    │           (أسرع وأبسط)
    │
    └─ لا → استخدم SDK Wrapper
                (أكثر استقراراً)
```

---

## ✅ Next Steps (ISAPI Route)

1. **Test Device:**
   ```bash
   curl -u admin:password http://192.168.1.64/ISAPI/System/capabilities
   ```

2. **Check Face Support:**
   ```bash
   curl -u admin:password http://192.168.1.64/ISAPI/AccessControl/capabilities
   ```

3. **If Supported:**
   - نسخ `hikvisionISAPIService.js`
   - تحديث routes في Backend
   - اختبار بـ Postman
   - ربط مع Frontend

4. **If Not Supported:**
   - استخدم SDK Wrapper من `SDK-IMPLEMENTATION-GUIDE.md`

---

## 📞 Support & Resources

### **Hikvision Documentation:**
- ISAPI Reference Manual (check device CD/documentation)
- Device-specific API Guide

### **Community Resources:**
- GitHub: Search for "hikvision isapi" examples
- Forums: ipcamtalk.com, cctvforum.com

### **Testing Tools:**
- Postman (for REST API testing)
- curl (for command-line testing)
- Wireshark (for protocol analysis)

---

**ملاحظة نهائية:**  
ISAPI هو **الخيار الأمثل** إذا كان مدعوماً من جهازك، لكن يجب **التأكد** من الدعم أولاً.
