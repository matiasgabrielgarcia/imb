# 🔄 Switch Between Local and Supabase Database

This guide helps you quickly switch between your local PostgreSQL and Supabase cloud database.

---

## 🏠 **Switch to LOCAL Database**

### Backend:
```bash
# Copy local config
cp back/.env-local.txt back/.env

# Or manually update back/.env:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_management
DB_USER=postgres
DB_PASSWORD=postgres
```

### WhatsApp Service:
```bash
# Copy local config
cp wapp/.env-local.txt wapp/.env
```

### Requirements:
- ✅ PostgreSQL must be running locally
- ✅ Database `rental_management` must exist
- ✅ Run migrations if needed

### Start services:
```bash
npm run dev  # from back/ or wapp/ folders
```

---

## ☁️ **Switch to SUPABASE Database**

### Backend:
```bash
# Copy Supabase config
cp back/env-config.txt back/.env

# Or use values from supabase-setup/env-backend.txt
```

### WhatsApp Service:
```bash
# Update wapp/.env with Supabase connection:
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_NAME=postgres
```

### Requirements:
- ✅ Supabase project must be active
- ✅ Connection strings must be correct
- ✅ Internet connection required

### Start services:
```bash
npm run dev  # from back/ or wapp/ folders
```

---

## 🔍 **Quick Test**

After switching, test the connection:

### For Local:
```bash
psql -U postgres -d rental_management -c "SELECT version();"
```

### For Supabase:
```bash
cd supabase-setup
node 03-test-connection.js
```

---

## 📋 **Current Configuration Files**

- `back/.env` - **Active configuration** (currently in use)
- `back/.env-local.txt` - **Local DB backup** (original working setup)
- `back/env-config.txt` - **Supabase config** (cloud setup)
- `wapp/.env` - **Active WhatsApp service config**
- `wapp/.env-local.txt` - **Local WhatsApp backup**

---

## ⚠️ **Important Notes**

1. **Never commit `.env` files** to git (they're in `.gitignore`)
2. **Keep backups** of both configurations
3. **SSL is automatic**: Code detects Supabase and enables SSL automatically
4. **Connection pooling**: Use port 5432 for direct connection, 6543 for pooling

---

## 🆘 **Troubleshooting**

### "Connection refused" on localhost
- PostgreSQL service not running
- Run: `pg_ctl start` or check Docker container

### "Cannot connect to Supabase"
- Check internet connection
- Verify credentials in Supabase dashboard
- Run test script: `node supabase-setup/03-test-connection.js`

### "Wrong database/tables"
- Check DB_NAME matches your target
- Local: `rental_management`
- Supabase: `postgres`

---

**Current Status:** You have both configurations saved and can switch anytime! 🎉

