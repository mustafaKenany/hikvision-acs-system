using System;
using System.Runtime.InteropServices;

namespace PreviewDemo
{
    /// <summary>
    /// Face management extensions for CHCNetSDK — structs and P/Invoke for NET_DVR_SET_FACE
    /// </summary>
    public partial class CHCNetSDK
    {
        // ─── Constants ────────────────────────────────────────────────────────────

        /// <summary>Remote-config command: upload face record to device</summary>
        public const int NET_DVR_SET_FACE = 2207;

        /// <summary>NET_DVR_SendWithRecvRemoteConfig return values</summary>
        public const int NET_SDK_GET_NEXT_STATUS_SUCCESS   = 1000;
        public const int NET_SDK_GET_NEXT_STATUS_NEED_WAIT = 1001;
        public const int NET_SDK_GET_NEXT_STATUS_FAILED    = 1002;

        // ─── Structs ──────────────────────────────────────────────────────────────

        /// <summary>
        /// Condition structure passed to NET_DVR_StartRemoteConfig when setting face data.
        /// Identifies which card (employee) and which reader to configure.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct NET_DVR_FACE_COND
        {
            public uint dwSize;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = ACS_CARD_NO_LEN)]
            public byte[] byCardNo;

            /// <summary>Number of face records to send (usually 1)</summary>
            public uint dwFaceNum;

            /// <summary>Reader number bitmask (1-indexed, 1 = reader 1)</summary>
            public uint dwEnableReaderNo;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
            public byte[] byRes;

            public void init()
            {
                byCardNo = new byte[ACS_CARD_NO_LEN];
                byRes    = new byte[64];
            }
        }

        /// <summary>
        /// Face record sent to the device via NET_DVR_SendWithRecvRemoteConfig.
        /// Contains card number and a pointer to JPEG image bytes.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct NET_DVR_FACE_RECORD
        {
            public uint dwSize;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = ACS_CARD_NO_LEN)]
            public byte[] byCardNo;

            /// <summary>Length in bytes of the face image data pointed to by pFaceBuffer</summary>
            public uint dwFaceLen;

            /// <summary>Pointer to face image bytes (JPEG, max ~200 KB)</summary>
            public IntPtr pFaceBuffer;

            /// <summary>Face index on the device (0-based)</summary>
            public byte byFaceID;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 31)]
            public byte[] byRes;

            public void init()
            {
                byCardNo   = new byte[ACS_CARD_NO_LEN];
                byRes      = new byte[31];
                pFaceBuffer = IntPtr.Zero;
            }
        }

        /// <summary>
        /// Status structure filled by the device after processing NET_DVR_FACE_RECORD.
        /// byRecvStatus == 1 means the device accepted the face.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct NET_DVR_FACE_STATUS
        {
            public uint dwSize;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = ACS_CARD_NO_LEN)]
            public byte[] byCardNo;

            /// <summary>0 = failed / rejected, 1 = success</summary>
            public byte byRecvStatus;

            public byte byFaceID;

            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 30)]
            public byte[] byRes;

            public void init()
            {
                byCardNo = new byte[ACS_CARD_NO_LEN];
                byRes    = new byte[30];
            }
        }

        // ─── P/Invoke ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Sends a face record and receives device status in a single call.
        /// Return value is one of NET_SDK_GET_NEXT_STATUS_*.
        /// </summary>
        [DllImportAttribute(@"HCNetSDK.dll")]
        public static extern int NET_DVR_SendWithRecvRemoteConfig(
            int    lHandle,
            ref NET_DVR_FACE_RECORD pSendBuf, int dwSendBufSize,
            ref NET_DVR_FACE_STATUS pRecvBuf, int dwRecvBufSize,
            IntPtr pRecvedLen
        );
    }
}
