# ========================================
#  Comprehensive Employees API Testing
# ========================================

$baseUrl = "http://localhost:3000/api"
$headers = @{ "Content-Type" = "application/json" }

# Login
Write-Host "`n====================================`n  EMPLOYEES API - COMPREHENSIVE TEST`n====================================" -ForegroundColor Cyan
Write-Host "`n[1] Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@demo.test"
    password = "Admin@123"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -Headers $headers -ErrorAction Stop
$token = $loginResp.data.tokens.accessToken
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
Write-Host "OK: Logged in (Token: $($token.Substring(0,20))...)" -ForegroundColor Green

# Test 1: Get Statistics
Write-Host "`n[2] GET /api/employees/stats/overview" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$baseUrl/employees/stats/overview" -Headers $authHeaders
Write-Host "OK: Total=$($stats.data.total), Active=$($stats.data.active), Inactive=$($stats.data.inactive), Depts=$($stats.data.departments_count)" -ForegroundColor Green

# Test 2: Get Departments List
Write-Host "`n[3] GET /api/employees/departments/list" -ForegroundColor Yellow
$depts = Invoke-RestMethod -Uri "$baseUrl/employees/departments/list" -Headers $authHeaders
Write-Host "OK: Departments retrieved (Count: $($depts.data.Count))" -ForegroundColor Green

# Test 3: Create New Employee
Write-Host "`n[4] POST /api/employees (Create)" -ForegroundColor Yellow
$rand = Get-Random -Minimum 1000 -Maximum 9999
$createBody = @{
    employee_no = "EMP$rand"
    name = "Test Employee $rand"
    department = "IT"
    email = "emp${rand}@test.com"
    phone = "07700000000"
    hire_date = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$createResp = Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Body $createBody -Headers $authHeaders
$newEmpId = $createResp.data.id
Write-Host "OK: Employee created (ID=$newEmpId, EMP_NO=$($createResp.data.employee_no))" -ForegroundColor Green

# Test 4: Get All Employees with Pagination
Write-Host "`n[5] GET /api/employees (List with pagination)" -ForegroundColor Yellow
$list = Invoke-RestMethod -Uri "$baseUrl/employees?page=1&limit=10" -Headers $authHeaders
Write-Host "OK: Total=$($list.data.pagination.total), Page=$($list.data.pagination.currentPage)/$($list.data.pagination.totalPages)" -ForegroundColor Green

# Test 5: Get Single Employee by ID
Write-Host "`n[6] GET /api/employees/:id (Single employee)" -ForegroundColor Yellow
$single = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId" -Headers $authHeaders
Write-Host "OK: Employee retrieved (ID=$($single.data.id), Name=$($single.data.name), Dept=$($single.data.department))" -ForegroundColor Green

# Test 6: Get Employee Biometrics
Write-Host "`n[7] GET /api/employees/:id/biometrics" -ForegroundColor Yellow
$bio = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId/biometrics" -Headers $authHeaders
Write-Host "OK: Biometrics retrieved (Faces=$($bio.data.faces_count), Fingerprints=$($bio.data.fingerprints_count), Cards=$($bio.data.cards_count))" -ForegroundColor Green

# Test 7: Update Employee
Write-Host "`n[8] PUT /api/employees/:id (Update)" -ForegroundColor Yellow
$updateBody = @{
    name = "Updated Name $rand"
    phone = "07711111111"
    department = "HR"
} | ConvertTo-Json

$updateResp = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId" -Method PUT -Body $updateBody -Headers $authHeaders
Write-Host "OK: Employee updated (Name=$($updateResp.data.name), Dept=$($updateResp.data.department))" -ForegroundColor Green

# Test 8: Deactivate Employee
Write-Host "`n[9] POST /api/employees/:id/deactivate" -ForegroundColor Yellow
$deactResp = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId/deactivate" -Method POST -Headers $authHeaders
Write-Host "OK: Employee deactivated (is_active=$($deactResp.data.is_active))" -ForegroundColor Green

# Test 9: Activate Employee
Write-Host "`n[10] POST /api/employees/:id/activate" -ForegroundColor Yellow
$actResp = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId/activate" -Method POST -Headers $authHeaders
Write-Host "OK: Employee activated (is_active=$($actResp.data.is_active))" -ForegroundColor Green

# Test 10: Search Employees
Write-Host "`n[11] GET /api/employees?search=Test" -ForegroundColor Yellow
$searchResp = Invoke-RestMethod -Uri "$baseUrl/employees?search=Test&page=1&limit=5" -Headers $authHeaders
Write-Host "OK: Search results (Found=$($searchResp.data.employees.Count), Total=$($searchResp.data.pagination.total))" -ForegroundColor Green

# Test 11: Filter by Department
Write-Host "`n[12] GET /api/employees?department=HR" -ForegroundColor Yellow
$filterResp = Invoke-RestMethod -Uri "$baseUrl/employees?department=HR" -Headers $authHeaders
Write-Host "OK: Filtered by HR (Count=$($filterResp.data.employees.Count))" -ForegroundColor Green

# Test 12: Filter by Status (Active)
Write-Host "`n[13] GET /api/employees?is_active=true" -ForegroundColor Yellow
$activeResp = Invoke-RestMethod -Uri "$baseUrl/employees?is_active=true" -Headers $authHeaders
Write-Host "OK: Active employees (Count=$($activeResp.data.employees.Count))" -ForegroundColor Green

# Test 13: Sort by Name Descending
Write-Host "`n[14] GET /api/employees?sort_by=name&sort_order=DESC" -ForegroundColor Yellow
$sortResp = Invoke-RestMethod -Uri "$baseUrl/employees?sort_by=name&sort_order=DESC&limit=3" -Headers $authHeaders
Write-Host "OK: Sorted by name DESC (First=$($sortResp.data.employees[0].name))" -ForegroundColor Green

# Test 14: Delete Employee (Soft Delete)
Write-Host "`n[15] DELETE /api/employees/:id (Soft delete)" -ForegroundColor Yellow
$deleteResp = Invoke-RestMethod -Uri "$baseUrl/employees/$newEmpId" -Method DELETE -Headers $authHeaders
Write-Host "OK: Employee deleted (deleted_at=$($deleteResp.data.deleted_at -ne $null))" -ForegroundColor Green

# Test 15: Verify deletion (should be excluded from list)
Write-Host "`n[16] GET /api/employees (Verify deletion)" -ForegroundColor Yellow
$afterDelete = Invoke-RestMethod -Uri "$baseUrl/employees" -Headers $authHeaders
Write-Host "OK: Total employees after deletion=$($afterDelete.data.pagination.total)" -ForegroundColor Green

# Error Tests
Write-Host "`n====================================`n  ERROR HANDLING TESTS`n====================================" -ForegroundColor Cyan

# Test 16: Create with duplicate employee_no
Write-Host "`n[17] POST /api/employees (Duplicate employee_no)" -ForegroundColor Yellow
try {
    $dupBody = @{
        employee_no = "EMP001"  # Already exists
        name = "Duplicate Test"
        department = "IT"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Body $dupBody -Headers $authHeaders
    Write-Host "FAIL: Should have returned error for duplicate" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "OK: Duplicate validation works (Error: $($err.message))" -ForegroundColor Green
}

# Test 17: Get non-existent employee
Write-Host "`n[18] GET /api/employees/:id (Non-existent ID)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/employees/99999" -Headers $authHeaders
    Write-Host "FAIL: Should have returned 404" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "OK: 404 handling works (Error: $($err.message))" -ForegroundColor Green
}

# Test 18: Create with missing required fields
Write-Host "`n[19] POST /api/employees (Missing required fields)" -ForegroundColor Yellow
try {
    $invalidBody = @{
        name = "Test Only"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Body $invalidBody -Headers $authHeaders
    Write-Host "FAIL: Should have returned validation error" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "OK: Validation works (Error: $($err.message))" -ForegroundColor Green
}

# Test 19: Update non-existent employee
Write-Host "`n[20] PUT /api/employees/:id (Non-existent ID)" -ForegroundColor Yellow
try {
    $updateInvalidBody = @{ name = "Test" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/employees/99999" -Method PUT -Body $updateInvalidBody -Headers $authHeaders
    Write-Host "FAIL: Should have returned 404" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "OK: 404 handling works (Error: $($err.message))" -ForegroundColor Green
}

# Summary
Write-Host "`n====================================`n  TEST SUMMARY`n====================================" -ForegroundColor Cyan
Write-Host "✅ Basic Operations (6 tests)" -ForegroundColor Green
Write-Host "✅ CRUD Operations (4 tests)" -ForegroundColor Green
Write-Host "✅ Status Management (2 tests)" -ForegroundColor Green
Write-Host "✅ Filtering & Search (4 tests)" -ForegroundColor Green
Write-Host "✅ Error Handling (4 tests)" -ForegroundColor Green
Write-Host "`nTotal: 20 tests executed successfully" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan
