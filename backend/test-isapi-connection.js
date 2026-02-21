/**
 * Test ISAPI Connection on port 80
 */

import axios from 'axios';

const DEVICE_IP = '192.168.1.84';
const DEVICE_PORT = 80;
const USERNAME = 'admin';
const PASSWORD = ''; // Add your device password here

async function testISAPI() {
  console.log('\n🧪 Testing ISAPI Connection...\n');
  console.log(`Device: ${DEVICE_IP}:${DEVICE_PORT}`);
  console.log('━'.repeat(60));

  // Test 1: Device Info
  try {
    const url = `http://${DEVICE_IP}:${DEVICE_PORT}/ISAPI/System/deviceInfo`;
    console.log('\n1️⃣  Testing Device Info endpoint...');
    console.log(`   URL: ${url}`);
    
    const response = await axios.get(url, {
      auth: { username: USERNAME, password: PASSWORD },
      timeout: 5000
    });

    console.log('   ✅ Device Info Success!');
    if (response.data) {
      const deviceName = response.data.DeviceInfo?.deviceName || 'N/A';
      const model = response.data.DeviceInfo?.model || 'N/A';
      const firmwareVersion = response.data.DeviceInfo?.firmwareVersion || 'N/A';
      console.log(`   📱 Device: ${deviceName}`);
      console.log(`   🔧 Model: ${model}`);
      console.log(`   📦 Firmware: ${firmwareVersion}`);
    }
  } catch (error) {
    console.log(`   ❌ Device Info Failed: ${error.message}`);
    if (error.response?.status === 401) {
      console.log('   ⚠️  Authentication failed - check username/password');
    }
  }

  // Test 2: Face Library Capabilities
  try {
    const url = `http://${DEVICE_IP}:${DEVICE_PORT}/ISAPI/Intelligent/FDLib/capabilities`;
    console.log('\n2️⃣  Testing Face Library capabilities...');
    console.log(`   URL: ${url}`);
    
    const response = await axios.get(url, {
      auth: { username: USERNAME, password: PASSWORD },
      timeout: 5000
    });

    console.log('   ✅ Face Library supported!');
  } catch (error) {
    console.log(`   ❌ Face Library: ${error.response?.status || error.message}`);
    if (error.response?.status === 404) {
      console.log('   ⚠️  Device may not support Face Recognition');
    }
  }

  // Test 3: Access Control User Info
  try {
    const url = `http://${DEVICE_IP}:${DEVICE_PORT}/ISAPI/AccessControl/UserInfo/Capabilities?format=json`;
    console.log('\n3️⃣  Testing Access Control User Info...');
    console.log(`   URL: ${url}`);
    
    const response = await axios.get(url, {
      auth: { username: USERNAME, password: PASSWORD },
      timeout: 5000
    });

    console.log('   ✅ Access Control supported!');
    if (response.data?.UserInfoCap?.maxFaceNum) {
      console.log(`   👤 Max Users: ${response.data.UserInfoCap.maxFaceNum}`);
    }
  } catch (error) {
    console.log(`   ❌ Access Control: ${error.response?.status || error.message}`);
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log('   If you see ✅ above, ISAPI is working!');
  console.log('   The system will now use ISAPI HTTP API on port 80');
  console.log('   instead of SDK Binary Protocol on port 8000.\n');
  console.log('🚀 Next: Start Backend and try uploading a face!\n');
}

testISAPI().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
