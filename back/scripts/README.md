# Database Setup Scripts

This directory contains scripts to set up and manage the Rental Management System database.

## Overview

The database setup consists of:
1. **Main Schema** - Users, properties, sales, and basic rental tables
2. **Rental Management Schema** - Applications, guarantors, payments, maintenance
3. **Property Images Migration** - Image storage for properties
4. **Seed Data** - Sample data for testing

## Quick Start

### Option 1: Automated Setup (Recommended)

#### On Windows (PowerShell):
```powershell
cd back/scripts
.\setup-database.ps1
```

#### On Linux/Mac (Bash):
```bash
cd back/scripts
chmod +x setup-database.sh
./setup-database.sh
```

### Option 2: Manual SQL Setup

If you prefer to run SQL directly or the automated scripts don't work:

1. **Create the database:**
```sql
CREATE DATABASE rental_management;
```

2. **Connect to the database and run:**
```bash
psql -U postgres -d rental_management -f init-database.sql
```

3. **Load seed data (optional):**
```bash
psql -U postgres -d rental_management -f seed_data.sql
```

### Option 3: Using GUI Tools (pgAdmin, DBeaver, etc.)

1. Create a new database named `rental_management`
2. Open and execute `init-database.sql`
3. Optionally execute `seed_data.sql`

## Files Description

| File | Purpose |
|------|---------|
| `setup-database.ps1` | PowerShell script for Windows - Creates DB and runs all migrations |
| `setup-database.sh` | Bash script for Linux/Mac - Creates DB and runs all migrations |
| `init-database.sql` | Complete SQL initialization - All tables and indexes |
| `seed_data.sql` | Sample data for testing |
| `run-migration-003.sh` | Runs only the property images migration |

## Database Configuration

After setting up the database, update your connection settings:

### 1. Update `back/src/database/connection.ts`:

Change the database name from `postgres` to `rental_management`:

```typescript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rental_management', // ← Update this
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  // ... other settings
});
```

### 2. Create a `.env` file in the `back` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_management
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Database Schema

### Core Tables
- **users** - User accounts with 2FA support
- **login_attempts** - Security tracking
- **backup_codes** - 2FA backup codes
- **properties** - Property listings
- **sales** - Property sales records
- **rentals** - Rental contracts
- **rental_price_history** - Track rent changes over time

### Rental Management Tables
- **rental_applications** - Tenant applications
- **guarantors** - Guarantor information
- **rental_payments** - Payment tracking
- **maintenance_requests** - Maintenance tickets
- **contract_templates** - Reusable contract templates
- **inflation_adjustments** - Rent adjustment history
- **contract_terminations** - Contract end details
- **property_images** - Property photos with thumbnails

## Troubleshooting

### "psql command not found"

**Windows:**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Add to PATH: `C:\Program Files\PostgreSQL\<version>\bin`
3. Restart PowerShell

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

**Mac:**
```bash
brew install postgresql
```

### "Database already exists"

The scripts will prompt you to drop and recreate. Alternatively, manually drop it:

```sql
DROP DATABASE rental_management;
CREATE DATABASE rental_management;
```

### Connection Errors

1. Ensure PostgreSQL is running:
   - Windows: Check Services for "postgresql-x64-XX"
   - Linux/Mac: `sudo systemctl status postgresql`

2. Verify credentials:
   - Default user: `postgres`
   - Check your password

3. Check PostgreSQL is listening:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

### Permission Errors

Make scripts executable on Linux/Mac:
```bash
chmod +x setup-database.sh
chmod +x run-migration-003.sh
```

## Next Steps

After database setup:

1. ✅ Verify connection in your application
2. ✅ Run your backend server: `npm run dev`
3. ✅ Test API endpoints
4. ✅ Check database with sample queries

## Sample Queries

Verify the setup:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count sample data
SELECT 'properties' as table_name, COUNT(*) FROM properties
UNION ALL
SELECT 'rentals', COUNT(*) FROM rentals
UNION ALL
SELECT 'rental_payments', COUNT(*) FROM rental_payments;

-- View sample properties
SELECT id, numero, direccion, cliente FROM properties;

-- View active rentals
SELECT r.contract_number, r.tenant_name, r.monthly_rent, p.direccion
FROM rentals r
JOIN properties p ON r.property_id = p.id
WHERE r.status = 'in_progress';
```

## Support

For issues or questions:
1. Check the error messages carefully
2. Verify PostgreSQL is running
3. Check connection credentials
4. Ensure database name is correct in connection.ts

---

**Database Name:** `rental_management`  
**Default User:** `postgres`  
**Default Port:** `5432`

