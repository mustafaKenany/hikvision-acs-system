using System.Runtime.InteropServices;
using System.Text;
using HikvisionSDKService.Models;
using PreviewDemo;

namespace HikvisionSDKService.Services
{
    public class HikvisionService : IDisposable
    {
        private readonly ILogger<HikvisionService> _logger;
        // userId per device ip:port
        private readonly Dictionary<string, int> _sessions = new();
        private bool _initialized = false;

        public HikvisionService(ILogger<HikvisionService> logger)
        {
            _logger = logger;
            if (CHCNetSDK.NET_DVR_Init())
            {
                CHCNetSDK.NET_DVR_SetLogToFile(3, "./SDKLogs/", true);
                _initialized = true;
                _logger.LogInformation("Hikvision SDK initialized successfully");
            }
            else
            {
                _logger.LogError("Hikvision SDK initialization failed");
            }
        }

        public async Task<ApiResponse<bool>> LoginAsync(string ip, int port, string username, string password)
        {
            return await Task.Run(() =>
            {
                var key = $"{ip}:{port}";

                // Logout existing session
                if (_sessions.TryGetValue(key, out int existingId) && existingId >= 0)
                {
                    CHCNetSDK.NET_DVR_Logout_V30(existingId);
                    _sessions.Remove(key);
                }

                // Build login info — all string fields are byte[] in the SDK struct
                var loginInfo = new CHCNetSDK.NET_DVR_USER_LOGIN_INFO();
                loginInfo.sDeviceAddress = new byte[CHCNetSDK.NET_DVR_DEV_ADDRESS_MAX_LEN];
                loginInfo.sUserName      = new byte[CHCNetSDK.NET_DVR_LOGIN_USERNAME_MAX_LEN];
                loginInfo.sPassword      = new byte[CHCNetSDK.NET_DVR_LOGIN_PASSWD_MAX_LEN];
                loginInfo.byRes3         = new byte[119];

                CopyStringToBytes(ip,       loginInfo.sDeviceAddress);
                CopyStringToBytes(username, loginInfo.sUserName);
                CopyStringToBytes(password, loginInfo.sPassword);

                loginInfo.wPort        = (ushort)port;
                loginInfo.bUseAsynLogin = false;
                loginInfo.byLoginMode  = 0; // 0 = Private protocol (binary TCP)

                var deviceInfo = new CHCNetSDK.NET_DVR_DEVICEINFO_V40();
                int userId = CHCNetSDK.NET_DVR_Login_V40(ref loginInfo, ref deviceInfo);

                if (userId < 0)
                {
                    int err = (int)CHCNetSDK.NET_DVR_GetLastError();
                    _logger.LogError($"Login failed to {ip}:{port} - Error: {err}");
                    return new ApiResponse<bool>
                    {
                        Success   = false,
                        Message   = $"Login failed. Error code: {err}",
                        ErrorCode = err
                    };
                }

                _sessions[key] = userId;
                _logger.LogInformation($"Logged in to {ip}:{port} - UserID: {userId}");

                return new ApiResponse<bool>
                {
                    Success = true,
                    Message = $"Connected to {ip}:{port}",
                    Data    = true
                };
            });
        }

        public async Task<ApiResponse<bool>> RegisterFaceAsync(
            string ip, int port,
            string employeeNo, string name, string cardNo,
            string faceImageBase64, int readerNo = 1)
        {
            return await Task.Run(() =>
            {
                var key = $"{ip}:{port}";
                if (!_sessions.TryGetValue(key, out int userId) || userId < 0)
                {
                    return new ApiResponse<bool>
                    {
                        Success   = false,
                        Message   = "Not logged in. Call /api/device/login first.",
                        ErrorCode = -1
                    };
                }

                try
                {
                    // Build face condition
                    var cond = new CHCNetSDK.NET_DVR_FACE_COND();
                    cond.init();
                    cond.dwSize         = (uint)Marshal.SizeOf(cond);
                    cond.dwFaceNum      = 1;
                    cond.dwEnableReaderNo = (uint)readerNo;

                    // Use cardNo if provided, else use employeeNo as card
                    var cardBytes = Encoding.UTF8.GetBytes(string.IsNullOrEmpty(cardNo) ? employeeNo : cardNo);
                    for (int i = 0; i < cardBytes.Length && i < CHCNetSDK.ACS_CARD_NO_LEN; i++)
                        cond.byCardNo[i] = cardBytes[i];

                    IntPtr pCond = Marshal.AllocHGlobal((int)cond.dwSize);
                    Marshal.StructureToPtr(cond, pCond, false);

                    // Start remote config for face upload
                    int handle = CHCNetSDK.NET_DVR_StartRemoteConfig(
                        userId,
                        CHCNetSDK.NET_DVR_SET_FACE,
                        pCond, (int)cond.dwSize,
                        null, IntPtr.Zero
                    );

                    Marshal.FreeHGlobal(pCond);

                    if (handle < 0)
                    {
                        int err = (int)CHCNetSDK.NET_DVR_GetLastError();
                        _logger.LogError($"NET_DVR_StartRemoteConfig (SET_FACE) failed: {err}");
                        return new ApiResponse<bool>
                        {
                            Success   = false,
                            Message   = $"Failed to start face upload session. Error: {err}",
                            ErrorCode = err
                        };
                    }

                    // Prepare face record
                    var record = new CHCNetSDK.NET_DVR_FACE_RECORD();
                    record.init();
                    record.dwSize = (uint)Marshal.SizeOf(record);

                    for (int i = 0; i < cardBytes.Length && i < CHCNetSDK.ACS_CARD_NO_LEN; i++)
                        record.byCardNo[i] = cardBytes[i];

                    // Decode face image
                    byte[] imageBytes = Convert.FromBase64String(faceImageBase64);
                    if (imageBytes.Length > 200 * 1024)
                    {
                        CHCNetSDK.NET_DVR_StopRemoteConfig(handle);
                        return new ApiResponse<bool>
                        {
                            Success   = false,
                            Message   = "Face image must be under 200KB. Please compress it.",
                            ErrorCode = -2
                        };
                    }

                    record.dwFaceLen   = (uint)imageBytes.Length;
                    record.pFaceBuffer = Marshal.AllocHGlobal(imageBytes.Length);
                    Marshal.Copy(imageBytes, 0, record.pFaceBuffer, imageBytes.Length);

                    // Send & receive result
                    var status = new CHCNetSDK.NET_DVR_FACE_STATUS();
                    status.init();
                    status.dwSize = (uint)Marshal.SizeOf(status);

                    IntPtr pOutLen = Marshal.AllocHGlobal(sizeof(int));
                    bool success   = false;
                    string message = "Unknown result";
                    int dwState;

                    do
                    {
                        dwState = CHCNetSDK.NET_DVR_SendWithRecvRemoteConfig(
                            handle,
                            ref record, (int)record.dwSize,
                            ref status, (int)status.dwSize,
                            pOutLen
                        );

                        switch (dwState)
                        {
                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_SUCCESS:
                                if (status.byRecvStatus == 1)
                                {
                                    success = true;
                                    message = $"Face registered successfully for employee {employeeNo}";
                                    _logger.LogInformation(message);
                                }
                                else
                                {
                                    message = $"Device rejected face. Status code: {status.byRecvStatus}";
                                    _logger.LogWarning(message);
                                }
                                break;

                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_NEED_WAIT:
                                Thread.Sleep(5);
                                continue;

                            case CHCNetSDK.NET_SDK_GET_NEXT_STATUS_FAILED:
                                int err2 = (int)CHCNetSDK.NET_DVR_GetLastError();
                                message  = $"Send failed. Error: {err2}";
                                _logger.LogError(message);
                                break;

                            default:
                                break;
                        }

                    } while (dwState == CHCNetSDK.NET_SDK_GET_NEXT_STATUS_NEED_WAIT);

                    // Cleanup
                    CHCNetSDK.NET_DVR_StopRemoteConfig(handle);
                    Marshal.FreeHGlobal(record.pFaceBuffer);
                    Marshal.FreeHGlobal(pOutLen);

                    return new ApiResponse<bool>
                    {
                        Success   = success,
                        Message   = message,
                        Data      = success,
                        ErrorCode = success ? 0 : -3
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "RegisterFaceAsync exception");
                    return new ApiResponse<bool>
                    {
                        Success   = false,
                        Message   = ex.Message,
                        ErrorCode = -999
                    };
                }
            });
        }

        public async Task<ApiResponse<bool>> LogoutAsync(string ip, int port)
        {
            return await Task.Run(() =>
            {
                var key = $"{ip}:{port}";
                if (_sessions.TryGetValue(key, out int userId) && userId >= 0)
                {
                    CHCNetSDK.NET_DVR_Logout_V30(userId);
                    _sessions.Remove(key);
                }
                return new ApiResponse<bool> { Success = true, Message = "Logged out" };
            });
        }

        public void Dispose()
        {
            foreach (var uid in _sessions.Values)
                if (uid >= 0) CHCNetSDK.NET_DVR_Logout_V30(uid);
            _sessions.Clear();

            if (_initialized)
                CHCNetSDK.NET_DVR_Cleanup();
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static void CopyStringToBytes(string src, byte[] dest)
        {
            var bytes = Encoding.ASCII.GetBytes(src);
            int len   = Math.Min(bytes.Length, dest.Length - 1); // leave null terminator
            Array.Copy(bytes, dest, len);
        }
    }
}
