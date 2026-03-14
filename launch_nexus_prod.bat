@echo off
title Nexus Mission Control (PRODUCTION)
color 0a

:: Ensure we start in the script's directory
cd /d "%~dp0"

echo ========================================================
echo   N E X U S   L U X R I G   C O M M A N D   C E N T E R
echo ========================================================
echo.

if exist "app" (
    cd app
) else (
    echo [ERROR] 'app' directory not found!
    pause
    exit /b
)

:: Check if build folder exists
if not exist "dist" (
    echo [WARNING] No build found. Running setup first...
    cd ..
    call setup_luxrig.bat
    cd app
)

echo.
echo [Nexus] Launching Production Server...
echo.
echo  - Port:    3001
echo  - Status:  ONLINE
echo.
echo Press Ctrl+C to stop.
echo.

call npm run preview

echo.
echo [SERVER STOPPED]
pause
