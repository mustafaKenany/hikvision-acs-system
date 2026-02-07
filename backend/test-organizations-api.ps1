# Organizations API - PowerShell Test Script
# Created: February 7, 2026

Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🏢 ORGANIZATIONS API - COMPREHENSIVE TEST   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Login
Write-Host "🔐 Step 1: Login as Super Admin...`n" -ForegroundColor Yellow
$loginBody = '{"email":"super@admin.com","password":"Super@123456"}'
$loginResp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResp.data.access_token
$Headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Write-Host "✅ Login Success! Role: $($loginResp.data.user.role)`n" -ForegroundColor Green

# Test 1: GET /api/organizations (List All)
Write-Host "`n1️⃣  GET /api/organizations (List All)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations" -Method GET -Headers $Headers
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Total: $($result.data.pagination.total)" -ForegroundColor White
    $result.data.organizations | ForEach-Object { 
        Write-Host "   - ID:$($_.id) | $($_.name) | Plan: $($_.subscription_plan) | Active: $($_.is_active)" -ForegroundColor Cyan
    }
    $orgId = $result.data.organizations[0].id
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $orgId = 2  # fallback
}

# Test 2: GET /api/organizations/:id (Get Single)
Write-Host "`n2️⃣  GET /api/organizations/$orgId (Get Details)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$orgId" -Method GET -Headers $Headers
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Name: $($result.data.name)" -ForegroundColor White
    Write-Host "   Email: $($result.data.email)" -ForegroundColor White
    Write-Host "   Plan: $($result.data.subscription_plan)" -ForegroundColor Yellow
    if ($result.data.subscription_active) {
        Write-Host "   Status: Active" -ForegroundColor Green
    } else {
        Write-Host "   Status: Expired" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: POST /api/organizations (Create New)
Write-Host "`n3️⃣  POST /api/organizations (Create New)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
$createBody = @{
    name = "New Test Org $(Get-Date -Format 'HHmmss')"
    email = "neworg$(Get-Date -Format 'HHmmss')@test.com"
    phone = "+964 770 888 7777"
    address = "Basra, Iraq"
    subscription_plan = "basic"
    max_employees = 50
    max_devices = 3
} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations" -Method POST -Headers $Headers -Body $createBody
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   New Org ID: $($result.data.id)" -ForegroundColor White
    Write-Host "   Name: $($result.data.name)" -ForegroundColor Cyan
    $newOrgId = $result.data.id
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $newOrgId = $null
}

# Test 4: GET /api/organizations/:id/stats (Get Stats)
Write-Host "`n4️⃣  GET /api/organizations/$orgId/stats (Get Statistics)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$orgId/stats" -Method GET -Headers $Headers
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Users: $($result.data.users.total) (Active: $($result.data.users.active))" -ForegroundColor White
    Write-Host "   Devices: $($result.data.devices.total) / $($result.data.devices.limit)" -ForegroundColor Yellow
    Write-Host "   Employees: $($result.data.employees.total) / $($result.data.employees.limit)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: PUT /api/organizations/:id (Update)
if ($newOrgId) {
    Write-Host "`n5️⃣  PUT /api/organizations/$newOrgId (Update)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
    $updateBody = @{
        phone = "+964 770 999 6666"
        address = "Erbil, Iraq"
    } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$newOrgId" -Method PUT -Headers $Headers -Body $updateBody
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Updated Phone: $($result.data.phone)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: PUT /api/organizations/:id/subscription (Update Subscription)
if ($newOrgId) {
    Write-Host "`n6️⃣  PUT /api/organizations/$newOrgId/subscription (Update Subscription)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
    $subsBody = @{
        subscription_plan = "pro"
        subscription_end = (Get-Date).AddYears(2).ToString("yyyy-MM-dd")
        max_employees = 200
        max_devices = 10
    } | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$newOrgId/subscription" -Method PUT -Headers $Headers -Body $subsBody
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   New Plan: $($result.data.subscription_plan)" -ForegroundColor Yellow
        Write-Host "   Max Employees: $($result.data.max_employees)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: GET /api/organizations/:id/settings (Get Settings)
Write-Host "`n7️⃣  GET /api/organizations/$orgId/settings (Get Settings)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$orgId/settings" -Method GET -Headers $Headers
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Settings: $($result.data.settings | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: PUT /api/organizations/:id/settings (Update Settings)
Write-Host "`n8️⃣  PUT /api/organizations/$orgId/settings (Update Settings)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
$settingsBody = @{
    timezone = "Asia/Baghdad"
    language = "ar"
    notifications_enabled = $true
} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$orgId/settings" -Method PUT -Headers $Headers -Body $settingsBody
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Updated Settings: $($result.data.settings | ConvertTo-Json -Compress)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: POST /api/organizations/:id/deactivate (Deactivate)
if ($newOrgId) {
    Write-Host "`n9️⃣  POST /api/organizations/$newOrgId/deactivate (Deactivate)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$newOrgId/deactivate" -Method POST -Headers $Headers
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Status: Is Active = $($result.data.is_active)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 10: POST /api/organizations/:id/activate (Activate)
if ($newOrgId) {
    Write-Host "`n🔟 POST /api/organizations/$newOrgId/activate (Activate)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$newOrgId/activate" -Method POST -Headers $Headers
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Status: Is Active = $($result.data.is_active)" -ForegroundColor Green
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 11: DELETE /api/organizations/:id (Delete)
if ($newOrgId) {
    Write-Host "`n1️⃣1️⃣  DELETE /api/organizations/$newOrgId (Delete)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations/$newOrgId" -Method DELETE -Headers $Headers
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Message: $($result.message)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ TESTING COMPLETE!                ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Green
