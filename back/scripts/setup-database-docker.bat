@echo off
REM Apply database schema to Docker PostgreSQL

echo.
echo === Applying Database Schema ===
echo.

REM Check if container is running
docker ps --filter "name=postgres-rental" --filter "status=running" | findstr postgres-rental >nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PostgreSQL container is not running
    echo Run docker-setup.bat first
    pause
    exit /b 1
)

echo PostgreSQL container is running...
echo.

REM Copy SQL files to container
echo Copying SQL files to container...
docker cp init-database.sql postgres-rental:/tmp/init-database.sql
docker cp seed_data.sql postgres-rental:/tmp/seed_data.sql

echo.
echo Applying database schema...
docker exec postgres-rental psql -U postgres -d rental_management -f /tmp/init-database.sql

if %ERRORLEVEL% NEQ 0 (
    echo Error applying schema
    pause
    exit /b 1
)

echo.
echo Schema applied successfully!
echo.

set /p LOAD_SEED="Load sample seed data? (Y/N): "
if /i "%LOAD_SEED%"=="Y" (
    echo.
    echo Loading seed data...
    docker exec postgres-rental psql -U postgres -d rental_management -f /tmp/seed_data.sql
    echo Seed data loaded!
)

echo.
echo ===================================
echo Database setup completed!
echo ===================================
echo.
echo Database is ready to use!
echo.
echo Connection details for your .env file:
echo   DB_HOST=localhost
echo   DB_PORT=5432
echo   DB_NAME=rental_management
echo   DB_USER=postgres
echo   DB_PASSWORD=postgres
echo.
echo To stop PostgreSQL:   docker stop postgres-rental
echo To start PostgreSQL:  docker start postgres-rental
echo To view logs:         docker logs postgres-rental
echo.
pause

