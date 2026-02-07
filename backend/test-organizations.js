/**
 * Organizations API Test Script
 * Simple Node.js test for Organizations API
 * February 7, 2026
 */

const BASE_URL = 'http://localhost:3000';
let token = '';

// Helper function for API calls
async function apiCall(method, endpoint, body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (useAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data
  };
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
      // Check different response structures
      const responseData = result.data.data || result.data;
      token = responseData.access_token || responseData.tokens?.accessToken;
      
      if (!token) {
        console.log('❌ No token in response');
        console.log('Response structure:', JSON.stringify(result.data, null, 2));
        return false;
      }
      
      console.log('✅ SUCCESS!');
      console.log(`   Token: ${token.substring(0, 30)}...`);
      console.log(`   User: ${responseData.user?.name || responseData.user?.email || 'N/A'}`);
      console.log(`   Role: ${responseData.user?.role || 'N/A'}`);
      return true;
    } else {
      console.log('❌ FAILED:', result.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

// Test 2: GET /api/organizations (List All)
async function testListOrganizations() {
  console.log('\n🏢 Test 2: GET /api/organizations (List All)');
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('GET', '/api/organizations');

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Total: ${result.data.data.pagination.total} organizations`);
      result.data.data.organizations.forEach(org => {
        console.log(`   - ID:${org.id} | ${org.name} | ${org.subscription_plan} | Active: ${org.is_active}`);
      });
      return result.data.data.organizations;
    } else {
      console.log('❌ FAILED:', result.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

// Test 3: GET /api/organizations/:id (Get Single)
async function testGetOrganization(orgId) {
  console.log(`\n📋 Test 3: GET /api/organizations/${orgId} (Get Single)`);
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('GET', `/api/organizations/${orgId}`);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Name: ${result.data.data.name}`);
      console.log(`   Email: ${result.data.data.email}`);
      console.log(`   Plan: ${result.data.data.subscription_plan}`);
      console.log(`   Max Employees: ${result.data.data.max_employees}`);
      console.log(`   Max Devices: ${result.data.data.max_devices}`);
      console.log(`   Users: ${result.data.data.users?.length || 0}`);
      console.log(`   Devices: ${result.data.data.devices?.length || 0}`);
      console.log(`   Employees: ${result.data.data.employees?.length || 0}`);
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

// Test 4: GET /api/organizations/:id/stats (Get Stats)
async function testGetOrganizationStats(orgId) {
  console.log(`\n📊 Test 4: GET /api/organizations/${orgId}/stats (Get Stats)`);
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('GET', `/api/organizations/${orgId}/stats`);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      const stats = result.data.data;
      console.log(`   Users: ${stats.users.total} (Active: ${stats.users.active})`);
      console.log(`   Devices: ${stats.devices.total}/${stats.devices.limit} (Online: ${stats.devices.online})`);
      console.log(`   Employees: ${stats.employees.total}/${stats.employees.limit} (Active: ${stats.employees.active})`);
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

// Test 5: POST /api/organizations (Create New)
async function testCreateOrganization() {
  console.log('\n➕ Test 5: POST /api/organizations (Create New)');
  console.log('═'.repeat(50));
  
  const timestamp = Date.now();
  const newOrg = {
    name: 'Test Company Ltd ' + timestamp,
    email: `test${timestamp}@company.com`,
    phone: '+964 770 555 1234',
    address: 'Baghdad, Iraq',
    subscription_plan: 'pro',
    subscription_start: new Date().toISOString(),
    subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    max_employees: 200,
    max_devices: 10,
    storage_limit_mb: 2000
  };

  try {
    const result = await apiCall('POST', '/api/organizations', newOrg);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   New Org ID: ${result.data.data.id}`);
      console.log(`   Name: ${result.data.data.name}`);
      console.log(`   Plan: ${result.data.data.subscription_plan}`);
      return result.data.data.id;
    } else {
      console.log('❌ FAILED:', result.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

// Test 6: PUT /api/organizations/:id (Update)
async function testUpdateOrganization(orgId) {
  console.log(`\n✏️  Test 6: PUT /api/organizations/${orgId} (Update)`);
  console.log('═'.repeat(50));
  
  const updates = {
    name: 'Test Company Ltd (Updated)',
    phone: '+964 770 555 9999'
  };

  try {
    const result = await apiCall('PUT', `/api/organizations/${orgId}`, updates);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Updated Name: ${result.data.data.name}`);
      console.log(`   Updated Phone: ${result.data.data.phone}`);
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

// Test 7: PUT /api/organizations/:id/subscription (Update Subscription)
async function testUpdateSubscription(orgId) {
  console.log(`\n💳 Test 7: PUT /api/organizations/${orgId}/subscription (Update Subscription)`);
  console.log('═'.repeat(50));
  
  const subscription = {
    subscription_plan: 'enterprise',
    subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    const result = await apiCall('PUT', `/api/organizations/${orgId}/subscription`, subscription);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   New Plan: ${result.data.data.subscription_plan}`);
      console.log(`   Max Employees: ${result.data.data.max_employees}`);
      console.log(`   Max Devices: ${result.data.data.max_devices}`);
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

// Test 8: POST /api/organizations/:id/deactivate
async function testDeactivateOrganization(orgId) {
  console.log(`\n🔴 Test 8: POST /api/organizations/${orgId}/deactivate (Deactivate)`);
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('POST', `/api/organizations/${orgId}/deactivate`);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Is Active: ${result.data.data.is_active}`);
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

// Test 9: POST /api/organizations/:id/activate
async function testActivateOrganization(orgId) {
  console.log(`\n🟢 Test 9: POST /api/organizations/${orgId}/activate (Activate)`);
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('POST', `/api/organizations/${orgId}/activate`);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Is Active: ${result.data.data.is_active}`);
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

// Test 10: DELETE /api/organizations/:id
async function testDeleteOrganization(orgId) {
  console.log(`\n🗑️  Test 10: DELETE /api/organizations/${orgId} (Delete)`);
  console.log('═'.repeat(50));
  
  try {
    const result = await apiCall('DELETE', `/api/organizations/${orgId}`);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      console.log(`   Message: ${result.data.message}`);
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

// Main test runner
async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   🧪 ORGANIZATIONS API - COMPREHENSIVE TEST    ║');
  console.log('║          February 7, 2026                      ║');
  console.log('╚══════════════════════════════════════════════════╝');

  let newOrgId = null;

  // Run tests
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Login failed - aborting tests\n');
    return;
  }

  const organizations = await testListOrganizations();
  
  if (organizations && organizations.length > 0) {
    await testGetOrganization(organizations[0].id);
    await testGetOrganizationStats(organizations[0].id);
  }

  newOrgId = await testCreateOrganization();

  if (newOrgId) {
    await testUpdateOrganization(newOrgId);
    await testUpdateSubscription(newOrgId);
    await testDeactivateOrganization(newOrgId);
    await testActivateOrganization(newOrgId);
    await testDeleteOrganization(newOrgId);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║            ✅ TESTING COMPLETE!                 ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
