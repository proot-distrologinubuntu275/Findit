@echo off
echo ===================================================
echo   Starting CampusTrack - College Lost & Found
echo ===================================================
echo.

start "Backend Server (Port 5000)" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo.
pause
