@echo off
echo Stopping all services...
echo.

REM Find and kill processes on port 3001 (Backend) - FORCE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping Backend on port 3001 (PID: %%a)
    taskkill /F /T /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   Warning: Could not kill PID %%a, trying again...
        timeout /t 1 /nobreak >nul
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

REM Find and kill processes on port 3005 (WhatsApp) - FORCE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005 ^| findstr LISTENING') do (
    echo Stopping WhatsApp service on port 3005 (PID: %%a)
    taskkill /F /T /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   Warning: Could not kill PID %%a, trying again...
        timeout /t 1 /nobreak >nul
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

REM Find and kill processes on port 5173 (Frontend) - FORCE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Stopping Frontend on port 5173 (PID: %%a)
    taskkill /F /T /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   Warning: Could not kill PID %%a, trying again...
        timeout /t 1 /nobreak >nul
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

REM Find and kill processes on port 5174 (Public Site) - FORCE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do (
    echo Stopping Public Site on port 5174 (PID: %%a)
    taskkill /F /T /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo   Warning: Could not kill PID %%a, trying again...
        timeout /t 1 /nobreak >nul
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

REM Close all cmd windows with our service titles - FORCE
taskkill /F /T /FI "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /F /T /FI "WINDOWTITLE eq Frontend*" >nul 2>&1
taskkill /F /T /FI "WINDOWTITLE eq WhatsApp Service*" >nul 2>&1
taskkill /F /T /FI "WINDOWTITLE eq Public Site*" >nul 2>&1

REM Additional cleanup - kill any remaining node processes on these ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 :3005 :5173 :5174" ^| findstr LISTENING') do (
    echo Force killing remaining process on ports (PID: %%a)
    taskkill /F /T /PID %%a >nul 2>&1
)

echo.
echo All services stopped!
echo.
echo TIP: Wait 5-10 seconds before starting services again to allow ports to fully release.
pause

