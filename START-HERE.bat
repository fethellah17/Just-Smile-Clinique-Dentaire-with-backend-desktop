@echo off
cls
echo ========================================
echo   JUST SMILE - DENTAL CLINIC SYSTEM
echo ========================================
echo.
echo This script will start your application.
echo.
echo Default Login Credentials:
echo   Email: dr.souidi@justsmile.dz
echo   Password: admin123
echo   Recovery Code: JUST-SMILE-2026
echo.
echo ========================================
echo.
pause

echo Installing dependencies (if needed)...
cd api
call npm install bcrypt --silent 2>nul
cd ..

echo.
echo ========================================
echo Starting API Server...
echo ========================================
start "Just Smile API" cmd /k "cd api && npm start"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Frontend...
echo ========================================
start "Just Smile Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Application is starting!
echo ========================================
echo.
echo Two windows will open:
echo   1. API Server (backend)
echo   2. Frontend (user interface)
echo.
echo Wait a few seconds, then open your browser to:
echo   http://localhost:5173
echo.
echo Login with:
echo   dr.souidi@justsmile.dz / admin123
echo.
echo ========================================
pause
