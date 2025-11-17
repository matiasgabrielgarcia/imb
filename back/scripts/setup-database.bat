@echo off
REM Database Setup Script for Windows (Batch)
REM This is a simpler alternative to the PowerShell script

echo.
echo === Rental Management Database Setup ===
echo.

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: psql command not found
    echo Please install PostgreSQL or add it to your PATH
    echo.
    echo After installation, add this to PATH:
    echo   C:\Program Files\PostgreSQL\16\bin
    echo.
    pause
    exit /b 1
)

echo PostgreSQL client found
echo.

REM Set connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=rental_management
set PGPASSWORD=postgres

echo Step 1: Creating database '%DB_NAME%'...
echo.

REM Create database (will show error if exists, which is fine)
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Database created successfully
) else (
    echo Database may already exist, continuing...
)

echo.
echo Step 2: Applying database schema...
echo.

REM Run the initialization script
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f init-database.sql

if %ERRORLEVEL% NEQ 0 (
    echo Error applying schema
    pause
    exit /b 1
)

echo.
echo Schema applied successfully
echo.

set /p LOAD_SEED="Do you want to load sample seed data? (Y/N): "
if /i "%LOAD_SEED%"=="Y" (
    echo.
    echo Loading seed data...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f seed_data.sql
    
    if %ERRORLEVEL% NEQ 0 (
        echo Warning: Error loading seed data
    ) else (
        echo Seed data loaded successfully
    )
)

echo.
echo ==================================
echo Database setup completed!
echo ==================================
echo.
echo Database Name: %DB_NAME%
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo.
echo Next steps:
echo   1. Copy env.example to .env
echo   2. Update .env with your credentials
echo   3. Start your backend server
echo.
pause

