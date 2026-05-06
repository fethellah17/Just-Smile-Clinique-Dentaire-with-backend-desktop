@echo off
echo Installing bcrypt dependency...
cd api
call npm install bcrypt
echo.
echo Reinitializing database with users table...
call npm run init-db
echo.
echo Setup complete! You can now restart the server.
pause
