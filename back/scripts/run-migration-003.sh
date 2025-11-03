#!/bin/bash

# Script to run the property_images migration
# Usage: ./scripts/run-migration-003.sh

echo "Running property_images migration..."

# Try to find psql command
if command -v psql &> /dev/null; then
    # PostgreSQL command found
    psql -U postgres -d rental_management -f src/database/migrations/003_property_images.sql
elif command -v docker &> /dev/null; then
    # Try Docker if psql not found
    echo "psql not found, trying Docker..."
    docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d rental_management < src/database/migrations/003_property_images.sql
else
    echo "❌ Neither psql nor Docker found."
    echo ""
    echo "Please run the migration manually:"
    echo "1. Open your database client"
    echo "2. Connect to 'rental_management' database"
    echo "3. Run the contents of: src/database/migrations/003_property_images.sql"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

