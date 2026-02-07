/**
 * File Upload Test Script
 * Tests employee photo and organization logo upload
 * February 7, 2026
 */

import FormData from 'form-data';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3000';
let token = '';

// Helper function for API calls
async function apiCall(method, endpoint, body = null, useAuth = true, isFormData = false) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (useAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    if (isFormData) {
      // FormData will set its own headers
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error('API call error:', error.message);
    throw error;
  }
}

// Test 1: Login
async function testLogin() {
  console.log('\n🔐 Test 1: Login as Super Admin');
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('POST', '/api/auth/login', {
      email: 'super@admin.com',
      password: 'Super@123456'
    }, false);

    if (result.ok) {
      const responseData = result.data.data || result.data;
      token = responseData.access_token || responseData.tokens?.accessToken;
      
      if (!token) {
        console.log('❌ No token in response');
        return false;
      }
      
      console.log('✅ SUCCESS!');
      console.log(`   Token: ${token.substring(0, 30)}...`);
      return true;
    } else {
      console.log('❌ FAILED:', result.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 2: Create test image (if not exists)
async function createTestImage() {
  console.log('\n🎨 Test 2: Check test image');
  console.log('═'.repeat(50));

  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  if (fs.existsSync(testImagePath)) {
    console.log('✅ Test image already exists');
    return testImagePath;
  }

  try {
    // Create a simple test image using canvas if available
    const canvasModule = await import('canvas').catch(() => null);
    
    if (canvasModule && canvasModule.createCanvas) {
      const { createCanvas } = canvasModule;
      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext('2d');
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Test Employee', 200, 180);
      ctx.fillText('Photo', 200, 220);
      
      // Save to file
      const buffer = canvas.toBuffer('image/jpeg');
      fs.writeFileSync(testImagePath, buffer);
      console.log('✅ Created test image with canvas');
    } else {
      // Fallback: create minimal JPEG
      console.log('⚠️  Canvas not available, creating minimal placeholder');
      // Write a minimal valid JPEG file (this is a 1x1 pixel black JPEG)
      const minimalJPEG = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
        0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
        0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
        0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
        0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0xFF, 0xC4, 0x00, 0x14,
        0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
        0x00, 0x00, 0x3F, 0x00, 0x7F, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJPEG);
      console.log('✅ Created minimal JPEG placeholder');
    }
    
    return testImagePath;
  } catch (error) {
    console.error('❌ Error creating test image:', error.message);
    return null;
  }
}

// Test 3: Upload employee photo
async function testUploadEmployeePhoto(employeeId, imagePath) {
  console.log(`\n📷 Test 3: Upload Employee Photo (ID: ${employeeId})`);
  console.log('═'.repeat(50));

  if (!imagePath || !fs.existsSync(imagePath)) {
    console.log('❌ Test image not found');
    return false;
  }

  try {
    const form = new FormData();
    form.append('photo', fs.createReadStream(imagePath));

    const response = await axios.post(
      `${BASE_URL}/api/employees/${employeeId}/photo`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders()
        }
      }
    );

    if (response.status === 200) {
      console.log('✅ SUCCESS!');
      console.log(`   Photo URL: ${response.data.data.photo_url || 'N/A'}`);
      return true;
    } else {
      console.log('❌ FAILED:', response.data.message || response.data.error);
      console.log('   Details:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test 4: Get employee photo
async function testGetEmployeePhoto(employeeId) {
  console.log(`\n🖼️  Test 4: Get Employee Photo (ID: ${employeeId})`);
  console.log('═'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/employees/${employeeId}/photo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('✅ SUCCESS!');
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Size: ${response.headers.get('content-length')} bytes`);
      return true;
    } else {
      const result = await response.json();
      console.log('❌ FAILED:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Test 5: Upload organization logo
async function testUploadOrganizationLogo(orgId, imagePath) {
  console.log(`\n🏢 Test 5: Upload Organization Logo (ID: ${orgId})`);
  console.log('═'.repeat(50));

  if (!imagePath || !fs.existsSync(imagePath)) {
    console.log('❌ Test image not found');
    return false;
  }

  try {
    const form = new FormData();
    form.append('logo', fs.createReadStream(imagePath));

    const response = await axios.post(
      `${BASE_URL}/api/organizations/${orgId}/logo`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders()
        }
      }
    );

    if (response.status === 200) {
      console.log('✅ SUCCESS!');
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      console.log(`   Logo URL: ${response.data.data?.logo_url || 'N/A'}`);
      return true;
    } else {
      console.log('❌ FAILED:', response.data.message || response.data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Get organization logo
async function testGetOrganizationLogo(orgId) {
  console.log(`\n🔍 Test 6: Get Organization Logo (ID: ${orgId})`);
  console.log('═'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/organizations/${orgId}/logo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('✅ SUCCESS!');
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Size: ${response.headers.get('content-length')} bytes`);
      return true;
    } else {
      const result = await response.json();
      console.log('❌ FAILED:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║      🧪 FILE UPLOAD SYSTEM - TEST SUITE       ║');
  console.log('║          February 7, 2026                      ║');
  console.log('╚══════════════════════════════════════════════════╝');

  // Login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Login failed - aborting tests\n');
    return;
  }

  // Create test image
  const testImagePath = await createTestImage();
  if (!testImagePath) {
    console.log('\n❌ Failed to create test image - aborting tests\n');
    return;
  }

  // Test employee photo upload (assuming employee ID 1 exists)
  const employeeId = 1;
  await testUploadEmployeePhoto(employeeId, testImagePath);
  await testGetEmployeePhoto(employeeId);

  // Test organization logo upload (assuming org ID 1 exists)
  const orgId = 1;
  await testUploadOrganizationLogo(orgId, testImagePath);
  await testGetOrganizationLogo(orgId);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║         ✅ FILE UPLOAD TESTS COMPLETE!         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
