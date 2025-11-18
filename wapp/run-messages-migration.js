const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '2fa_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const MESSAGES_DIR = process.env.MESSAGES_DIR || './messages';
const MIGRATION_FILE = path.join(__dirname, 'migrations', '001_create_whatsapp_messages.sql');

async function runMigration() {
  console.log('================================================');
  console.log('WhatsApp Messages Database Migration');
  console.log('================================================\n');

  try {
    // Step 1: Create the table
    console.log('Step 1: Creating whatsapp_messages table...');
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
    await pool.query(migrationSQL);
    console.log('✓ Table created successfully\n');

    // Step 2: Import existing JSON files
    console.log('Step 2: Importing existing JSON messages...');
    
    if (!fs.existsSync(MESSAGES_DIR)) {
      console.log('⚠ Messages directory does not exist. Skipping import.');
      return;
    }

    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    if (files.length === 0) {
      console.log('⚠ No JSON files found to import.');
      console.log('\n================================================');
      console.log('Migration completed successfully!');
      console.log('================================================');
      return;
    }

    console.log(`Found ${files.length} message files to import...\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
      try {
        const filepath = path.join(MESSAGES_DIR, file);
        const content = fs.readFileSync(filepath, 'utf8');
        const messageData = JSON.parse(content);

        // Insert into database
        await pool.query(
          `INSERT INTO whatsapp_messages (
            message_from, message, datetime, message_type, message_id, category
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (message_id) DO NOTHING`,
          [
            messageData.messageFrom,
            messageData.message,
            messageData.datetime,
            messageData.messageType || 'text',
            messageData.messageId || null,
            messageData.category || 'UNCATEGORIZED'
          ]
        );

        imported++;
        console.log(`✓ Imported: ${file}`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          skipped++;
          console.log(`⊘ Skipped (duplicate): ${file}`);
        } else {
          errors++;
          console.error(`✗ Error importing ${file}:`, error.message);
        }
      }
    }

    console.log('\n================================================');
    console.log('Migration Summary:');
    console.log('================================================');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Errors: ${errors}`);

    // Step 3: Verify the data
    console.log('\nStep 3: Verifying imported data...');
    const result = await pool.query('SELECT COUNT(*), category FROM whatsapp_messages GROUP BY category');
    
    console.log('\nMessages by category:');
    result.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count}`);
    });

    const totalResult = await pool.query('SELECT COUNT(*) as total FROM whatsapp_messages');
    console.log(`\nTotal messages in database: ${totalResult.rows[0].total}`);

    console.log('\n================================================');
    console.log('Migration completed successfully!');
    console.log('================================================');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();


