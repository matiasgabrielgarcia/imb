#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * Run this to verify your connection strings are correct
 * 
 * Usage: node 03-test-connection.js
 */

require('dotenv').config({ path: '../back/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  console.log('Connection details:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  SSL: Enabled\n`);

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!\n');

    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log(`  ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Get list of tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables found in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    console.log(`\nTotal: ${tablesResult.rows.length} tables\n`);

    // Test specific tables exist
    const requiredTables = [
      'users',
      'properties',
      'property_images',
      'sales',
      'rentals',
      'opportunities',
      'whatsapp_messages'
    ];

    console.log('🔍 Checking required tables:');
    const tableNames = tablesResult.rows.map(r => r.table_name);
    let allTablesExist = true;

    requiredTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        console.log(`  ✅ ${tableName}`);
      } else {
        console.log(`  ❌ ${tableName} - MISSING!`);
        allTablesExist = false;
      }
    });

    console.log('\n');

    if (allTablesExist) {
      console.log('🎉 SUCCESS! All required tables exist.');
      console.log('✅ Your Supabase database is ready to use!\n');
    } else {
      console.log('⚠️  WARNING: Some required tables are missing.');
      console.log('Please run the SQL migration: 01-complete-schema.sql\n');
    }

    // Get row counts
    console.log('📊 Current data:');
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`  ${table}: ${countResult.rows[0].count} rows`);
        } catch (err) {
          console.log(`  ${table}: Error reading count`);
        }
      }
    }

    client.release();
    await pool.end();
    
    console.log('\n✅ Connection test complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error(`  ${error.message}\n`);
    
    console.log('💡 Troubleshooting:');
    console.log('  1. Check your .env file has correct values');
    console.log('  2. Verify your database password is correct');
    console.log('  3. Ensure SSL is enabled in Supabase');
    console.log('  4. Check your network connection\n');
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

