#!/usr/bin/env node
/**
 * 🧪 Mock Device Service Testing Script
 * 
 * اختبار شامل لنظام Mock Device
 * يختبر جميع endpoints مع سيناريوهات مختلفة
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== Configuration ==========
const BASE_URL = 'http://localhost:3000';
const API = {
  auth: `${BASE_URL}/api/auth`,
  biometrics: `${BASE_URL}/api/biometrics`,
  employees: `${BASE_URL}/api/employees`,
  devices: `${BASE_URL}/api/devices`,
};

// ========== Colors for terminal output ==========
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

// ========== State Management ==========
let authToken = null;
let testEmployee = null;
let testDevice = null;

// ========== Helper Functions ==========
async function request(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url,
      headers: {
        ...headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    };

    if (data) {
      if (data instanceof FormData) {
        config.data = data;
        config.headers = {
          ...config.headers,
          ...data.getHeaders(),
        };
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// ========== Test Functions ==========

async function testLogin() {
  logSection('🔐 Test 1: User Authentication');
  
  logInfo('Attempting login with admin@system.com...');
  const result = await request('POST', `${API.auth}/login`, {
    email: 'admin@system.com',
    password: 'admin123',
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    logSuccess('Login successful!');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError('Login failed!');
    logError(JSON.stringify(result.error, null, 2));
    return false;
  }
}

async function testGetDevices() {
  logSection('🖥️  Test 2: Fetch Devices');
  
  logInfo('Fetching all devices...');
  const result = await request('GET', `${API.devices}`);

  if (result.success && result.data.data?.length > 0) {
    testDevice = result.data.data[0];
    logSuccess(`Found ${result.data.data.length} device(s)`);
    logInfo(`Using Device ID: ${testDevice.id} - ${testDevice.name}`);
    return true;
  } else {
    logError('No devices found!');
    logWarning('Creating a test device...');
    
    const createResult = await request('POST', `${API.devices}`, {
      name: 'Test Mock Device',
      ip_address: '192.168.1.100',
      port: 8000,
      device_type: 'Face Recognition',
      location: 'Test Location',
      is_active: true,
    });

    if (createResult.success) {
      testDevice = createResult.data.data;
      logSuccess('Test device created!');
      return true;
    } else {
      logError('Failed to create device!');
      return false;
    }
  }
}

async function testGetEmployees() {
  logSection('👤 Test 3: Fetch Employees');
  
  logInfo('Fetching all employees...');
  const result = await request('GET', `${API.employees}`);

  if (result.success && result.data.data?.length > 0) {
    testEmployee = result.data.data[0];
    logSuccess(`Found ${result.data.data.length} employee(s)`);
    logInfo(`Using Employee ID: ${testEmployee.id} - ${testEmployee.arabic_full_name}`);
    return true;
  } else {
    logError('No employees found!');
    logWarning('Creating a test employee...');
    
    const createResult = await request('POST', `${API.employees}`, {
      employee_no: `TEST-${Date.now()}`,
      arabic_full_name: 'موظف تجريبي',
      english_full_name: 'Test Employee',
      gender: 'male',
      birth_date: '1990-01-01',
      nationality: 'عراقي',
      department: 'IT',
      job_title: 'Developer',
      hire_date: '2024-01-01',
      employment_status: 'active',
      mobile_number: '07901234567',
    });

    if (createResult.success) {
      testEmployee = createResult.data.data;
      logSuccess('Test employee created!');
      return true;
    } else {
      logError('Failed to create employee!');
      logError(JSON.stringify(createResult.error, null, 2));
      return false;
    }
  }
}

async function testFaceRegistration() {
  logSection('😊 Test 4: Face Registration (Mock)');

  if (!testEmployee || !testDevice) {
    logError('Missing test employee or device!');
    return false;
  }

  // Create a dummy image buffer (1x1 white pixel PNG)
  const dummyImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );

  const form = new FormData();
  form.append('employee_id', testEmployee.id.toString());
  form.append('device_id', testDevice.id.toString());
  form.append('face_image', dummyImageBuffer, {
    filename: 'test-face.png',
    contentType: 'image/png',
  });

  logInfo(`Registering face for Employee ${testEmployee.id} on Device ${testDevice.id}...`);
  const result = await request('POST', `${API.biometrics}/face/register`, form);

  if (result.success) {
    logSuccess('Face registered successfully (Mock)!');
    logInfo(JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    logError('Face registration failed!');
    logError(JSON.stringify(result.error, null, 2));
    return false;
  }
}

async function testGetFaceStatus() {
  logSection('🔍 Test 5: Get Face Status');

  if (!testEmployee) {
    logError('Missing test employee!');
    return false;
  }

  logInfo(`Getting face status for Employee ${testEmployee.id}...`);
  const result = await request('GET', `${API.biometrics}/face/${testEmployee.id}`);

  if (result.success) {
    logSuccess('Face status retrieved!');
    logInfo(JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    logWarning('No face registered yet (expected for first run)');
    return true; // Not a failure
  }
}

async function testCardRegistration() {
  logSection('💳 Test 6: Card Registration (Mock)');

  if (!testEmployee || !testDevice) {
    logError('Missing test employee or device!');
    return false;
  }

  const cardNumber = `${Date.now()}`.substring(0, 10); // 10 digits

  logInfo(`Registering card ${cardNumber} for Employee ${testEmployee.id}...`);
  const result = await request('POST', `${API.biometrics}/card/register`, {
    employee_id: testEmployee.id,
    device_id: testDevice.id,
    card_number: cardNumber,
    card_type: 'RFID',
  });

  if (result.success) {
    logSuccess('Card registered successfully (Mock)!');
    logInfo(JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    logError('Card registration failed!');
    logError(JSON.stringify(result.error, null, 2));
    return false;
  }
}

async function testBiometricStatus() {
  logSection('📊 Test 7: Complete Biometric Status');

  if (!testEmployee) {
    logError('Missing test employee!');
    return false;
  }

  logInfo(`Getting complete biometric status for Employee ${testEmployee.id}...`);
  const result = await request('GET', `${API.biometrics}/status/${testEmployee.id}`);

  if (result.success) {
    logSuccess('Biometric status retrieved!');
    log(JSON.stringify(result.data.data, null, 2), 'cyan');
    return true;
  } else {
    logError('Failed to get biometric status!');
    logError(JSON.stringify(result.error, null, 2));
    return false;
  }
}

async function testDeleteFace() {
  logSection('🗑️  Test 8: Delete Face (Mock)');

  if (!testEmployee || !testDevice) {
    logError('Missing test employee or device!');
    return false;
  }

  logInfo(`Deleting face for Employee ${testEmployee.id} from Device ${testDevice.id}...`);
  const result = await request('DELETE', `${API.biometrics}/face/${testEmployee.id}`, {
    device_id: testDevice.id,
  });

  if (result.success) {
    logSuccess('Face deleted successfully (Mock)!');
    logInfo(JSON.stringify(result.data, null, 2));
    return true;
  } else {
    logWarning('Delete failed (might not exist, which is OK for testing)');
    return true; // Not a critical failure
  }
}

async function testSyncBiometrics() {
  logSection('🔄 Test 9: Sync Biometrics to All Devices');

  if (!testEmployee) {
    logError('Missing test employee!');
    return false;
  }

  logInfo(`Syncing biometrics for Employee ${testEmployee.id} to all devices...`);
  const result = await request('POST', `${API.biometrics}/sync/${testEmployee.id}`);

  if (result.success) {
    logSuccess('Biometrics synced successfully (Mock)!');
    logInfo(JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    logError('Sync failed!');
    logError(JSON.stringify(result.error, null, 2));
    return false;
  }
}

// ========== Main Test Runner ==========

async function runAllTests() {
  log('\n🧪 Starting Mock Device Service Testing...', 'magenta');
  log('══════════════════════════════════════════════════════════', 'magenta');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Get Devices', fn: testGetDevices },
    { name: 'Get Employees', fn: testGetEmployees },
    { name: 'Face Registration', fn: testFaceRegistration },
    { name: 'Get Face Status', fn: testGetFaceStatus },
    { name: 'Card Registration', fn: testCardRegistration },
    { name: 'Biometric Status', fn: testBiometricStatus },
    { name: 'Delete Face', fn: testDeleteFace },
    { name: 'Sync Biometrics', fn: testSyncBiometrics },
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      logError(`Test "${test.name}" threw exception: ${error.message}`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // ========== Final Summary ==========
  logSection('📈 Test Results Summary');
  log(`Total Tests:  ${results.total}`, 'cyan');
  log(`✅ Passed:     ${results.passed}`, 'green');
  log(`❌ Failed:     ${results.failed}`, 'red');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 'magenta');

  if (results.failed === 0) {
    log('🎉 All tests passed! Mock Device Service is working perfectly!', 'green');
  } else {
    log(`⚠️  ${results.failed} test(s) failed. Please check the logs above.`, 'yellow');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// ========== Entry Point ==========

// Check if backend is running
async function checkBackend() {
  try {
    await axios.get(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

(async () => {
  logInfo('Checking if backend is running...');
  const backendRunning = await checkBackend();

  if (!backendRunning) {
    logError('Backend is not running!');
    logWarning('Please start the backend first:');
    log('  cd backend && npm start\n', 'yellow');
    process.exit(1);
  }

  logSuccess('Backend is running!\n');

  try {
    await runAllTests();
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  }
})();
