using Microsoft.AspNetCore.Mvc;
using HikvisionSDKService.Models;
using HikvisionSDKService.Services;

namespace HikvisionSDKService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaceController : ControllerBase
    {
        private readonly HikvisionService _sdk;
        private readonly ILogger<FaceController> _logger;

        public FaceController(HikvisionService sdk, ILogger<FaceController> logger)
        {
            _sdk = sdk;
            _logger = logger;
        }

        /// <summary>
        /// Register a face image to the device for an employee
        /// POST /api/face/register
        /// Body: { ip, port, username, password, employeeNo, name, cardNo, faceImageBase64, readerNo }
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<bool>>> Register([FromBody] FaceRegisterWithDeviceRequest request)
        {
            // Auto-login with device credentials included in request
            var loginResult = await _sdk.LoginAsync(
                request.Ip, request.Port,
                request.Username, request.Password
            );

            if (!loginResult.Success)
                return BadRequest(loginResult);

            var result = await _sdk.RegisterFaceAsync(
                request.Ip, request.Port,
                request.EmployeeNo, request.Name, request.CardNo,
                request.FaceImageBase64, request.ReaderNo
            );

            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        /// <summary>
        /// Health check
        /// GET /api/face/health
        /// </summary>
        [HttpGet("health")]
        public ActionResult Health()
        {
            return Ok(new { status = "ok", service = "Hikvision SDK Service", timestamp = DateTime.UtcNow });
        }
    }

    public class FaceRegisterWithDeviceRequest : FaceRegisterRequest
    {
        public string Ip { get; set; } = "";
        public int Port { get; set; } = 8000;
        public string Username { get; set; } = "admin";
        public string Password { get; set; } = "";
    }
}
