@echo off
REM ========================================
REM Redis Start Script (Windows)
REM تشغيل Redis على Windows
REM ========================================

echo.
echo ====================================
echo Starting Redis Server...
echo ====================================
echo.

REM Check if redis-cli is available (Memurai or Redis Windows)
where redis-cli >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Redis/Memurai is already installed on PATH
    echo Starting redis-server...
    start redis-server
    timeout /t 2 /nobreak
    echo.
    echo Testing connection...
    redis-cli ping
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Redis is running successfully!
        echo.
        echo Access Redis CLI: redis-cli
        echo Monitor commands: redis-cli MONITOR
        echo.
    ) else (
        echo.
        echo ❌ Redis failed to start
        echo.
    )
    goto :END
)

REM Check if Memurai is installed
where memurai-cli >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Memurai is installed
    echo Starting Memurai...
    net start Memurai
    timeout /t 2 /nobreak
    echo.
    echo Testing connection...
    memurai-cli ping
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Memurai is running successfully!
        echo.
        echo Access Memurai CLI: memurai-cli
        echo Monitor commands: memurai-cli MONITOR
        echo.
    ) else (
        echo ❌ Memurai failed to start
        echo.
    )
    goto :END
)

REM Check if Docker is available
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Docker is installed
    echo Starting Redis in Docker...
    docker run -d -p 6379:6379 --name redis-hikvision redis:latest
    if %ERRORLEVEL% EQU 0 (
        timeout /t 3 /nobreak >nul
        echo.
        echo ✅ Redis container started!
        echo.
        echo Access Redis CLI: docker exec -it redis-hikvision redis-cli
        echo Stop Redis: docker stop redis-hikvision
        echo Remove Redis: docker rm redis-hikvision
        echo.
    ) else (
        echo.
        echo ❌ Failed to start Redis container
        echo Container might already exist. Try: docker start redis-hikvision
        echo.
    )
    goto :END
)

REM No Redis found
echo.
echo ========================================
echo ❌ Redis NOT FOUND
echo ========================================
echo.
echo Please install Redis using one of these methods:
echo.
echo 1. Memurai (Recommended for Windows):
echo    Download from: https://www.memurai.com/get-memurai
echo.
echo 2. Docker:
echo    Install Docker Desktop and run:
echo    docker run -d -p 6379:6379 --name redis redis:latest
echo.
echo 3. WSL2 (Windows Subsystem for Linux):
echo    Install WSL2 and run:
echo    sudo apt install redis-server
echo    sudo service redis-server start
echo.
echo After installation, run this script again.
echo.

:END
pause
