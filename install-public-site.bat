@echo off
echo ====================================
echo Installing Public Site Dependencies
echo ====================================
echo.

cd public-site
if not exist package.json (
    echo Error: package.json not found in public-site directory
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Installation completed successfully!
    echo ====================================
    echo.
    echo You can now start all services with:
    echo   start-all.bat
    echo.
    echo Or start just the public site with:
    echo   cd public-site
    echo   npm run dev
    echo.
) else (
    echo.
    echo ====================================
    echo Installation failed!
    echo ====================================
    echo Please check the error messages above.
    echo.
)

pause

