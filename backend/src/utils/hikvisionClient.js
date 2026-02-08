/**
 * Hikvision HTTP API Client
 * عميل HTTP للاتصال بأجهزة Hikvision
 * 
 * Uses Digest Authentication for secure communication
 */

import DigestClient from 'digest-fetch';
import { parseStringPromise } from 'xml2js';

/**
 * Create a Hikvision client instance
 */
export class HikvisionClient {
  constructor(config) {
    this.ip = config.ip_address;
    this.port = config.port || 80;
    this.username = config.username;
    this.password = config.password;
    this.baseUrl = `http://${this.ip}:${this.port}`;
    
    // Create digest auth client
    this.client = new DigestClient(this.username, this.password, {
      algorithm: 'MD5',
      cnonceSize: 32
    });
  }

  /**
   * Test connection to device
   */
  async testConnection() {
    try {
      const url = `${this.baseUrl}/ISAPI/System/deviceInfo`;
      const response = await this.client.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data);

      return {
        success: true,
        connected: true,
        deviceInfo: {
          deviceName: result.DeviceInfo?.deviceName?.[0] || 'Unknown',
          deviceID: result.DeviceInfo?.deviceID?.[0] || 'Unknown',
          model: result.DeviceInfo?.model?.[0] || 'Unknown',
          serialNumber: result.DeviceInfo?.serialNumber?.[0] || 'Unknown',
          firmwareVersion: result.DeviceInfo?.firmwareVersion?.[0] || 'Unknown',
          firmwareReleasedDate: result.DeviceInfo?.firmwareReleasedDate?.[0] || 'Unknown'
        }
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get device capabilities
   */
  async getCapabilities() {
    try {
      const url = `${this.baseUrl}/ISAPI/System/capabilities`;
      const response = await this.client.fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data);

      return {
        success: true,
        capabilities: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get face database capacity
   */
  async getFaceCapacity() {
    try {
      const url = `${this.baseUrl}/ISAPI/Intelligent/FDLib/capabilities`;
      const response = await this.client.fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data);

      return {
        success: true,
        capacity: {
          maxFaceLibNum: result.FDLibCapabilities?.maxFaceLibNum?.[0] || 0,
          maxFaceNumPerLib: result.FDLibCapabilities?.maxFaceNumPerLib?.[0] || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload face data to device (DS-K1T series - Access Control Terminal)
   * Uses multipart/form-data instead of XML base64
   */
  async uploadFace(faceData) {
    try {
      const { employeeNo, name, faceLibId = 1, imageBase64 } = faceData;

      if (!imageBase64) {
        throw new Error('Face image is required');
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      // First, try to add/update user info
      const userInfoXml = `<?xml version="1.0" encoding="UTF-8"?>
<UserInfo version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <employeeNo>${employeeNo}</employeeNo>
  <name>${name}</name>
  <userType>normal</userType>
  <Valid>
    <enable>true</enable>
    <beginTime>2020-01-01T00:00:00</beginTime>
    <endTime>2030-12-31T23:59:59</endTime>
  </Valid>
  <doorRight>1</doorRight>
  <RightPlan>
    <doorNo>1</doorNo>
    <planTemplateNo>1</planTemplateNo>
  </RightPlan>
</UserInfo>`;

      // Add user to device
      const userUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json`;
      const userResponse = await this.client.fetch(userUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: userInfoXml
      });

      // Ignore 400 errors (user might already exist)
      if (!userResponse.ok && userResponse.status !== 400) {
        const errorText = await userResponse.text();
        console.warn(`User creation warning: ${userResponse.status} - ${errorText}`);
      }

      // Try Method 1: Multipart upload (works better for DS-K1T series)
      try {
        const boundary = `----WebKitFormBoundary${Date.now()}`;
        const CRLF = '\r\n';
        
        let body = '';
        body += `--${boundary}${CRLF}`;
        body += `Content-Disposition: form-data; name="FaceDataRecord"${CRLF}`;
        body += `Content-Type: application/xml${CRLF}${CRLF}`;
        body += `<?xml version="1.0" encoding="UTF-8"?>${CRLF}`;
        body += `<FaceDataRecord>${CRLF}`;
        body += `<employeeNo>${employeeNo}</employeeNo>${CRLF}`;
        body += `</FaceDataRecord>${CRLF}`;
        body += `--${boundary}${CRLF}`;
        body += `Content-Disposition: form-data; name="FaceImage"; filename="face.jpg"${CRLF}`;
        body += `Content-Type: image/jpeg${CRLF}${CRLF}`;
        
        const bodyBuffer = Buffer.concat([
          Buffer.from(body, 'utf8'),
          imageBuffer,
          Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8')
        ]);

        const multipartUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/SetFace?format=json`;
        const multipartResponse = await this.client.fetch(multipartUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length
          },
          body: bodyBuffer
        });

        if (multipartResponse.ok) {
          return {
            success: true,
            faceId: employeeNo,
            method: 'multipart'
          };
        }
        
        const errorText = await multipartResponse.text();
        console.warn(`Multipart upload failed: ${errorText}`);
        
      } catch (multipartError) {
        console.warn('Multipart method failed:', multipartError.message);
      }

      // Try Method 2: Direct JPEG upload
      try {
        const jpegUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=1`;
        const jpegResponse = await this.client.fetch(jpegUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': imageBuffer.length
          },
          body: imageBuffer
        });

        if (jpegResponse.ok) {
          return {
            success: true,
            faceId: employeeNo,
            method: 'jpeg-direct'
          };
        }

        const errorText2 = await jpegResponse.text();
        console.warn(`Direct JPEG upload failed: ${errorText2}`);

      } catch (jpegError) {
        console.warn('JPEG method failed:', jpegError.message);
      }

      // If all methods fail, return note to use web interface
      return {
        success: false,
        error: 'Device does not support API face upload. Please use web interface at http://' + this.ip,
        note: 'User created successfully. Face registration must be done via web interface or client software.'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start Live Face Capture (for devices with camera)
   * Used for DS-K1T series - captures face from device camera
   */
  async startLiveFaceCapture(employeeData) {
    try {
      const { employeeNo, name } = employeeData;

      // Step 1: Ensure user exists in device
      const userInfoXml = `<?xml version="1.0" encoding="UTF-8"?>
<UserInfo version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <employeeNo>${employeeNo}</employeeNo>
  <name>${name}</name>
  <userType>normal</userType>
  <Valid>
    <enable>true</enable>
    <beginTime>2020-01-01T00:00:00</beginTime>
    <endTime>2030-12-31T23:59:59</endTime>
  </Valid>
  <doorRight>1</doorRight>
  <RightPlan>
    <doorNo>1</doorNo>
    <planTemplateNo>1</planTemplateNo>
  </RightPlan>
</UserInfo>`;

      const userUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json`;
      await this.client.fetch(userUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: userInfoXml
      });

      // Step 2: Trigger live face capture mode
      const captureXml = `<?xml version="1.0" encoding="UTF-8"?>
<AfterVerifyResult version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <employeeNoString>${employeeNo}</employeeNoString>
  <captureEnabled>true</captureEnabled>
</AfterVerifyResult>`;

      const captureUrl = `${this.baseUrl}/ISAPI/AccessControl/Captureface`;
      const captureResponse = await this.client.fetch(captureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: captureXml
      });

      if (captureResponse.ok) {
        return {
          success: true,
          message: 'Device is ready for live face capture. Please stand in front of the device camera.',
          employeeNo: employeeNo
        };
      }

      // Try alternative method
      const enrollUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/FaceEnrollment`;
      const enrollXml = `<?xml version="1.0" encoding="UTF-8"?>
<FaceEnrollment version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <employeeNo>${employeeNo}</employeeNo>
  <enrollMode>live</enrollMode>
</FaceEnrollment>`;

      const enrollResponse = await this.client.fetch(enrollUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: enrollXml
      });

      if (enrollResponse.ok) {
        return {
          success: true,
          message: 'Live enrollment mode activated. Stand in front of device.',
          employeeNo: employeeNo
        };
      }

      const errorText = await enrollResponse.text();
      return {
        success: false,
        error: `Live capture not supported: ${errorText}`,
        note: 'This feature may require triggering from device keypad or web interface'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get face capture status
   */
  async getFaceCaptureStatus(employeeNo) {
    try {
      const url = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/FaceEnrollment/status?employeeNo=${employeeNo}`;
      const response = await this.client.fetch(url, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.text();
        const result = await parseStringPromise(data);
        return {
          success: true,
          status: result
        };
      }

      return {
        success: false,
        error: 'Could not get capture status'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete face from device
   */
  async deleteFace(employeeNo, faceLibId = 1) {
    try {
      const url = `${this.baseUrl}/ISAPI/Intelligent/FDLib/${faceLibId}/picture/${employeeNo}`;
      const response = await this.client.fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        deleted: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all faces from device
   */
  async getAllFaces(faceLibId = 1) {
    try {
      const url = `${this.baseUrl}/ISAPI/Intelligent/FDLib/${faceLibId}/picture`;
      const response = await this.client.fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data);

      const faceList = result.FaceInfoList?.FaceInfo || [];

      return {
        success: true,
        total: faceList.length,
        faces: faceList.map(face => ({
          employeeNo: face.employeeNo?.[0],
          name: face.name?.[0],
          faceLibType: face.faceLibType?.[0]
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get access logs from device
   */
  async getAccessLogs(params = {}) {
    try {
      const {
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime = new Date().toISOString(),
        maxResults = 100
      } = params;

      const searchXml = `<?xml version="1.0" encoding="UTF-8"?>
<AcsEventSearchDescription version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <searchID>${Date.now()}</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>${maxResults}</maxResults>
  <AcsEventSearchCond>
    <searchTimeSpan>
      <startTime>${startTime}</startTime>
      <endTime>${endTime}</endTime>
    </searchTimeSpan>
  </AcsEventSearchCond>
</AcsEventSearchDescription>`;

      const url = `${this.baseUrl}/ISAPI/AccessControl/AcsEvent?format=json`;
      const response = await this.client.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: searchXml
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      
      try {
        const jsonData = JSON.parse(data);
        return {
          success: true,
          logs: jsonData.AcsEvent?.InfoList || []
        };
      } catch (e) {
        const xmlData = await parseStringPromise(data);
        return {
          success: true,
          logs: xmlData.AcsEventList?.AcsEvent || []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reboot device
   */
  async reboot() {
    try {
      const url = `${this.baseUrl}/ISAPI/System/reboot`;
      const response = await this.client.fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Device reboot initiated'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get device time
   */
  async getDeviceTime() {
    try {
      const url = `${this.baseUrl}/ISAPI/System/time`;
      const response = await this.client.fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data);

      return {
        success: true,
        time: {
          localTime: result.Time?.localTime?.[0],
          timeZone: result.Time?.timeZone?.[0]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default HikvisionClient;
