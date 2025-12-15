@echo off
echo ========================================
echo Sanskaar Frontend - Installation Script
echo ========================================
echo.

echo Step 1: Cleaning old installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist build rmdir /s /q build
echo Done!
echo.

echo Step 2: Clearing npm cache...
call npm cache clean --force
echo Done!
echo.

echo Step 3: Installing dependencies (this may take 2-3 minutes)...
call npm install
echo Done!
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the app, run:
echo npm start
echo.
pause
