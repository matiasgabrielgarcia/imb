# Database Setup Script for Windows
# This script creates the database and applies all schemas and seed data

$ErrorActionPreference = "Stop"

# Database connection parameters
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_NAME = "rental_management"
$ADMIN_DB = "postgres"

Write-Host "`n=== Rental Management Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Function to execute SQL file
function Execute-SqlFile {
    param(
        [string]$FilePath,
        [string]$Database = $DB_NAME,
        [string]$Description
    )
    
    Write-Host "Running: $Description" -ForegroundColor Yellow
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "Error: File not found: $FilePath" -ForegroundColor Red
        exit 1
    }
    
    # Try using psql command
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlPath) {
        Write-Host "Using psql command..." -ForegroundColor Gray
        $env:PGPASSWORD = "postgres"  # Set password if needed
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $Database -f $FilePath
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error executing $Description" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ $Description completed" -ForegroundColor Green
    } else {
        Write-Host "Error: psql command not found" -ForegroundColor Red
        Write-Host "Please install PostgreSQL client tools or run the SQL files manually" -ForegroundColor Yellow
        exit 1
    }
}

# Check if psql is available
Write-Host "Checking for PostgreSQL client..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "Error: psql command not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL or ensure psql is in your PATH" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run the following SQL files manually:" -ForegroundColor Cyan
    Write-Host "  1. Create database 'rental_management'" -ForegroundColor Gray
    Write-Host "  2. src\database\schema.sql" -ForegroundColor Gray
    Write-Host "  3. src\database\rental_management_schema.sql" -ForegroundColor Gray
    Write-Host "  4. src\database\migrations\003_property_images.sql" -ForegroundColor Gray
    Write-Host "  5. scripts\seed_data.sql" -ForegroundColor Gray
    exit 1
}

Write-Host "✓ PostgreSQL client found" -ForegroundColor Green
Write-Host ""

# Step 1: Create the database
Write-Host "Step 1: Creating database '$DB_NAME'..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"  # Set password if needed

# Check if database exists
$checkDbQuery = "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'"
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -t -c $checkDbQuery 2>$null

if ($dbExists -match "1") {
    Write-Host "Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "DROP DATABASE $DB_NAME;" 2>$null
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "CREATE DATABASE $DB_NAME;"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error creating database" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ Database recreated" -ForegroundColor Green
    } else {
        Write-Host "Using existing database" -ForegroundColor Cyan
    }
} else {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "CREATE DATABASE $DB_NAME;"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error creating database" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Database created" -ForegroundColor Green
}
Write-Host ""

# Step 2: Apply main schema
Write-Host "Step 2: Applying main schema..." -ForegroundColor Yellow
Execute-SqlFile -FilePath "src\database\schema.sql" -Description "Main Schema (users, properties, sales, rentals)"
Write-Host ""

# Step 3: Apply rental management schema
Write-Host "Step 3: Applying rental management schema..." -ForegroundColor Yellow
Execute-SqlFile -FilePath "src\database\rental_management_schema.sql" -Description "Rental Management Schema"
Write-Host ""

# Step 4: Apply property images migration
Write-Host "Step 4: Applying property images migration..." -ForegroundColor Yellow
Execute-SqlFile -FilePath "src\database\migrations\003_property_images.sql" -Description "Property Images Migration"
Write-Host ""

# Step 5: Load seed data
Write-Host "Step 5: Loading seed data..." -ForegroundColor Yellow
$response = Read-Host "Do you want to load sample seed data? (yes/no)"

if ($response -eq "yes") {
    Execute-SqlFile -FilePath "scripts\seed_data.sql" -Description "Seed Data"
    Write-Host ""
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Database setup completed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Name: $DB_NAME" -ForegroundColor Cyan
Write-Host "Host: $DB_HOST" -ForegroundColor Cyan
Write-Host "Port: $DB_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update back/src/database/connection.ts with the correct database name" -ForegroundColor Gray
Write-Host "  2. Create a .env file with your database credentials" -ForegroundColor Gray
Write-Host "  3. Start your backend server" -ForegroundColor Gray
Write-Host ""

