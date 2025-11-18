# WhatsApp Messages Database Migration Guide

This guide explains how to migrate WhatsApp messages from JSON files to PostgreSQL database.

## Overview

The WhatsApp webhook service has been upgraded to store messages in a PostgreSQL database instead of individual JSON files. This provides:

- ✅ Better performance for large numbers of messages
- ✅ Easy querying and filtering
- ✅ Data integrity with foreign keys and constraints
- ✅ Scalability for production use
- ✅ Backup and restore capabilities
- ✅ Concurrent access support

## Migration Steps

### 1. Prerequisites

Ensure you have:
- PostgreSQL database running
- Database credentials configured in `.env` file
- Node.js and npm installed

### 2. Environment Configuration

Create or update your `.env` file in the `wapp` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=2fa_auth
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3005
VERIFY_TOKEN=my_secure_verify_token_123
MESSAGES_DIR=./messages
```

### 3. Run the Migration

Execute the migration script to:
1. Create the `whatsapp_messages` table
2. Import all existing JSON files into the database

```bash
cd wapp
node run-messages-migration.js
```

The script will:
- Create the database table with proper indexes
- Import all JSON files from the `./messages` directory
- Skip duplicates (based on `message_id`)
- Display a summary of imported messages by category
- Verify the data integrity

### 4. Expected Output

```
================================================
WhatsApp Messages Database Migration
================================================

Step 1: Creating whatsapp_messages table...
✓ Table created successfully

Step 2: Importing existing JSON messages...
Found 11 message files to import...

✓ Imported: message_1731024000001.json
✓ Imported: message_1731024000002.json
...

================================================
Migration Summary:
================================================
Total files processed: 11
Successfully imported: 11
Skipped (duplicates): 0
Errors: 0

Step 3: Verifying imported data...

Messages by category:
  SELLER: 3
  TENANT: 4
  BUYER: 2
  LANDLORD: 1
  UNCATEGORIZED: 1

Total messages in database: 11

================================================
Migration completed successfully!
================================================
```

## Database Schema

The `whatsapp_messages` table structure:

```sql
CREATE TABLE whatsapp_messages (
  id SERIAL PRIMARY KEY,
  message_from VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  datetime TIMESTAMP NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  message_id VARCHAR(255) UNIQUE,
  category VARCHAR(50) DEFAULT 'UNCATEGORIZED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexes

The following indexes are created for optimal performance:
- `idx_whatsapp_messages_datetime` - Fast sorting by date
- `idx_whatsapp_messages_category` - Fast filtering by category
- `idx_whatsapp_messages_from` - Fast lookup by sender
- `idx_whatsapp_messages_message_id` - Unique constraint for WhatsApp message IDs

## Changes to the Application

### Updated Functions

1. **`saveMessage(messageData)`** - Now saves to database with filesystem fallback
2. **`GET /messages`** - Reads from database instead of JSON files
3. **`GET /notifications`** - Reads from database instead of JSON files

### Backward Compatibility

The application includes a fallback mechanism. If the database save fails, it will automatically save to the filesystem as a JSON file, ensuring no messages are lost.

## Testing the Migration

### 1. Start the Server

```bash
npm start
```

### 2. Test Message Creation

```bash
curl -X POST http://localhost:3005/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "messageFrom": "+1234567890",
    "message": "Test message after migration"
  }'
```

### 3. Verify Messages Endpoint

```bash
curl http://localhost:3005/messages
```

### 4. Verify Notifications Endpoint

```bash
curl http://localhost:3005/notifications
```

## Rollback (If Needed)

If you need to rollback to JSON files:

1. Stop the server
2. The old JSON files are still in the `./messages` directory
3. Revert the `server.js` file to use filesystem functions
4. Restart the server

## Post-Migration Cleanup

After confirming everything works correctly, you can optionally:

1. **Keep JSON files as backup:**
   ```bash
   # Archive the JSON files
   mkdir messages_backup
   mv messages/*.json messages_backup/
   ```

2. **Or delete JSON files:**
   ```bash
   # Delete the JSON files (only after verifying database has all data)
   rm messages/*.json
   ```

## Troubleshooting

### Database Connection Issues

If you see "Failed to connect to database" errors:

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure the database exists: `CREATE DATABASE 2fa_auth;`
4. Test connection: `node test-db-connection.js`

### Migration Fails

If the migration script fails:

1. Check the error message
2. Verify database permissions
3. Ensure the database user has CREATE TABLE privileges
4. Check if the table already exists

### Missing Messages

If some messages are missing after migration:

1. Check the migration summary output
2. Look for error messages during import
3. Verify JSON files are valid JSON format
4. Re-run the migration (duplicates will be skipped automatically)

## Monitoring

### Query Messages by Category

```sql
SELECT category, COUNT(*) as total 
FROM whatsapp_messages 
GROUP BY category;
```

### Recent Messages

```sql
SELECT * FROM whatsapp_messages 
ORDER BY datetime DESC 
LIMIT 10;
```

### Messages by Date Range

```sql
SELECT * FROM whatsapp_messages 
WHERE datetime BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY datetime DESC;
```

## Support

For issues or questions:
1. Check the server logs
2. Review the migration output
3. Verify database connection
4. Check PostgreSQL logs

## Next Steps

After successful migration:
- Monitor database performance
- Set up regular database backups
- Consider adding indexes for specific queries
- Implement data retention policies if needed


