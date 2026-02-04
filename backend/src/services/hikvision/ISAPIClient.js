import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * HikVision ISAPI Client
 * للتواصل مع أجهزة HikVision عبر ISAPI Protocol
 */
class HikVisionISAPI {
  constructor(config) {
    this.host = config.ip_address;
    this.port = config.port || 80;
    this.username = config.username;
    this.password = config.password;
    this.baseURL = `http://${this.host}:${this.port}/ISAPI`;
    
    // Create axios instance with digest auth
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.DEVICE_TIMEOUT) || 10000,
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    });

    // Setup interceptors for digest authentication
    this.setupAuthInterceptor();
  }

  /**
   * Setup Digest Authentication Interceptor
   */
  setupAuthInterceptor() {
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If 401 and not retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const authHeader = error.response.headers['www-authenticate'];
          if (authHeader && authHeader.startsWith('Digest')) {
            const authDetails = this.parseDigestHeader(authHeader);
            const digestAuth = this.generateDigestAuth(
              originalRequest.method.toUpperCase(),
              originalRequest.url,
              authDetails
            );

            originalRequest.headers['Authorization'] = digestAuth;
            return this.client(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Parse Digest Authentication Header
   */
  parseDigestHeader(header) {
    const regex = /(\w+)=["]?([^",]+)["]?/g;
    const details = {};
    let match;

    while ((match = regex.exec(header)) !== null) {
      details[match[1]] = match[2];
    }

    return details;
  }

  /**
   * Generate Digest Authentication String
   */
  generateDigestAuth(method, uri, authDetails) {
    const ha1 = crypto
      .createHash('md5')
      .update(`${this.username}:${authDetails.realm}:${this.password}`)
      .digest('hex');

    const ha2 = crypto
      .createHash('md5')
      .update(`${method}:${uri}`)
      .digest('hex');

    const response = crypto
      .createHash('md5')
      .update(`${ha1}:${authDetails.nonce}:${ha2}`)
      .digest('hex');

    return `Digest username="${this.username}", realm="${authDetails.realm}", ` +
           `nonce="${authDetails.nonce}", uri="${uri}", response="${response}"`;
  }

  // ==========================================
  // Device Information APIs
  // ==========================================

  /**
   * Get Device Information
   */
  async getDeviceInfo() {
    try {
      const response = await this.client.get('/System/deviceInfo');
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get device info from ${this.host}:`, error.message);
      throw error;
    }
  }

  /**
   * Get Device Status
   */
  async getDeviceStatus() {
    try {
      const response = await this.client.get('/System/status');
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get device status:`, error.message);
      throw error;
    }
  }

  /**
   * Get Device Capabilities
   */
  async getCapabilities() {
    try {
      const response = await this.client.get('/System/capabilities');
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get capabilities:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // User/Person Management APIs
  // ==========================================

  /**
   * Add User/Person to Device
   * @param {Object} userData - User information
   */
  async addUser(userData) {
    const xmlData = this.buildUserXML(userData);
    
    try {
      const response = await this.client.post(
        '/AccessControl/UserInfo/Record?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to add user:`, error.message);
      throw error;
    }
  }

  /**
   * Update User Information
   */
  async updateUser(userId, userData) {
    const xmlData = this.buildUserXML(userData);
    
    try {
      const response = await this.client.put(
        `/AccessControl/UserInfo/Modify?format=json`,
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to update user:`, error.message);
      throw error;
    }
  }

  /**
   * Delete User from Device
   */
  async deleteUser(employeeNo) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<UserInfoDelCond>
  <EmployeeNoList>
    <employeeNo>${employeeNo}</employeeNo>
  </EmployeeNoList>
</UserInfoDelCond>`;

    try {
      const response = await this.client.put(
        '/AccessControl/UserInfo/Delete?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to delete user:`, error.message);
      throw error;
    }
  }

  /**
   * Get User Information
   */
  async getUser(employeeNo) {
    try {
      const response = await this.client.post(
        `/AccessControl/UserInfo/Search?format=json`,
        this.buildUserSearchXML(employeeNo)
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get user:`, error.message);
      throw error;
    }
  }

  /**
   * Get All Users
   */
  async getAllUsers() {
    try {
      const response = await this.client.post(
        '/AccessControl/UserInfo/Search?format=json',
        this.buildUserSearchXML()
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get all users:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Face Management APIs
  // ==========================================

  /**
   * Upload Face Picture
   * @param {String} employeeNo - Employee number
   * @param {Buffer} imageBuffer - Face image buffer
   */
  async uploadFacePicture(employeeNo, imageBuffer) {
    const boundary = '----HikVisionBoundary' + Date.now();
    const xmlPart = `<?xml version="1.0" encoding="UTF-8"?>
<FaceDataRecord>
  <employeeNo>${employeeNo}</employeeNo>
  <faceLibType>blackFD</faceLibType>
</FaceDataRecord>`;

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="FaceDataRecord"\r\n'),
      Buffer.from('Content-Type: application/xml; charset="UTF-8"\r\n\r\n'),
      Buffer.from(xmlPart),
      Buffer.from(`\r\n--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="FaceImage"; filename="face.jpg"\r\n'),
      Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
      imageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    try {
      const response = await this.client.post(
        '/Intelligent/FDLib/FaceDataRecord?format=json',
        body,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        }
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to upload face picture:`, error.message);
      throw error;
    }
  }

  /**
   * Delete Face Data
   */
  async deleteFace(faceId) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<FaceDataRecord>
  <FDID>${faceId}</FDID>
</FaceDataRecord>`;

    try {
      const response = await this.client.delete(
        '/Intelligent/FDLib/FaceDataRecord?format=json',
        { data: xmlData }
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to delete face:`, error.message);
      throw error;
    }
  }

  /**
   * Get Face Count
   */
  async getFaceCount() {
    try {
      const response = await this.client.get('/Intelligent/FDLib/Count');
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get face count:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Card Management APIs
  // ==========================================

  /**
   * Add Card to User
   */
  async addCard(cardData) {
    const xmlData = this.buildCardXML(cardData);
    
    try {
      const response = await this.client.post(
        '/AccessControl/CardInfo/Record?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to add card:`, error.message);
      throw error;
    }
  }

  /**
   * Delete Card
   */
  async deleteCard(cardNumber) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<CardInfoDelCond>
  <CardNoList>
    <cardNo>${cardNumber}</cardNo>
  </CardNoList>
</CardInfoDelCond>`;

    try {
      const response = await this.client.put(
        '/AccessControl/CardInfo/Delete?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to delete card:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Fingerprint Management APIs
  // ==========================================

  /**
   * Upload Fingerprint
   */
  async uploadFingerprint(employeeNo, fingerprintData) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<FingerPrintCfg>
  <employeeNo>${employeeNo}</employeeNo>
  <fingerPrintID>1</fingerPrintID>
  <fingerType>normalFP</fingerType>
  <fingerData>${fingerprintData}</fingerData>
</FingerPrintCfg>`;

    try {
      const response = await this.client.post(
        '/AccessControl/FingerPrintUpload?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to upload fingerprint:`, error.message);
      throw error;
    }
  }

  /**
   * Delete Fingerprint
   */
  async deleteFingerprint(employeeNo, fingerPrintID) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<FingerPrintDelete>
  <employeeNo>${employeeNo}</employeeNo>
  <fingerPrintID>${fingerPrintID}</fingerPrintID>
</FingerPrintDelete>`;

    try {
      const response = await this.client.put(
        '/AccessControl/FingerPrint/Delete?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to delete fingerprint:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Event/Log APIs
  // ==========================================

  /**
   * Get Access Control Events
   * @param {Object} params - Search parameters
   */
  async getEvents(params = {}) {
    const { startTime, endTime, major = 5, minor = 0 } = params;
    
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<AcsEventCond>
  <searchID>1</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>30</maxResults>
  ${startTime ? `<startTime>${startTime}</startTime>` : ''}
  ${endTime ? `<endTime>${endTime}</endTime>` : ''}
  <major>${major}</major>
  <minor>${minor}</minor>
</AcsEventCond>`;

    try {
      const response = await this.client.post(
        '/AccessControl/AcsEvent?format=json',
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get events:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to Real-time Events (Long Polling)
   */
  async subscribeToEvents(callback) {
    try {
      const response = await this.client.get(
        '/Event/notification/alertStream',
        {
          responseType: 'stream',
          timeout: 0 // No timeout for streaming
        }
      );

      response.data.on('data', chunk => {
        const eventData = chunk.toString();
        if (eventData.includes('<EventNotificationAlert>')) {
          callback(this.parseXMLResponse(eventData));
        }
      });

      response.data.on('error', error => {
        logger.error('Event stream error:', error);
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to subscribe to events:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Door Control APIs
  // ==========================================

  /**
   * Open Door Remotely
   */
  async openDoor(doorId = 1) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>open</cmd>
</RemoteControlDoor>`;

    try {
      const response = await this.client.put(
        `/AccessControl/RemoteControl/door/${doorId}`,
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to open door:`, error.message);
      throw error;
    }
  }

  /**
   * Close Door
   */
  async closeDoor(doorId = 1) {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>close</cmd>
</RemoteControlDoor>`;

    try {
      const response = await this.client.put(
        `/AccessControl/RemoteControl/door/${doorId}`,
        xmlData
      );
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to close door:`, error.message);
      throw error;
    }
  }

  /**
   * Get Door Status
   */
  async getDoorStatus() {
    try {
      const response = await this.client.get('/AccessControl/DoorStatus');
      return this.parseXMLResponse(response.data);
    } catch (error) {
      logger.error(`Failed to get door status:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Build User XML
   */
  buildUserXML(userData) {
    const { employeeNo, name, userType = 'normal', valid = { enable: true } } = userData;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<UserInfo>
  <employeeNo>${employeeNo}</employeeNo>
  <name>${name}</name>
  <userType>${userType}</userType>
  <Valid>
    <enable>${valid.enable}</enable>
    ${valid.beginTime ? `<beginTime>${valid.beginTime}</beginTime>` : ''}
    ${valid.endTime ? `<endTime>${valid.endTime}</endTime>` : ''}
  </Valid>
</UserInfo>`;
  }

  /**
   * Build User Search XML
   */
  buildUserSearchXML(employeeNo = null) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<UserInfoSearchCond>
  <searchID>1</searchID>
  <searchResultPosition>0</searchResultPosition>
  <maxResults>100</maxResults>
  ${employeeNo ? `<EmployeeNoList><employeeNo>${employeeNo}</employeeNo></EmployeeNoList>` : ''}
</UserInfoSearchCond>`;
  }

  /**
   * Build Card XML
   */
  buildCardXML(cardData) {
    const { cardNo, employeeNo, cardType = 1 } = cardData;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<CardInfo>
  <employeeNo>${employeeNo}</employeeNo>
  <cardNo>${cardNo}</cardNo>
  <cardType>${cardType}</cardType>
</CardInfo>`;
  }

  /**
   * Parse XML Response to JSON
   */
  parseXMLResponse(xmlString) {
    // Simple XML to JSON parser
    // في الإنتاج، استخدم مكتبة مثل xml2js
    try {
      return { raw: xmlString };
    } catch (error) {
      logger.error('Failed to parse XML:', error);
      return null;
    }
  }

  /**
   * Test Connection
   */
  async testConnection() {
    try {
      await this.getDeviceInfo();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default HikVisionISAPI;
