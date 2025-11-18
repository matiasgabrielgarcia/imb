const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '2fa_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('========================================');
    console.log('Running migration 004: Opportunities table');
    console.log('========================================');
    console.log(`Database: ${process.env.DB_NAME || '2fa_auth'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || 5432}`);
    console.log(`User: ${process.env.DB_USER || 'postgres'}`);
    console.log('');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '004_opportunities.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute migration
    await client.query(sql);

    console.log('✓ Migration 004 completed successfully!');
    console.log('');
    console.log('Table "opportunities" created with all indexes and triggers.');
    
  } catch (error) {
    console.error('✗ Migration 004 failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

