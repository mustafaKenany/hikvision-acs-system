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
      
      // Add timeout wrapper
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await this.client.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/xml'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.text();
      const result = await parseStringPromise(data, { 
        explicitArray: true,
        ignoreAttrs: false,
        mergeAttrs: true
      });

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
      console.error('[HikvisionClient] testConnection error:', error.message);
      return {
        success: false,
        connected: false,
        error: error.name === 'AbortError' ? 'Connection timeout (10s)' : error.message
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
   * Uses multipart/form-data with JSON metadata + binary image
   */
  async uploadFace(faceData) {
    try {
      const { employeeNo, name, imageBase64 } = faceData;

      if (!imageBase64) {
        throw new Error('Face image is required');
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      // Add timeout for entire operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Step 1: Add/update user info using JSON body (format=json requires JSON body)
      const userInfoJson = {
        UserInfo: {
          employeeNo: employeeNo.toString(),
          name: name,
          userType: 'normal',
          Valid: {
            enable: true,
            beginTime: '2020-01-01T00:00:00',
            endTime: '2030-12-31T23:59:59'
          },
          doorRight: '1',
          RightPlan: [{
            doorNo: 1,
            planTemplateNo: '1'
          }]
        }
      };

      const userUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json`;
      const userResponse = await this.client.fetch(userUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userInfoJson),
        signal: controller.signal
      });

      // Ignore 400 errors (user might already exist) - try update instead
      if (!userResponse.ok && userResponse.status !== 400) {
        const errorText = await userResponse.text().catch(() => 'No response');
        console.warn(`[HikvisionClient] User creation warning: ${userResponse.status} - ${errorText}`);
      } else if (userResponse.status === 400) {
        // User already exists, try to update
        const updateUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/Modify?format=json`;
        await this.client.fetch(updateUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(userInfoJson),
          signal: controller.signal
        }).catch(() => {});
      }

      // Step 2: Upload face using correct endpoint FaceDataRecord with JSON metadata
      try {
        const boundary = `----FormBoundary${Date.now()}`;
        const CRLF = '\r\n';

        // JSON metadata for the face record
        const faceRecordJson = JSON.stringify({
          employeeNo: employeeNo.toString(),
          faceLibType: 'blackFD',
          FDID: '1'
        });

        let headerPart = '';
        headerPart += `--${boundary}${CRLF}`;
        headerPart += `Content-Disposition: form-data; name="FaceDataRecord"${CRLF}`;
        headerPart += `Content-Type: application/json${CRLF}${CRLF}`;
        headerPart += faceRecordJson;
        headerPart += `${CRLF}--${boundary}${CRLF}`;
        headerPart += `Content-Disposition: form-data; name="FaceImage"; filename="face.jpg"${CRLF}`;
        headerPart += `Content-Type: image/jpeg${CRLF}${CRLF}`;

        const bodyBuffer = Buffer.concat([
          Buffer.from(headerPart, 'utf8'),
          imageBuffer,
          Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8')
        ]);

        const faceUrl = `${this.baseUrl}/ISAPI/AccessControl/FaceDataRecord?format=json`;
        const faceResponse = await this.client.fetch(faceUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length
          },
          body: bodyBuffer,
          signal: controller.signal
        });

        if (faceResponse.ok) {
          clearTimeout(timeoutId);
          return {
            success: true,
            faceId: employeeNo,
            method: 'FaceDataRecord',
            message: `Face uploaded successfully for employee ${employeeNo}`
          };
        }

        const errorText = await faceResponse.text().catch(() => 'No response');
        console.warn(`[HikvisionClient] FaceDataRecord upload failed (${faceResponse.status}): ${errorText}`);

      } catch (faceError) {
        console.warn('[HikvisionClient] FaceDataRecord method failed:', faceError.message);
      }

      // Fallback: Try legacy endpoint UserInfo/SetFace with XML metadata
      try {
        const boundary2 = `----FormBoundary${Date.now()}`;
        const CRLF = '\r\n';

        let legacyHeader = '';
        legacyHeader += `--${boundary2}${CRLF}`;
        legacyHeader += `Content-Disposition: form-data; name="FaceDataRecord"${CRLF}`;
        legacyHeader += `Content-Type: application/xml${CRLF}${CRLF}`;
        legacyHeader += `<?xml version="1.0" encoding="UTF-8"?><FaceDataRecord><employeeNo>${employeeNo}</employeeNo></FaceDataRecord>`;
        legacyHeader += `${CRLF}--${boundary2}${CRLF}`;
        legacyHeader += `Content-Disposition: form-data; name="FaceImage"; filename="face.jpg"${CRLF}`;
        legacyHeader += `Content-Type: image/jpeg${CRLF}${CRLF}`;

        const legacyBuffer = Buffer.concat([
          Buffer.from(legacyHeader, 'utf8'),
          imageBuffer,
          Buffer.from(`${CRLF}--${boundary2}--${CRLF}`, 'utf8')
        ]);

        const legacyUrl = `${this.baseUrl}/ISAPI/AccessControl/UserInfo/SetFace`;
        const legacyResponse = await this.client.fetch(legacyUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary2}`,
            'Content-Length': legacyBuffer.length
          },
          body: legacyBuffer,
          signal: controller.signal
        });

        if (legacyResponse.ok) {
          clearTimeout(timeoutId);
          return {
            success: true,
            faceId: employeeNo,
            method: 'SetFace-legacy',
            message: `Face uploaded successfully for employee ${employeeNo}`
          };
        }

        const errorText2 = await legacyResponse.text().catch(() => 'No response');
        console.warn(`[HikvisionClient] Legacy SetFace failed (${legacyResponse.status}): ${errorText2}`);

      } catch (legacyError) {
        console.warn('[HikvisionClient] Legacy SetFace method failed:', legacyError.message);
      }

      // All methods failed
      clearTimeout(timeoutId);
      return {
        success: false,
        error: 'Face upload failed on all methods. Please use web interface at http://' + this.ip,
        note: 'User was created/updated on device. Face registration must be done via web interface or client software.'
      };

    } catch (error) {
      console.error('[HikvisionClient] uploadFace error:', error.message);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Upload timeout (30s)' : error.message
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

      // Format dates properly for HikVision
      const formatTime = (date) => {
        const d = new Date(date);
        // Format: YYYY-MM-DDTHH:MM:SS+08:00 or simpler format
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const formattedStart = formatTime(startTime);
      const formattedEnd   = formatTime(endTime);

      console.log('[HikvisionClient] getAccessLogs request:', {
        url: `${this.baseUrl}/ISAPI/AccessControl/AcsEvent?format=json`,
        startTime: formattedStart,
        endTime: formattedEnd,
        maxResults
      });

      // ── Method 1: JSON body with ?format=json (DS-K1T / newer firmware) ──
      const jsonBody = {
        AcsEventCond: {
          searchID: '1',
          searchResultPosition: 0,
          maxResults: maxResults,
          major: 0,
          minor: 0,
          startTime: formattedStart,
          endTime: formattedEnd
        }
      };

      let response = await this.client.fetch(
        `${this.baseUrl}/ISAPI/AccessControl/AcsEvent?format=json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(jsonBody),
          signal: controller.signal
        }
      );

      // ── Method 2: XML body without format=json (older firmware fallback) ──
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[HikvisionClient] JSON method failed (${response.status}): ${errText.substring(0, 100)}. Trying XML...`);

        const searchXml = `<?xml version="1.0" encoding="UTF-8"?>
<AcsEventCond version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <searchID>1</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>${maxResults}</maxResults>
  <major>0</major>
  <minor>0</minor>
  <startTime>${formattedStart}</startTime>
  <endTime>${formattedEnd}</endTime>
</AcsEventCond>`;

        // Need a fresh abort controller since the first request consumed the signal
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 15000);

        response = await this.client.fetch(
          `${this.baseUrl}/ISAPI/AccessControl/AcsEvent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/xml',
              'Accept': 'application/xml'
            },
            body: searchXml,
            signal: controller2.signal
          }
        );
        clearTimeout(timeoutId2);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.text();

      // Parse JSON response
      try {
        const jsonData = JSON.parse(data);
        const logs = jsonData.AcsEvent?.InfoList || [];
        console.log(`[HikvisionClient] getAccessLogs: Retrieved ${logs.length} logs (JSON)`);
        return {
          success: true,
          logs: logs,
          format: 'json'
        };
      } catch (e) {
        // Parse XML response
        try {
          const xmlData = await parseStringPromise(data);
          const logs = xmlData.AcsEventList?.AcsEvent || xmlData.AcsEventCond?.AcsEvent || [];
          console.log(`[HikvisionClient] getAccessLogs: Retrieved ${logs.length} logs (XML)`);
          return {
            success: true,
            logs: logs,
            format: 'xml'
          };
        } catch (xmlError) {
          console.error('[HikvisionClient] Failed to parse response:', data.substring(0, 200));
          return {
            success: true,
            logs: [],
            message: 'No logs found or parse error'
          };
        }
      }
    } catch (error) {
      console.error('[HikvisionClient] getAccessLogs error:', error.message);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Request timeout (15s)' : error.message
      };
    }
  }

  /**
   * Reboot device
   */
  async reboot() {
    try {
      const url = `${this.baseUrl}/ISAPI/System/reboot`;
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await this.client.fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return {
        success: true,
        message: 'Device reboot initiated'
      };
    } catch (error) {
      console.error('[HikvisionClient] reboot error:', error.message);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Connection timeout (10s)' : error.message
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

  /**
   * Set device time
   */
  async setTime(dateTime) {
    try {
      const date = new Date(dateTime);
      
      // Format date for HikVision: YYYY-MM-DD HH:MM:SS
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      // Use manual mode instead of NTP for direct time setting
      const timeXml = `<?xml version="1.0" encoding="UTF-8"?>
<Time version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <timeMode>manual</timeMode>
  <localTime>${formattedTime}</localTime>
  <timeZone>CST-8:00:00</timeZone>
</Time>`;

      const url = `${this.baseUrl}/ISAPI/System/time`;
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await this.client.fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/xml'
        },
        body: timeXml,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return {
        success: true,
        message: 'Time synchronized successfully',
        syncedTime: dateTime
      };
    } catch (error) {
      console.error('[HikvisionClient] setTime error:', error.message);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Connection timeout (10s)' : error.message
      };
    }
  }

  /**
   * Map verification method from card type
   */
  mapVerificationMethod(cardType) {
    const typeMap = {
      '1': 'card',
      '2': 'fingerprint',
      '3': 'face',
      '4': 'password'
    };
    return typeMap[cardType] || 'unknown';
  }

  /**
   * Clear device logs
   */
  async clearLogs() {
    try {
      const url = `${this.baseUrl}/ISAPI/AccessControl/AcsEvent?format=json`;
      const response = await this.client.fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Logs cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Open door
   */
  async openDoor(doorNumber = 1, duration = 5) {
    try {
      const openDoorXml = `<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>open</cmd>
</RemoteControlDoor>`;

      const url = `${this.baseUrl}/ISAPI/AccessControl/RemoteControl/door/${doorNumber}`;
      const response = await this.client.fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: openDoorXml
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: `Door ${doorNumber} opened for ${duration} seconds`
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
