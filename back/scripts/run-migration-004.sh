#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Default values if not set in .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-2fa_auth}
DB_USER=${DB_USER:-postgres}

echo "Running migration 004: Opportunities table"
echo "=========================================="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo ""

# Run the migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../src/database/migrations/004_opportunities.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Migration 004 completed successfully!"
else
    echo ""
    echo "✗ Migration 004 failed!"
    exit 1
fi

