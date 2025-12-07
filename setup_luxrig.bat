@echo off
title Nexus LuxRig Installation
color 0b

:: Ensure we start in the script's directory
cd /d "%~dp0"

echo ========================================================
echo    N E X U S   L U X R I G   I N S T A L L E R
echo ========================================================
echo.

:: Check prerequisites
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / NPM is not installed!
    echo Please install Node.js LTS from nodejs.org
    pause
    exit /b
)

echo.
echo [0/3] Configuring Environment...
if exist "luxrig_params.env" (
    copy /Y "luxrig_params.env" "webapp\.env"
    echo [OK] Applied LuxRig environment configuration.
) else (
    echo [WARNING] 'luxrig_params.env' not found. Using defaults.
)

if exist "webapp" (
    cd webapp
    echo [OK] Entering webapp directory...
) else (
    echo [ERROR] Could not find 'webapp' directory!
    pause
    exit /b
)

echo.
echo [1/3] Installing Dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo [2/3] Setting up Database...
:: Verify schema validity first
call npx prisma validate
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Prisma schema validation failed. Attempting migrate anyway...
)
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo [3/3] Building Application...
call npm run build
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo ========================================================
echo    I N S T A L L A T I O N   C O M P L E T E
echo ========================================================
echo.
echo System is ready. Use 'launch_nexus_prod.bat' to start.
echo.
pause
exit /b

:error
echo.
echo [ERROR] Installation process failed at step above.
pause
exit /b
