@echo off
echo =================================================================
echo   CampusTrack - Automatic 1-Click Setup for Friend's Laptop
echo =================================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this laptop!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo Then run this file again.
    pause
    exit /b
)

echo [1/3] Installing Backend Dependencies & Preparing Database...
cd server
call npm install
call node node_modules/prisma/build/index.js db push
call node src/seed.js
cd ..

echo.
echo [2/3] Installing Frontend Dependencies...
cd client
call npm install
cd ..

echo.
echo =================================================================
echo [3/3] Setup Complete! Launching CampusTrack...
echo =================================================================
echo.

start "Backend Server (Port 5000)" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo Both servers started!
echo Open your browser to: http://localhost:5173
echo.
pause
