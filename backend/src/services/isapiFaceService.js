/**
 * ISAPI Face Service
 * Alternative to SDK Binary Protocol - uses HTTP REST API on port 80
 */

import axios from 'axios';

/**
 * Upload face using ISAPI REST API (Port 80)
 * Alternative when SDK port 8000 is not available
 */
export async function uploadFaceViaISAPI(device, employee, imageBuffer) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json`;
    
    console.log(`[ISAPI] Attempting to upload face for ${employee.employee_no} to ${url}`);
    
    // Prepare face data
    const faceData = {
      faceLibType: "blackFD",
      FDID: "1",
      FPID: employee.employee_no.toString(),
      name: employee.name,
      gender: "male",
      faceURL: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    };

    // HTTP Digest Authentication
    const response = await axios.post(url, faceData, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('[ISAPI] Response:', response.data);

    if (response.status === 200 || response.status === 201) {
      console.log(`✅ [ISAPI] Face uploaded successfully`);
      return { 
        success: true, 
        faceId: employee.employee_no,
        method: 'isapi-http'
      };
    } else {
      return { 
        success: false, 
        error: `ISAPI returned status ${response.status}` 
      };
    }

  } catch (error) {
    console.error('❌ [ISAPI] Error:', error.message);
    
    // Try alternative endpoint
    if (error.response?.status === 404) {
      return await uploadFaceViaISAPI_Alternative(device, employee, imageBuffer);
    }
    
    return { 
      success: false, 
      error: `ISAPI Error: ${error.message}` 
    };
  }
}

/**
 * Alternative ISAPI endpoint (UserInfo/Record)
 */
async function uploadFaceViaISAPI_Alternative(device, employee, imageBuffer) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/AccessControl/UserInfo/Record?format=json`;
    
    console.log(`[ISAPI] Trying alternative endpoint: ${url}`);
    
    const userData = {
      UserInfo: {
        employeeNo: employee.employee_no.toString(),
        name: employee.name,
        userType: "normal",
        Valid: {
          enable: true,
          beginTime: "2020-01-01T00:00:00",
          endTime: "2037-12-31T23:59:59"
        },
        doorRight: "1",
        RightPlan: [{
          doorNo: 1,
          planTemplateNo: "1"
        }],
        maxOpenDoorTime: 0,
        openDoorTime: 0,
        numOfFace: 1,
        UserFaceList: [{
          faceData: imageBuffer.toString('base64')
        }]
      }
    };

    const response = await axios.post(url, userData, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.status === 200 || response.status === 201) {
      console.log(`✅ [ISAPI Alternative] Face uploaded successfully`);
      return { 
        success: true, 
        faceId: employee.employee_no,
        method: 'isapi-userinfo'
      };
    }

    return { 
      success: false, 
      error: `ISAPI Alternative returned status ${response.status}` 
    };

  } catch (error) {
    console.error('❌ [ISAPI Alternative] Error:', error.message);
    return { 
      success: false, 
      error: `ISAPI Alternative Error: ${error.message}` 
    };
  }
}

/**
 * Delete face using ISAPI
 */
export async function deleteFaceViaISAPI(device, employee) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&FDID=1&FPID=${employee.employee_no}`;
    
    const response = await axios.delete(url, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      timeout: 10000
    });

    console.log(`✅ [ISAPI] Face deleted for employee ${employee.employee_no}`);
    return { success: true };

  } catch (error) {
    console.warn('[ISAPI] Delete face warning:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test ISAPI connectivity
 */
export async function testISAPIConnection(device) {
  try {
    const url = `http://${device.ip_address}:${device.port || 80}/ISAPI/System/deviceInfo`;
    
    const response = await axios.get(url, {
      auth: {
        username: device.username || 'admin',
        password: device.password || ''
      },
      timeout: 5000
    });

    console.log('✅ ISAPI Connection successful');
    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ ISAPI Connection failed:', error.message);
    return { success: false, error: error.message };
  }
}
