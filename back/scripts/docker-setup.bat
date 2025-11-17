@echo off
REM Docker PostgreSQL Setup for Rental Management System

echo.
echo === Setting up PostgreSQL in Docker ===
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is running...
echo.

REM Stop and remove existing postgres container if it exists
echo Checking for existing PostgreSQL container...
docker stop postgres-rental 2>nul
docker rm postgres-rental 2>nul

REM Create and start PostgreSQL container
echo Creating PostgreSQL container...
docker run --name postgres-rental ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=rental_management ^
  -p 5432:5432 ^
  -d postgres:16-alpine

if %ERRORLEVEL% NEQ 0 (
    echo Error creating container
    pause
    exit /b 1
)

echo.
echo Waiting for PostgreSQL to start (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo Testing connection...
docker exec postgres-rental psql -U postgres -d rental_management -c "SELECT version();"

if %ERRORLEVEL% NEQ 0 (
    echo Warning: PostgreSQL might still be starting...
    echo Wait a few more seconds and try the next step
)

echo.
echo ===================================
echo PostgreSQL is ready!
echo ===================================
echo.
echo Container name: postgres-rental
echo Database name: rental_management
echo Username: postgres
echo Password: postgres
echo Port: 5432
echo.
echo Next: Run setup-database-docker.bat to create tables
echo.
pause

