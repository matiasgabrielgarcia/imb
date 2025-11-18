# WhatsApp Messages - Quick Reference

## 🎯 Migration Complete!

Your WhatsApp messages are now stored in PostgreSQL database instead of JSON files.

## 📋 Quick Commands

### Check Database Status
```bash
cd wapp
node check-messages-db.js
```
Shows total messages, categories, recent messages, and statistics.

### Run Migration (First Time or Re-import)
```bash
cd wapp
node run-messages-migration.js
```
Creates table and imports JSON files to database.

### Start the Server
```bash
cd wapp
npm start
```
Server runs on http://localhost:3005

### Test the API
```bash
# Get all messages
curl http://localhost:3005/messages

# Get notifications (categorized)
curl http://localhost:3005/notifications

# Create test message
curl -X POST http://localhost:3005/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"messageFrom": "+1234567890", "message": "Test message"}'
```

## 📁 Files Created/Modified

### New Files:
- `migrations/001_create_whatsapp_messages.sql` - Database schema
- `run-messages-migration.js` - Migration script
- `check-messages-db.js` - Database status checker
- `MIGRATION_GUIDE.md` - Detailed migration instructions
- `MIGRATION_SUMMARY.md` - Migration results and summary
- `QUICK_REFERENCE.md` - This file

### Modified Files:
- `server.js` - Updated to use database
- `README.md` - Updated with database instructions

## 🗄️ Database Info

**Table:** `whatsapp_messages`

**Connection:** PostgreSQL
- Host: localhost (default)
- Port: 5432 (default)
- Database: 2fa_auth (default)
- Configure in `.env` file

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /messages` | GET | Get all messages from database |
| `GET /notifications` | GET | Get categorized messages with summary |
| `POST /webhook/test` | POST | Create test message (saves to DB) |
| `POST /webhook` | POST | WhatsApp webhook (saves to DB) |

## 📊 Current Status

✅ **Database Table:** Created  
✅ **Messages Imported:** 8 from JSON files  
✅ **API Endpoints:** All working with database  
✅ **Fallback:** Enabled (saves to JSON if DB fails)  
✅ **Tests:** All passed  

## 🎨 Message Categories

The system automatically categorizes messages:
- **BUYER** - People looking to buy properties
- **SELLER** - People wanting to sell properties
- **TENANT** - People looking to rent
- **LANDLORD** - Property owners offering rentals
- **UNCATEGORIZED** - Other messages

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check database connection
cd wapp
node test-db-connection.js
```

### Migration Issues
```bash
# Re-run migration (duplicates are skipped)
cd wapp
node run-messages-migration.js
```

### Check Server Logs
Look for error messages in the console where the server is running.

## 📖 Documentation

- **README.md** - Full documentation
- **MIGRATION_GUIDE.md** - Detailed migration steps
- **MIGRATION_SUMMARY.md** - Migration results

## 💾 Backup

### JSON Files
Original JSON files are still in `./messages/` directory.

### Database Backup
```bash
pg_dump -U postgres -d 2fa_auth -t whatsapp_messages > backup.sql
```

### Restore Database
```bash
psql -U postgres -d 2fa_auth < backup.sql
```

## 🚀 What's Different?

### Before (JSON Files):
- Messages saved as individual JSON files
- Manual file reading for queries
- Limited querying capabilities
- No indexes or optimization

### After (Database):
- Messages saved to PostgreSQL
- Fast indexed queries
- Advanced filtering and aggregation
- Scalable for thousands of messages
- ACID compliance and data integrity

## ✨ Key Features

1. **Automatic Categorization** - Messages are categorized by keywords
2. **Database Storage** - Fast, reliable PostgreSQL storage
3. **Fallback Mechanism** - Saves to JSON if database fails
4. **Age Indicators** - Notifications show if messages are old (>1 month)
5. **Indexed Queries** - Fast retrieval even with many messages
6. **Duplicate Prevention** - Unique constraint on message_id

## 📝 Environment Variables

Create `.env` in the `wapp` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=2fa_auth
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=3005
VERIFY_TOKEN=my_secure_verify_token_123
```

## 🎯 Next Steps

1. ✅ **Migration Complete** - Nothing required
2. 📦 **Optional:** Archive old JSON files
3. 🔄 **Optional:** Set up database backups
4. 📊 **Optional:** Add pagination to endpoints
5. 🔍 **Optional:** Add full-text search

---

**Last Updated:** November 18, 2025  
**Status:** ✅ Production Ready


