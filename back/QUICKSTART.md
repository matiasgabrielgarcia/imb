# 🚀 Quick Start Guide - Database Setup

This guide will help you create and configure the database for the Rental Management System.

## Prerequisites

✅ PostgreSQL installed and running  
✅ Basic knowledge of terminal/command line

## 📋 Steps to Set Up

### Step 1: Choose Your Setup Method

Pick the method that works best for you:

#### Option A: Automated Setup (Easiest) ⭐

**Windows - PowerShell:**
```powershell
cd back\scripts
.\setup-database.ps1
```

**Windows - Command Prompt (if PowerShell doesn't work):**
```cmd
cd back\scripts
setup-database.bat
```

**Linux/Mac - Bash:**
```bash
cd back/scripts
chmod +x setup-database.sh
./setup-database.sh
```

The script will:
- ✅ Create the `rental_management` database
- ✅ Create all tables and indexes
- ✅ Prompt you to load sample data
- ✅ Show success/error messages

#### Option B: Manual SQL Execution

1. **Open your PostgreSQL client** (psql, pgAdmin, DBeaver, etc.)

2. **Create the database:**
```sql
CREATE DATABASE rental_management;
```

3. **Connect to the database and run:**
```bash
cd back/scripts
psql -U postgres -d rental_management -f init-database.sql
```

4. **(Optional) Load sample data:**
```bash
psql -U postgres -d rental_management -f seed_data.sql
```

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**

**Windows:**
```cmd
cd back
copy env.example .env
```

**Linux/Mac:**
```bash
cd back
cp env.example .env
```

2. **Edit `.env` file** with your database credentials:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_management
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

⚠️ **Important:** Change `your_actual_password` and `your_super_secret_jwt_key_here` to your actual values!

### Step 3: Verify the Setup

**Test the database connection:**

```bash
psql -U postgres -d rental_management -c "\dt"
```

You should see all the created tables:
- users
- properties
- rentals
- rental_payments
- property_images
- ... and more

### Step 4: Start Your Backend Server

```bash
cd back
npm install
npm run dev
```

The server should start without database connection errors.

## 🔍 Verification Queries

Run these to verify everything is working:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If you loaded seed data, check sample properties
SELECT id, numero, direccion, cliente FROM properties;

-- Check sample rentals
SELECT contract_number, tenant_name, monthly_rent, status FROM rentals;
```

## 🐛 Troubleshooting

### "psql: command not found"

**Windows:**
1. Find your PostgreSQL installation: `C:\Program Files\PostgreSQL\16\bin`
2. Add to PATH environment variable
3. Restart your terminal

**Linux:**
```bash
sudo apt-get install postgresql-client
```

**Mac:**
```bash
brew install postgresql
```

### "Database already exists"

If you want to start fresh:

```sql
DROP DATABASE rental_management;
CREATE DATABASE rental_management;
```

Then run the setup script again.

### "Connection refused" or "Could not connect"

1. **Check PostgreSQL is running:**

**Windows:**
- Open Services → Look for "postgresql-x64-16"
- Start it if stopped

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

**Mac:**
```bash
brew services start postgresql
```

2. **Verify connection settings:**
```bash
psql -U postgres -c "SELECT version();"
```

### "Permission denied" (Linux/Mac)

Make scripts executable:
```bash
chmod +x back/scripts/setup-database.sh
chmod +x back/scripts/run-migration-003.sh
```

### "Authentication failed for user postgres"

Your PostgreSQL password might be different. Update it in:
- The script (temporarily)
- Or set the `PGPASSWORD` environment variable
- Or use `.pgpass` file

## 📊 Database Overview

Your database now includes:

### Core Tables
- **users** - User authentication & 2FA
- **properties** - Property listings
- **sales** - Property sales records
- **rentals** - Rental contracts

### Rental Management
- **rental_applications** - Tenant applications
- **rental_payments** - Payment tracking
- **maintenance_requests** - Maintenance tickets
- **guarantors** - Guarantor information
- **inflation_adjustments** - Rent adjustments

### Media
- **property_images** - Property photos with thumbnails

## 📚 What's Included in Seed Data?

If you loaded the seed data (`seed_data.sql`), you'll have:
- 3 sample properties
- 2 sample sales
- 3 sample rental contracts (different statuses)
- Rental price history

Perfect for testing and development!

## 🎯 Next Steps

1. ✅ Database is set up
2. ✅ Environment configured
3. ✅ Server running

Now you can:
- Test API endpoints
- Start frontend development
- Add your own data
- Explore the database schema

## 📖 Additional Resources

- **Full Documentation:** See `back/scripts/README.md`
- **Schema Details:** Check `back/src/database/*.sql` files
- **API Routes:** Look in `back/src/routes/`

## 💡 Tips

- Use **pgAdmin** or **DBeaver** for a visual database browser
- Keep `.env` file secure and never commit it to git
- Backup your database regularly
- Use the seed data for testing, not production

## ❓ Still Having Issues?

1. Check all error messages carefully
2. Verify PostgreSQL version (12+ recommended)
3. Ensure ports aren't blocked by firewall
4. Try connecting with a GUI tool first (pgAdmin)
5. Check PostgreSQL logs for detailed errors

---

**Database Name:** `rental_management`  
**Default Port:** `5432`  
**Default User:** `postgres`  

🎉 **You're all set! Happy coding!**

