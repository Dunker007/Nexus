@echo off
title Nexus Mission Control
color 0b

:: Ensure we start in the script's directory
cd /d "%~dp0"

echo ========================================================
echo       N E X U S   C O M M A N D   C E N T E R
echo ========================================================
echo.

:: Navigate to webapp
if exist "webapp" (
    cd webapp
    echo [OK] Found webapp directory.
) else (
    echo [ERROR] Could not find 'webapp' directory!
    echo Current directory: %CD%
    pause
    exit /b
)

echo.
echo [1/2] Initializing Vibe Coding Environment...
echo [2/2] Launching Server on Port 3002...
echo.
echo  - Local:   http://localhost:3002
echo  - Network: https://100.74.130.117:3002
echo.
echo Press Ctrl+C to stop the server.
echo.

:: Use CALL to ensure control returns to this script after npm finishes
call npm run dev -- -p 3002

echo.
echo [SERVER STOPPED]
echo.
pause
