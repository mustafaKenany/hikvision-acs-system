# Quick Test - Organizations API
# Feb 7, 2026

Write-Host "`n🔐 Login..." -ForegroundColor Cyan
$loginBody = @{
    email = "super@admin.com"
    password = "Super@123456"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResp.data.access_token

if (!$token) {
    Write-Host "❌ No token received!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login success - Token: $($token.Substring(0,30))...`n" -ForegroundColor Green

$Headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "🏢 GET /api/organizations..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/organizations" -Method GET -Headers $Headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "   Total: $($result.data.pagination.total)" -ForegroundColor White
    $result.data.organizations | ForEach-Object {
        $orgName = $_.name
        $orgId = $_.id
        $orgPlan = $_.subscription_plan
        Write-Host "   - ID:$orgId - $orgName - Plan: $orgPlan" -ForegroundColor Cyan
    }
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nDone!`n" -ForegroundColor Green
