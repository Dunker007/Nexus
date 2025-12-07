@echo off
title Nexus Mission Control (PRODUCTION)
color 0a

:: Ensure we start in the script's directory
cd /d "%~dp0"

echo ========================================================
echo   N E X U S   L U X R I G   C O M M A N D   C E N T E R
echo ========================================================
echo.

if exist "webapp" (
    cd webapp
) else (
    echo [ERROR] 'webapp' directory not found!
    pause
    exit /b
)

:: Check if build folder exists
if not exist ".next" (
    echo [WARNING] No build found. Running setup first...
    cd ..
    call setup_luxrig.bat
    cd webapp
)

echo.
echo [Nexus] Launching Production Server...
echo.
echo  - Port:    3002
echo  - Status:  ONLINE
echo.
echo Press Ctrl+C to stop.
echo.

:: Run start command with port 3002, accessible to network
call npm start -- -p 3002 --hostname 0.0.0.0

echo.
echo [SERVER STOPPED]
pause
