@echo off
echo ========================================
echo   Dental Clinic - Clean Restart Script
echo ========================================
echo.

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
) else (
    echo ℹ No Node processes were running
)
echo.

echo [2/4] Waiting for ports to be released...
timeout /t 2 /nobreak >nul
echo ✓ Ports released
echo.

echo [3/4] Starting API server on port 3000...
start "Dental API Server" cmd /k "cd api && npm start"
timeout /t 3 /nobreak >nul
echo ✓ API server started
echo.

echo [4/4] Starting Frontend on port 5173...
start "Dental Frontend" cmd /k "npm run dev"
echo ✓ Frontend started
echo.

echo ========================================
echo   All services started successfully!
echo ========================================
echo.
echo API Server:  http://localhost:3000
echo Frontend:    http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
