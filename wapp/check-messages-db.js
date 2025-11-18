const { Pool } = require('pg');

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

async function checkDatabase() {
  console.log('================================================');
  console.log('WhatsApp Messages Database Status');
  console.log('================================================\n');

  try {
    // Test connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully\n');

    // Check if table exists
    console.log('Checking if whatsapp_messages table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'whatsapp_messages'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('✗ Table does not exist');
      console.log('\nPlease run the migration first:');
      console.log('  node run-messages-migration.js\n');
      process.exit(1);
    }
    console.log('✓ Table exists\n');

    // Get total count
    console.log('Fetching message statistics...');
    const countResult = await pool.query('SELECT COUNT(*) as total FROM whatsapp_messages');
    const total = parseInt(countResult.rows[0].total);
    console.log(`\nTotal messages: ${total}`);

    if (total === 0) {
      console.log('\n⚠ No messages found in database');
      console.log('\nIf you have JSON files to import, run:');
      console.log('  node run-messages-migration.js\n');
      process.exit(0);
    }

    // Get messages by category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM whatsapp_messages 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\nMessages by category:');
    categoryResult.rows.forEach(row => {
      console.log(`  ${row.category.padEnd(15)}: ${row.count}`);
    });

    // Get date range
    const dateResult = await pool.query(`
      SELECT 
        MIN(datetime) as oldest,
        MAX(datetime) as newest
      FROM whatsapp_messages
    `);

    console.log('\nDate range:');
    console.log(`  Oldest: ${new Date(dateResult.rows[0].oldest).toLocaleString()}`);
    console.log(`  Newest: ${new Date(dateResult.rows[0].newest).toLocaleString()}`);

    // Get recent messages
    const recentResult = await pool.query(`
      SELECT 
        message_from,
        LEFT(message, 50) as message,
        datetime,
        category
      FROM whatsapp_messages 
      ORDER BY datetime DESC 
      LIMIT 5
    `);

    console.log('\nRecent messages (last 5):');
    recentResult.rows.forEach((row, index) => {
      console.log(`\n  ${index + 1}. From: ${row.message_from}`);
      console.log(`     Category: ${row.category}`);
      console.log(`     Date: ${new Date(row.datetime).toLocaleString()}`);
      console.log(`     Message: ${row.message}${row.message.length === 50 ? '...' : ''}`);
    });

    // Get message types
    const typeResult = await pool.query(`
      SELECT message_type, COUNT(*) as count 
      FROM whatsapp_messages 
      GROUP BY message_type 
      ORDER BY count DESC
    `);

    console.log('\nMessages by type:');
    typeResult.rows.forEach(row => {
      console.log(`  ${row.message_type.padEnd(15)}: ${row.count}`);
    });

    console.log('\n================================================');
    console.log('Database check completed successfully!');
    console.log('================================================\n');

  } catch (error) {
    console.error('\n✗ Error checking database:', error.message);
    console.error('\nPlease verify:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database credentials in .env are correct');
    console.error('  3. Database exists and is accessible');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabase();


