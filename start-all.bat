@echo off
echo Starting all services...

REM Start backend in new window
start "Backend" cmd /k "cd /d %~dp0back && npm run dev"

REM Start frontend in new window
start "Frontend" cmd /k "cd /d %~dp0front && npm run dev"

REM Start WhatsApp service in new window
start "WhatsApp Service" cmd /k "cd /d %~dp0wapp && npm run dev"

echo.
echo All services started in separate windows!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo WhatsApp: http://localhost:3002
pause

