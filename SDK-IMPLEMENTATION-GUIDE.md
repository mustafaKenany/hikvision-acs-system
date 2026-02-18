# دليل تنفيذ Hikvision SDK Integration
**نسخة تفصيلية للتطبيق العملي**

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Vue.js Frontend│
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP REST
         ↓
┌─────────────────┐
│  Node.js Backend│
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP REST
         ↓
┌─────────────────┐
│  C# SDK Service │ ← هذا ما نحتاج إنشاؤه
│  (Port 5000)    │
└────────┬────────┘
         │ TCP Binary (HCNetSDK.dll)
         ↓
┌─────────────────┐
│ Hikvision Device│
│  (192.168.1.x)  │
└─────────────────┘
```

---

## 📦 Part 1: C# SDK Wrapper Service

### **Project Setup**

```bash
# 1. إنشاء C# Web API Project
mkdir HikvisionSDKService
cd HikvisionSDKService
dotnet new webapi -n HikvisionSDKService

# 2. إضافة Dependencies
dotnet add package Swashbuckle.AspNetCore  # للـ API Documentation
```

### **Project Structure**

```
HikvisionSDKService/
├── Controllers/
│   ├── FaceController.cs
│   └── CardController.cs
├── Services/
│   ├── HikvisionSDKService.cs
│   └── IHikvisionSDKService.cs
├── Models/
│   ├── FaceRegistrationRequest.cs
│   ├── CardRegistrationRequest.cs
│   └── ApiResponse.cs
├── SDK/
│   ├── CHCNetSDK.cs        ← نسخ من Demo
│   ├── HCNetSDK.dll        ← من SDK folder
│   ├── HCCore.dll
│   └── ...DLL dependencies
└── Program.cs
```

---

### **Code Implementation**

#### **1. Models/FaceRegistrationRequest.cs**

```csharp
namespace HikvisionSDKService.Models
{
    public class FaceRegistrationRequest
    {
        public string CardNo { get; set; }          // "12345678"
        public int EmployeeNo { get; set; }         // 1001
        public string FaceImageBase64 { get; set; } // Base64 JPG image
        public int ReaderNo { get; set; } = 1;      // Card Reader Number
    }

    public class CardRegistrationRequest
    {
        public string CardNo { get; set; }          // "12345678"
        public int EmployeeNo { get; set; }         // 1001
        public string Name { get; set; }            // "Ahmed Ali"
        public int CardRightPlan { get; set; } = 1; // Access Plan ID
        public bool DoorRight { get; set; } = true; // Door Access
        public DateTime ValidFrom { get; set; } = DateTime.Parse("2000-01-01");
        public DateTime ValidTo { get; set; } = DateTime.Parse("2030-12-31");
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public int ErrorCode { get; set; }
    }
}
```

---

#### **2. Services/IHikvisionSDKService.cs**

```csharp
using HikvisionSDKService.Models;

namespace HikvisionSDKService.Services
{
    public interface IHikvisionSDKService
    {
        Task<bool> LoginAsync(string ip, int port, string username, string password);
        Task<bool> LogoutAsync();
        Task<ApiResponse<bool>> RegisterFaceAsync(FaceRegistrationRequest request);
        Task<ApiResponse<bool>> RegisterCardAsync(CardRegistrationRequest request);
        Task<ApiResponse<bool>> DeleteFaceAsync(string cardNo);
        Task<ApiResponse<bool>> DeleteCardAsync(string cardNo);
        Task<ApiResponse<object>> GetCardInfoAsync(string cardNo);
    }
}
```

---

#### **3. Services/HikvisionSDKService.cs**

```csharp
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using HikvisionSDKService.Models;
using HikvisionSDKService.SDK;

namespace HikvisionSDKService.Services
{
    public class HikvisionSDKService : IHikvisionSDKService
    {
        private int _userId = -1;
        private bool _isConnected = false;
        private readonly ILogger<HikvisionSDKService> _logger;

        public HikvisionSDKService(ILogger<HikvisionSDKService> logger)
        {
            _logger = logger;
            
            // Initialize SDK
            if (!CHCNetSDK.NET_DVR_Init())
            {
                _logger.LogError("NET_DVR_Init failed!");
                throw new Exception("Failed to initialize Hikvision SDK");
            }

            // Enable Log
            CHCNetSDK.NET_DVR_SetLogToFile(3, "./SDKLogs/", true);
        }

        public async Task<bool> LoginAsync(string ip, int port, string username, string password)
        {
            return await Task.Run(() =>
            {
                var loginInfo = new CHCNetSDK.NET_DVR_USER_LOGIN_INFO
                {
                    sDeviceAddress = ip,
                    wPort = (ushort)port,
                    sUserName = username,
                    sPassword = password,
                    bUseAsynLogin = false,
                    byLoginMode = 0 // 0=Private, 1=ISAPI
                };

                var deviceInfo = new CHCNetSDK.NET_DVR_DEVICEINFO_V40();
                
                _userId = CHCNetSDK.NET_DVR_Login_V40(ref loginInfo, ref deviceInfo);

                if (_userId < 0)
                {
                    var errorCode = CHCNetSDK.NET_DVR_GetLastError();
                    _logger.LogError($"Login failed. Error code: {errorCode}");
                    _isConnected = false;
                    return false;
                }

                _logger.LogInformation($"Login successful. User ID: {_userId}");
                _isConnected = true;
                return true;
            });
        }

        public async Task<bool> LogoutAsync()
        {
            return await Task.Run(() =>
            {
                if (_userId >= 0)
                {
                    CHCNetSDK.NET_DVR_Logout_V30(_userId);
                    _userId = -1;
                    _isConnected = false;
                }
                return true;
            });
        }

        public async Task<ApiResponse<bool>> RegisterFaceAsync(FaceRegistrationRequest request)
        {
            return await Task.Run(() =>
            {
                if (!_isConnected || _userId < 0)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Not connected to device",
                        ErrorCode = -1
                    };
                }

                try
                {
                    // 1. Prepare condition
                    var struCond = new CHCNetSDK.NET_DVR_FACE_COND();
                    struCond.init();
                    struCond.dwSize = Marshal.SizeOf(struCond);
                    struCond.dwFaceNum = 1;
                    struCond.dwEnableReaderNo = request.ReaderNo;

                    var byCardNo = Encoding.UTF8.GetBytes(request.CardNo);
                    for (int i = 0; i < byCardNo.Length && i < CHCNetSDK.ACS_CARD_NO_LEN; i++)
                    {
                        struCond.byCardNo[i] = byCardNo[i];
                    }

                    IntPtr ptrStruCond = Marshal.AllocHGlobal(struCond.dwSize);
                    Marshal.StructureToPtr(struCond, ptrStruCond, false);

                    // 2. Start remote config
                    var handle = CHCNetSDK.NET_DVR_StartRemoteConfig(
                        _userId,
                        CHCNetSDK.NET_DVR_SET_FACE,
                        ptrStruCond,
                        struCond.dwSize,
                        null,
                        IntPtr.Zero
                    );

                    if (handle < 0)
                    {
                        Marshal.FreeHGlobal(ptrStruCond);
                        var errorCode = CHCNetSDK.NET_DVR_GetLastError();
                        return new ApiResponse<bool>
                        {
                            Success = false,
                            Message = $"Failed to start face registration. Error: {errorCode}",
                            ErrorCode = errorCode
                        };
                    }

                    // 3. Prepare face data
                    var struRecord = new CHCNetSDK.NET_DVR_FACE_RECORD();
                    struRecord.init();
                    struRecord.dwSize = Marshal.SizeOf(struRecord);

                    // Card number
                    for (int i = 0; i < byCardNo.Length && i < CHCNetSDK.ACS_CARD_NO_LEN; i++)
                    {
                        struRecord.byCardNo[i] = byCardNo[i];
                    }

                    // Face image
                    var faceImageBytes = Convert.FromBase64String(request.FaceImageBase64);
                    
                    if (faceImageBytes.Length > 200 * 1024)
                    {
                        CHCNetSDK.NET_DVR_StopRemoteConfig(handle);
                        Marshal.FreeHGlobal(ptrStruCond);
                        return new ApiResponse<bool>
                        {
                            Success = false,
                            Message = "Face image size exceeds 200KB limit",
                            ErrorCode = -2
                        };
                    }

                    struRecord.dwFaceLen = faceImageBytes.Length;
                    struRecord.pFaceBuffer = Marshal.AllocHGlobal(faceImageBytes.Length);
                    Marshal.Copy(faceImageBytes, 0, struRecord.pFaceBuffer, faceImageBytes.Length);

                    // 4. Send data
                    var struStatus = new CHCNetSDK.NET_DVR_FACE_STATUS();
                    struStatus.init();
                    struStatus.dwSize = Marshal.SizeOf(struStatus);

                    IntPtr ptrOutDataLen = Marshal.AllocHGlobal(sizeof(int));
                    bool success = false;
                    string errorMsg = "";

                    int dwStatus;
                    do
                    {
                        dwStatus = CHCNetSDK.NET_DVR_SendWithRecvRemoteConfig(
                            handle,
                            ref struRecord,
                            struRecord.dwSize,
                            ref struStatus,
                            struStatus.dwSize,
                            ptrOutDataLen
                        );

                        switch (dwStatus)
                        {
                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_SUCCESS:
                                if (struStatus.byRecvStatus == 1)
                                {
                                    success = true;
                                    errorMsg = "Face registered successfully";
                                }
                                else
                                {
                                    errorMsg = $"Face registration failed. Status: {struStatus.byRecvStatus}";
                                }
                                break;

                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_NEED_WAIT:
                                System.Threading.Thread.Sleep(10);
                                continue;

                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_FAILED:
                                errorMsg = $"Failed. Error: {CHCNetSDK.NET_DVR_GetLastError()}";
                                break;

                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_FINISH:
                                break;
                        }

                    } while (dwStatus == CHCNetSDK.NET_SDK_GET_NEXT_STATUS_NEED_WAIT);

                    // 5. Cleanup
                    CHCNetSDK.NET_DVR_StopRemoteConfig(handle);
                    Marshal.FreeHGlobal(struRecord.pFaceBuffer);
                    Marshal.FreeHGlobal(ptrStruCond);
                    Marshal.FreeHGlobal(ptrOutDataLen);

                    return new ApiResponse<bool>
                    {
                        Success = success,
                        Message = errorMsg,
                        Data = success,
                        ErrorCode = success ? 0 : -3
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in RegisterFaceAsync");
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Message = ex.Message,
                        ErrorCode = -999
                    };
                }
            });
        }

        public async Task<ApiResponse<bool>> RegisterCardAsync(CardRegistrationRequest request)
        {
            return await Task.Run(() =>
            {
                if (!_isConnected || _userId < 0)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Not connected to device",
                        ErrorCode = -1
                    };
                }

                try
                {
                    // 1. Prepare condition
                    var struCond = new CHCNetSDK.NET_DVR_CARD_COND();
                    struCond.Init();
                    struCond.dwSize = (uint)Marshal.SizeOf(struCond);
                    struCond.dwCardNum = 1;

                    IntPtr ptrStruCond = Marshal.AllocHGlobal((int)struCond.dwSize);
                    Marshal.StructureToPtr(struCond, ptrStruCond, false);

                    // 2. Start remote config
                    var handle = CHCNetSDK.NET_DVR_StartRemoteConfig(
                        _userId,
                        CHCNetSDK.NET_DVR_SET_CARD,
                        ptrStruCond,
                        (int)struCond.dwSize,
                        null,
                        IntPtr.Zero
                    );

                    if (handle < 0)
                    {
                        Marshal.FreeHGlobal(ptrStruCond);
                        var errorCode = CHCNetSDK.NET_DVR_GetLastError();
                        return new ApiResponse<bool>
                        {
                            Success = false,
                            Message = $"Failed to start card registration. Error: {errorCode}",
                            ErrorCode = errorCode
                        };
                    }

                    // 3. Prepare card data
                    var struData = new CHCNetSDK.NET_DVR_CARD_RECORD();
                    struData.Init();
                    struData.dwSize = (uint)Marshal.SizeOf(struData);
                    struData.byCardType = 1; // Normal card

                    // Card number
                    var byCardNo = Encoding.UTF8.GetBytes(request.CardNo);
                    for (int i = 0; i < byCardNo.Length && i < CHCNetSDK.ACS_CARD_NO_LEN; i++)
                    {
                        struData.byCardNo[i] = byCardNo[i];
                    }

                    // Employee info
                    struData.dwEmployeeNo = (uint)request.EmployeeNo;
                    
                    var byName = Encoding.Default.GetBytes(request.Name);
                    for (int i = 0; i < byName.Length && i < 32; i++)
                    {
                        struData.byName[i] = byName[i];
                    }

                    // Access rights
                    struData.wCardRightPlan[0] = (ushort)request.CardRightPlan;
                    struData.byDoorRight[0] = (byte)(request.DoorRight ? 1 : 0);

                    // Validity period
                    struData.struValid.byEnable = 1;
                    struData.struValid.struBeginTime.wYear = (ushort)request.ValidFrom.Year;
                    struData.struValid.struBeginTime.byMonth = (byte)request.ValidFrom.Month;
                    struData.struValid.struBeginTime.byDay = (byte)request.ValidFrom.Day;
                    struData.struValid.struEndTime.wYear = (ushort)request.ValidTo.Year;
                    struData.struValid.struEndTime.byMonth = (byte)request.ValidTo.Month;
                    struData.struValid.struEndTime.byDay = (byte)request.ValidTo.Day;

                    IntPtr ptrStruData = Marshal.AllocHGlobal((int)struData.dwSize);
                    Marshal.StructureToPtr(struData, ptrStruData, false);

                    // 4. Send data
                    var struStatus = new CHCNetSDK.NET_DVR_CARD_STATUS();
                    struStatus.Init();
                    struStatus.dwSize = (uint)Marshal.SizeOf(struStatus);
                    
                    IntPtr ptrdwState = Marshal.AllocHGlobal((int)struStatus.dwSize);
                    Marshal.StructureToPtr(struStatus, ptrdwState, false);

                    uint dwReturned = 0;
                    bool success = false;
                    string errorMsg = "";

                    int dwState;
                    do
                    {
                        dwState = CHCNetSDK.NET_DVR_SendWithRecvRemoteConfig(
                            handle,
                            ptrStruData,
                            struData.dwSize,
                            ptrdwState,
                            struStatus.dwSize,
                            ref dwReturned
                        );

                        struStatus = (CHCNetSDK.NET_DVR_CARD_STATUS)Marshal.PtrToStructure(
                            ptrdwState,
                            typeof(CHCNetSDK.NET_DVR_CARD_STATUS)
                        );

                        switch (dwState)
                        {
                            case (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_SUCCESS:
                                if (struStatus.dwErrorCode == 0)
                                {
                                    success = true;
                                    errorMsg = "Card registered successfully";
                                }
                                else
                                {
                                    errorMsg = $"Card registration error code: {struStatus.dwErrorCode}";
                                }
                                break;

                            case (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_NEEDWAIT:
                                System.Threading.Thread.Sleep(10);
                                continue;

                            case (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_FAILED:
                                errorMsg = $"Failed. Error: {CHCNetSDK.NET_DVR_GetLastError()}";
                                break;

                            case (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_FINISH:
                                break;

                            case (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_EXCEPTION:
                                errorMsg = $"Exception. Error: {CHCNetSDK.NET_DVR_GetLastError()}";
                                break;
                        }

                    } while (dwState == (int)CHCNetSDK.NET_SDK_SENDWITHRECV_STATUS.NET_SDK_CONFIG_STATUS_NEEDWAIT);

                    // 5. Cleanup
                    CHCNetSDK.NET_DVR_StopRemoteConfig(handle);
                    Marshal.FreeHGlobal(ptrStruCond);
                    Marshal.FreeHGlobal(ptrStruData);
                    Marshal.FreeHGlobal(ptrdwState);

                    return new ApiResponse<bool>
                    {
                        Success = success,
                        Message = errorMsg,
                        Data = success,
                        ErrorCode = success ? 0 : -3
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in RegisterCardAsync");
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Message = ex.Message,
                        ErrorCode = -999
                    };
                }
            });
        }

        public async Task<ApiResponse<bool>> DeleteFaceAsync(string cardNo)
        {
            // TODO: Implement NET_DVR_DEL_FACE_PARAM_CFG
            throw new NotImplementedException();
        }

        public async Task<ApiResponse<bool>> DeleteCardAsync(string cardNo)
        {
            // TODO: Implement NET_DVR_DEL_CARD
            throw new NotImplementedException();
        }

        public async Task<ApiResponse<object>> GetCardInfoAsync(string cardNo)
        {
            // TODO: Implement NET_DVR_GET_CARD
            throw new NotImplementedException();
        }
    }
}
```

---

#### **4. Controllers/FaceController.cs**

```csharp
using Microsoft.AspNetCore.Mvc;
using HikvisionSDKService.Models;
using HikvisionSDKService.Services;

namespace HikvisionSDKService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaceController : ControllerBase
    {
        private readonly IHikvisionSDKService _sdkService;
        private readonly ILogger<FaceController> _logger;

        public FaceController(IHikvisionSDKService sdkService, ILogger<FaceController> logger)
        {
            _sdkService = sdkService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<bool>>> RegisterFace([FromBody] FaceRegistrationRequest request)
        {
            try
            {
                var result = await _sdkService.RegisterFaceAsync(request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering face");
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = -999
                });
            }
        }

        [HttpDelete("{cardNo}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteFace(string cardNo)
        {
            try
            {
                var result = await _sdkService.DeleteFaceAsync(cardNo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting face");
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = -999
                });
            }
        }
    }
}
```

---

#### **5. Controllers/CardController.cs**

```csharp
using Microsoft.AspNetCore.Mvc;
using HikvisionSDKService.Models;
using HikvisionSDKService.Services;

namespace HikvisionSDKService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardController : ControllerBase
    {
        private readonly IHikvisionSDKService _sdkService;
        private readonly ILogger<CardController> _logger;

        public CardController(IHikvisionSDKService sdkService, ILogger<CardController> logger)
        {
            _sdkService = sdkService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<bool>>> RegisterCard([FromBody] CardRegistrationRequest request)
        {
            try
            {
                var result = await _sdkService.RegisterCardAsync(request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering card");
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = -999
                });
            }
        }

        [HttpGet("{cardNo}")]
        public async Task<ActionResult<ApiResponse<object>>> GetCard(string cardNo)
        {
            try
            {
                var result = await _sdkService.GetCardInfoAsync(cardNo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting card info");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = -999
                });
            }
        }

        [HttpDelete("{cardNo}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCard(string cardNo)
        {
            try
            {
                var result = await _sdkService.DeleteCardAsync(cardNo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting card");
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = -999
                });
            }
        }
    }
}
```

---

#### **6. Program.cs**

```csharp
using HikvisionSDKService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Hikvision SDK Service as Singleton (maintains connection)
builder.Services.AddSingleton<IHikvisionSDKService, HikvisionSDKService.Services.HikvisionSDKService>();

// CORS للسماح للـ Frontend بالاتصال
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

//  Auto-login to device عند بدء التشغيل
var sdkService = app.Services.GetRequiredService<IHikvisionSDKService>();
await sdkService.LoginAsync(
    ip: "192.168.1.64",      // عنوان الجهاز
    port: 8000,             // Port الافتراضي
    username: "admin",
    password: "admin123"
);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 📦 Part 2: Node.js Backend Integration

### **routes/hikvision.js**

```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

const HIKVISION_SDK_SERVICE = 'http://localhost:5000'; // C# Service URL

// Face Registration
router.post('/face/register', async (req, res) => {
  try {
    const { cardNo, employeeNo, faceImageBase64, readerNo } = req.body;

    // Call C# SDK Service
    const response = await axios.post(`${HIKVISION_SDK_SERVICE}/api/face/register`, {
      cardNo,
      employeeNo,
      faceImageBase64,
      readerNo: readerNo || 1
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error registering face:', error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
});

// Card Registration
router.post('/card/register', async (req, res) => {
  try {
    const { cardNo, employeeNo, name, cardRightPlan, doorRight } = req.body;

    const response = await axios.post(`${HIKVISION_SDK_SERVICE}/api/card/register`, {
      cardNo,
      employeeNo,
      name,
      cardRightPlan: cardRightPlan || 1,
      doorRight: doorRight !== false,
      validFrom: '2000-01-01',
      validTo: '2030-12-31'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error registering card:', error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
});

// Complete Employee Registration (Card + Face)
router.post('/employee/register-complete', async (req, res) => {
  try {
    const { cardNo, employeeNo, name, faceImageBase64 } = req.body;

    // Step 1: Register Card
    const cardResponse = await axios.post(`${HIKVISION_SDK_SERVICE}/api/card/register`, {
      cardNo,
      employeeNo,
      name,
      cardRightPlan: 1,
      doorRight: true,
      validFrom: '2000-01-01',
      validTo: '2030-12-31'
    });

    if (!cardResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to register card: ' + cardResponse.data.message
      });
    }

    // Step 2: Register Face (if provided)
    if (faceImageBase64) {
      const faceResponse = await axios.post(`${HIKVISION_SDK_SERVICE}/api/face/register`, {
        cardNo,
        employeeNo,
        faceImageBase64,
        readerNo: 1
      });

      if (!faceResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Card registered but face registration failed: ' + faceResponse.data.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Employee registered successfully with card and face',
      data: {
        cardNo,
        employeeNo,
        name,
        hasFace: !!faceImageBase64
      }
    });
  } catch (error) {
    console.error('Error in complete registration:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

---

### **Update app.js**

```javascript
// ... existing code

const hikvisionRoutes = require('./routes/hikvision');

// ... after other routes
app.use('/api/hikvision', hikvisionRoutes);

// ... rest of the code
```

---

## 🎨 Part 3: Frontend Vue.js Integration

### **src/composables/useHikvision.js**

```javascript
import { ref } from 'vue';
import axios from '@/api/axios';

export function useHikvision() {
  const loading = ref(false);
  const error = ref(null);

  const registerCard = async (employeeData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post('/hikvision/card/register', {
        cardNo: employeeData.cardNo,
        employeeNo: employeeData.employeeNo,
        name: employeeData.name,
        cardRightPlan: 1,
        doorRight: true
      });

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerFace = async (employeeData, faceImageBase64) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post('/hikvision/face/register', {
        cardNo: employeeData.cardNo,
        employeeNo: employeeData.employeeNo,
        faceImageBase64,
        readerNo: 1
      });

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerCompleteEmployee = async (employeeData, faceImageBase64) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post('/hikvision/employee/register-complete', {
        cardNo: employeeData.cardNo,
        employeeNo: employeeData.employeeNo,
        name: employeeData.name,
        faceImageBase64
      });

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    registerCard,
    registerFace,
    registerCompleteEmployee
  };
}
```

---

### **Update EmployeeDialog.vue**

```vue
<template>
  <!-- ... existing code ... -->
  
  <!-- Add Face Upload Section -->
  <v-card-text>
    <v-file-input
      v-model="faceImage"
      label="Upload Face Photo (Optional)"
      accept="image/jpeg,image/jpg"
      prepend-icon="mdi-camera"
      @change="handleFaceImageChange"
    />
    
    <v-img
      v-if="faceImagePreview"
      :src="faceImagePreview"
      max-height="200"
      class="mt-2"
    />
  </v-card-text>

  <!-- ... existing code ... -->
</template>

<script setup>
import { ref, watch } from 'vue';
import { useHikvision } from '@/composables/useHikvision';

const { registerCompleteEmployee, loading: hikvisionLoading } = useHikvision();

const faceImage = ref(null);
const faceImagePreview = ref(null);
const faceImageBase64 = ref(null);

const handleFaceImageChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 200KB)
  if (file.size > 200 * 1024) {
    showNotification('Face image must be less than 200KB', 'error');
    faceImage.value = null;
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    faceImagePreview.value = e.target.result;
    // Extract base64 (remove data:image/jpeg;base64, prefix)
    faceImageBase64.value = e.target.result.split(',')[1];
  };
  reader.readAsDataURL(file);
};

const submitForm = async () => {
  if (!formValid.value) return;

  try {
    loading.value = true;

    // Save to local database
    const employeeData = {
      ...form.value,
      cardNo: form.value.cardNumber,
      employeeNo: parseInt(form.value.employeeId)
    };

    let response;
    if (props.employee) {
      response = await updateEmployee(props.employee.id, employeeData);
    } else {
      response = await createEmployee(employeeData);
    }

    if (response.success) {
      // Register to Hikvision device
      try {
        await registerCompleteEmployee(employeeData, faceImageBase64.value);
        showNotification('Employee registered to access control system', 'success');
      } catch (hikvisionError) {
        console.error('Hikvision registration error:', hikvisionError);
        showNotification('Employee saved but access control registration failed', 'warning');
      }

      emit('saved');
      closeDialog();
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 🚀 Deployment & Testing

### **Run C# Service:**

```bash
cd HikvisionSDKService
dotnet run

# Service will be available at: http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

### **Test with Postman:**

**1. Register Card:**
```http
POST http://localhost:5000/api/card/register
Content-Type: application/json

{
  "cardNo": "12345678",
  "employeeNo": 1001,
  "name": "Ahmed Ali",
  "cardRightPlan": 1,
  "doorRight": true
}
```

**2. Register Face:**
```http
POST http://localhost:5000/api/face/register
Content-Type: application/json

{
  "cardNo": "12345678",
  "employeeNo": 1001,
  "faceImageBase64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "readerNo": 1
}
```

---

## 📋 Checklist

- [ ] إنشاء C# SDK Service Project
- [ ] نسخ HCNetSDK.dll وملفاته
- [ ] نسخ CHCNetSDK.cs من Demo
- [ ] تنفيذ FaceController & CardController
- [ ] اختبار Login إلى الجهاز
- [ ] اختبار Card Registration
- [ ] اختبار Face Registration
- [ ] ربط مع Node.js Backend
- [ ] تحديث Frontend (Vue.js)
- [ ] اختبار شامل

---

**Timeline:** 5-7 أيام عمل للتنفيذ الكامل
