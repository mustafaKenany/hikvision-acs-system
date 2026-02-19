# System Health Check Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   HIKVISION ACS - System Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Redis
Write-Host "1. Checking Redis (port 6379)..." -ForegroundColor Yellow
$redisCheck = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($redisCheck.TcpTestSucceeded) {
    Write-Host "   OK - Redis is running" -ForegroundColor Green
} else {
    Write-Host "   FAIL - Redis is NOT running" -ForegroundColor Red
}
Write-Host ""

# 2. Check PostgreSQL
Write-Host "2. Checking PostgreSQL (port 5432)..." -ForegroundColor Yellow
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($pgCheck.TcpTestSucceeded) {
    Write-Host "   OK - PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "   FAIL - PostgreSQL is NOT running" -ForegroundColor Red
}
Write-Host ""

# 3. Check Backend
Write-Host "3. Checking Backend (port 3000)..." -ForegroundColor Yellow
$backendCheck = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($backendCheck.TcpTestSucceeded) {
    Write-Host "   OK - Backend is running" -ForegroundColor Green
    
    # Try health endpoint
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   Health Status:" -ForegroundColor Cyan
        Write-Host "      - Backend: $($response.status)" -ForegroundColor White
        if ($response.database) {
            Write-Host "      - Database: $($response.database.status)" -ForegroundColor White
        }
        if ($response.redis) {
            Write-Host "      - Redis: $($response.redis.status)" -ForegroundColor White
        }
    } catch {
        Write-Host "   Could not fetch health endpoint" -ForegroundColor Yellow
    }
} else {
    Write-Host "   FAIL - Backend is NOT running" -ForegroundColor Red
}
Write-Host ""

# 4. Check Frontend
Write-Host "4. Checking Frontend..." -ForegroundColor Yellow
$frontendCheck = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($frontendCheck.TcpTestSucceeded) {
    Write-Host "   OK - Frontend is running on port 5173" -ForegroundColor Green
    Write-Host "   URL: http://localhost:5173" -ForegroundColor Cyan
} else {
    $frontendCheck2 = Test-NetConnection -ComputerName localhost -Port 5174 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($frontendCheck2.TcpTestSucceeded) {
        Write-Host "   OK - Frontend is running on port 5174" -ForegroundColor Green
        Write-Host "   URL: http://localhost:5174" -ForegroundColor Cyan
    } else {
        Write-Host "   FAIL - Frontend is NOT running" -ForegroundColor Red
    }
}
Write-Host ""

# 5. Test Backend API
Write-Host "5. Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/organizations" -Method Get -SkipHttpErrorCheck -TimeoutSec 5 -ErrorAction Stop
    
    if ($response.StatusCode -eq 401) {
        Write-Host "   OK - API is responding (auth required)" -ForegroundColor Green
    } elseif ($response.StatusCode -eq 200) {
        Write-Host "   OK - API is working!" -ForegroundColor Green
    } else {
        Write-Host "   Status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   FAIL - Could not reach API" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open frontend URL in browser" -ForegroundColor White
Write-Host "  2. Login: admin@system.com / admin123" -ForegroundColor White
Write-Host "  3. Check browser console for cache messages" -ForegroundColor White
Write-Host ""
