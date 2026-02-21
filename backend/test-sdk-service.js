/**
 * Test C# SDK Service Connection
 * سكريبت اختبار الاتصال بـ C# Service
 */

const SDK_SERVICE_URL = process.env.SDK_SERVICE_URL || 'http://localhost:5000';

async function testSDKService() {
  console.log('='.repeat(60));
  console.log('🔍 Testing C# SDK Service Connection');
  console.log('='.repeat(60));
  console.log(`SDK Service URL: ${SDK_SERVICE_URL}`);
  console.log('');

  try {
    // 1. Test Health Endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthRes = await fetch(`${SDK_SERVICE_URL}/api/face/health`);
    
    if (healthRes.ok) {
      const data = await healthRes.json();
      console.log('✅ Health Check: OK');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Health Check: FAILED');
      console.log('   Status:', healthRes.status);
      process.exit(1);
    }

    console.log('');

    // 2. Test Login (with dummy device)
    console.log('2️⃣ Testing device login...');
    console.log('   (Using test device: 192.168.1.64:8000)');
    
    const loginRes = await fetch(`${SDK_SERVICE_URL}/api/face/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip: '192.168.1.64',
        port: 8000,
        username: 'admin',
        password: 'Admin@123',
        employeeNo: 'TEST001',
        name: 'Test Employee',
        cardNo: 'TEST001',
        faceImageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        readerNo: 1
      })
    });

    const loginData = await loginRes.json();
    
    if (loginRes.ok && loginData.success) {
      console.log('✅ Device Communication: OK');
      console.log('   Response:', JSON.stringify(loginData, null, 2));
    } else {
      console.log('⚠️ Device Communication: Failed (expected if device not connected)');
      console.log('   Response:', JSON.stringify(loginData, null, 2));
      console.log('');
      console.log('📝 Note: This is normal if you don\'t have a device at 192.168.1.64');
      console.log('   The SDK Service is working, just can\'t reach the test device.');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ C# SDK Service is running and responding!');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ C# SDK Service is NOT running!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Solution:');
    console.log('   1. Open a new terminal');
    console.log('   2. cd sdk-service');
    console.log('   3. dotnet run');
    console.log('');
    console.log('   Then run this test again.');
    console.log('');
    process.exit(1);
  }
}

testSDKService();
