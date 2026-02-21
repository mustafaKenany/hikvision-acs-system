namespace HikvisionSDKService.Models
{
    public class FaceRegisterRequest
    {
        public string EmployeeNo { get; set; } = "";
        public string Name { get; set; } = "";
        public string CardNo { get; set; } = "";
        public string FaceImageBase64 { get; set; } = "";
        public int ReaderNo { get; set; } = 1;
    }

    public class DeviceLoginRequest
    {
        public string Ip { get; set; } = "";
        public int Port { get; set; } = 8000;
        public string Username { get; set; } = "admin";
        public string Password { get; set; } = "";
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public T? Data { get; set; }
        public int ErrorCode { get; set; }
    }
}
