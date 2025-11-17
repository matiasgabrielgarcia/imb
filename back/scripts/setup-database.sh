#!/bin/bash

# Database Setup Script for Linux/Mac
# This script creates the database and applies all schemas and seed data

set -e

# Database connection parameters
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_NAME="rental_management"
ADMIN_DB="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}\n=== Rental Management Database Setup ===${NC}\n"

# Function to execute SQL file
execute_sql_file() {
    local file_path=$1
    local database=$2
    local description=$3
    
    echo -e "${YELLOW}Running: $description${NC}"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}Error: File not found: $file_path${NC}"
        exit 1
    fi
    
    if command -v psql &> /dev/null; then
        PGPASSWORD=${DB_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $database -f "$file_path"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $description completed${NC}"
        else
            echo -e "${RED}Error executing $description${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Error: psql command not found${NC}"
        exit 1
    fi
}

# Check if psql is available
echo -e "${YELLOW}Checking for PostgreSQL client...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found${NC}\n"
    echo -e "${YELLOW}Please install PostgreSQL client tools${NC}"
    echo -e "${YELLOW}Then run this script again.${NC}\n"
    echo -e "${CYAN}Alternatively, you can run the following SQL files manually:${NC}"
    echo -e "${GRAY}  1. Create database 'rental_management'${NC}"
    echo -e "${GRAY}  2. src/database/schema.sql${NC}"
    echo -e "${GRAY}  3. src/database/rental_management_schema.sql${NC}"
    echo -e "${GRAY}  4. src/database/migrations/003_property_images.sql${NC}"
    echo -e "${GRAY}  5. scripts/seed_data.sql${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL client found${NC}\n"

# Change to the back directory
cd "$(dirname "$0")/.."

# Step 1: Create the database
echo -e "${YELLOW}Step 1: Creating database '$DB_NAME'...${NC}"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=${DB_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -t -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -c 1 || echo 0)

if [ "$DB_EXISTS" -eq 1 ]; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (yes/no): " response
    
    if [ "$response" = "yes" ]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        PGPASSWORD=${DB_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "DROP DATABASE $DB_NAME;" 2>/dev/null || true
        PGPASSWORD=${DB_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "CREATE DATABASE $DB_NAME;"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database recreated${NC}"
        else
            echo -e "${RED}Error creating database${NC}"
            exit 1
        fi
    else
        echo -e "${CYAN}Using existing database${NC}"
    fi
else
    PGPASSWORD=${DB_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $ADMIN_DB -c "CREATE DATABASE $DB_NAME;"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created${NC}"
    else
        echo -e "${RED}Error creating database${NC}"
        exit 1
    fi
fi

echo ""

# Step 2: Apply main schema
echo -e "${YELLOW}Step 2: Applying main schema...${NC}"
execute_sql_file "src/database/schema.sql" "$DB_NAME" "Main Schema (users, properties, sales, rentals)"
echo ""

# Step 3: Apply rental management schema
echo -e "${YELLOW}Step 3: Applying rental management schema...${NC}"
execute_sql_file "src/database/rental_management_schema.sql" "$DB_NAME" "Rental Management Schema"
echo ""

# Step 4: Apply property images migration
echo -e "${YELLOW}Step 4: Applying property images migration...${NC}"
execute_sql_file "src/database/migrations/003_property_images.sql" "$DB_NAME" "Property Images Migration"
echo ""

# Step 5: Load seed data
echo -e "${YELLOW}Step 5: Loading seed data...${NC}"
read -p "Do you want to load sample seed data? (yes/no): " response

if [ "$response" = "yes" ]; then
    execute_sql_file "scripts/seed_data.sql" "$DB_NAME" "Seed Data"
    echo ""
fi

echo ""
echo -e "${CYAN}==================================${NC}"
echo -e "${GREEN}✓ Database setup completed!${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""
echo -e "${CYAN}Database Name: $DB_NAME${NC}"
echo -e "${CYAN}Host: $DB_HOST${NC}"
echo -e "${CYAN}Port: $DB_PORT${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${GRAY}  1. Update back/src/database/connection.ts with the correct database name${NC}"
echo -e "${GRAY}  2. Create a .env file with your database credentials${NC}"
echo -e "${GRAY}  3. Start your backend server${NC}"
echo ""

