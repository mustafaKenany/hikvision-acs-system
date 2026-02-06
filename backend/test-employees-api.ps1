# Test Employees API
Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "  Testing Employees Management API  " -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# 1. Login
Write-Host "[1] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@demo.test"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
        -Method POST `
        -ContentType 'application/json' `
        -Body $loginBody
    
    $token = $loginResp.data.tokens.accessToken
    if (-not $token) {
        Write-Host "FAIL: Token missing from login response" -ForegroundColor Red
        exit
    }
    Write-Host "OK: Login successful" -ForegroundColor Green
    Write-Host "   Token received (length: $($token.Length))`n" -ForegroundColor Gray
    
    $headers = @{
        Authorization = "Bearer $token"
    }
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit
}

# 2. Get Stats
Write-Host "[2] Getting employee statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri 'http://localhost:3000/api/employees/stats/overview' `
        -Method GET `
        -Headers $headers
    
    Write-Host "OK: Stats retrieved:" -ForegroundColor Green
    Write-Host "   Total: $($stats.data.total)" -ForegroundColor Gray
    Write-Host "   Active: $($stats.data.active)" -ForegroundColor Gray
    Write-Host "   Inactive: $($stats.data.inactive)" -ForegroundColor Gray
    Write-Host "   Departments: $($stats.data.departments_count)`n" -ForegroundColor Gray
} catch {
    Write-Host "FAIL: Stats failed: $_" -ForegroundColor Red
}

# 3. Create Employee
Write-Host "[3] Creating new employee..." -ForegroundColor Yellow
$rand = Get-Random -Minimum 1000 -Maximum 9999
$employeeNo = "EMP$rand"
$employeeEmail = "emp$rand@demo.test"
$employeeBody = @{
    employee_no = $employeeNo
    name = "Test Employee $rand"
    name_ar = "موظف $rand"
    email = $employeeEmail
    department = "IT"
    position = "Developer"
    phone = "+9647701234567"
} | ConvertTo-Json

try {
    $createResp = Invoke-RestMethod -Uri 'http://localhost:3000/api/employees' `
        -Method POST `
        -Headers $headers `
        -ContentType 'application/json' `
        -Body $employeeBody
    
    Write-Host "OK: Employee created:" -ForegroundColor Green
    Write-Host "   ID: $($createResp.data.id)" -ForegroundColor Gray
    Write-Host "   Employee No: $($createResp.data.employee_no)" -ForegroundColor Gray
    Write-Host "   Name: $($createResp.data.name)`n" -ForegroundColor Gray
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "FAIL: Create failed: $errorMessage" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
    Write-Host ""
}

# 4. Get Employees List
Write-Host "[4] Getting employees list..." -ForegroundColor Yellow
try {
    $list = Invoke-RestMethod -Uri 'http://localhost:3000/api/employees?page=1&limit=10' `
        -Method GET `
        -Headers $headers
    
    Write-Host "OK: Employees list retrieved:" -ForegroundColor Green
    Write-Host "   Total: $($list.data.pagination.total)" -ForegroundColor Gray
    Write-Host "   Page: $($list.data.pagination.page) of $($list.data.pagination.total_pages)`n" -ForegroundColor Gray
    
    if ($list.data.employees -and $list.data.employees.Count -gt 0) {
        $list.data.employees | Select-Object id, employee_no, name, department, is_active | Format-Table -AutoSize
    } else {
        Write-Host "   No employees found`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL: List failed: $_" -ForegroundColor Red
}

# 5. Get Departments
Write-Host "[5] Getting departments list..." -ForegroundColor Yellow
try {
    $depts = Invoke-RestMethod -Uri 'http://localhost:3000/api/employees/departments/list' `
        -Method GET `
        -Headers $headers
    
    Write-Host "OK: Departments retrieved:" -ForegroundColor Green
    if ($depts.data -and $depts.data.Count -gt 0) {
        $depts.data | Select-Object department, employee_count | Format-Table -AutoSize
    } else {
        Write-Host "   No departments found`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL: Departments failed: $_" -ForegroundColor Red
}

Write-Host "`n====================================`n" -ForegroundColor Cyan
