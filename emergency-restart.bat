@echo off
echo ========================================
echo EMERGENCY RESTART - Just Smile Clinic
echo ========================================
echo.
echo Step 1: Installing bcrypt (if needed)...
cd api
call npm install bcrypt --silent
echo.
echo Step 2: Restarting API server...
echo The server will auto-create the users table and default account.
echo.
echo Default credentials:
echo   Email: dr.souidi@justsmile.dz
echo   Password: admin123
echo   Recovery Code: JUST-SMILE-2026
echo.
echo ========================================
echo Starting server...
echo ========================================
call npm start
