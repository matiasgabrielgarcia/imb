const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read local database config from env-local.txt
let localDbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'rental_management',
  user: 'postgres',
  password: 'imb2025'
};

try {
  const envLocalPath = path.join(__dirname, 'env-local.txt');
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    const lines = envLocal.split('\n');
    lines.forEach(line => {
      if (line.trim() && !line.trim().startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (key.trim() === 'DB_HOST') localDbConfig.host = value;
          if (key.trim() === 'DB_PORT') localDbConfig.port = parseInt(value);
          if (key.trim() === 'DB_NAME') localDbConfig.database = value;
          if (key.trim() === 'DB_USER') localDbConfig.user = value;
          if (key.trim() === 'DB_PASSWORD') localDbConfig.password = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️  Could not read env-local.txt, using defaults');
}

// Local database connection
const localPool = new Pool({
  host: localDbConfig.host,
  port: localDbConfig.port,
  database: localDbConfig.database,
  user: localDbConfig.user,
  password: localDbConfig.password,
  ssl: false
});

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Tables in migration order (respecting foreign keys)
const tables = [
  'users',
  'properties',
  'sales',
  'rentals',
  'opportunities',  // Added opportunities table
  'rental_applications',
  'rental_payments',
  'rental_price_history',
  'login_attempts',
  'backup_codes',
  'property_images',
  'guarantors',
  'maintenance_requests',
  'inflation_adjustments',
  'contract_terminations',
  'contract_templates'
];

async function migrateTable(tableName) {
  try {
    console.log(`\n📦 Migrating table: ${tableName}...`);
    
    // Get all data from local database
    const localResult = await localPool.query(`SELECT * FROM ${tableName} ORDER BY id`);
    const rows = localResult.rows;
    
    if (rows.length === 0) {
      console.log(`   ⏭️  No data in ${tableName}, skipping...`);
      return { table: tableName, count: 0, errors: [] };
    }
    
    console.log(`   📊 Found ${rows.length} rows`);
    
    // Insert into Supabase in batches
    const batchSize = 100;
    let inserted = 0;
    const errors = [];
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      // Remove id from data to let Supabase auto-generate, or keep it if needed
      // For now, we'll try to preserve IDs
      const dataToInsert = batch.map(row => {
        const { id, ...rest } = row;
        return { id, ...rest };
      });
      
      const { data, error } = await supabase
        .from(tableName)
        .upsert(dataToInsert, { onConflict: 'id' });
      
      if (error) {
        console.error(`   ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        errors.push({ batch: i / batchSize + 1, error: error.message });
      } else {
        inserted += batch.length;
        process.stdout.write(`   ✅ Inserted ${inserted}/${rows.length} rows...\r`);
      }
    }
    
    console.log(`\n   ✅ Completed: ${inserted}/${rows.length} rows migrated`);
    
    return { table: tableName, count: inserted, errors };
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error.message);
    return { table: tableName, count: 0, errors: [error.message] };
  }
}

async function main() {
  console.log('🚀 Starting migration from local PostgreSQL to Supabase...\n');
  console.log('Local DB:', `${localDbConfig.host}:${localDbConfig.port}/${localDbConfig.database}`);
  console.log('Supabase:', supabaseUrl);
  console.log('\n⚠️  This will UPSERT data (insert or update if exists)');
  console.log('⚠️  Make sure your local PostgreSQL is running!\n');
  
  // Test connections
  try {
    await localPool.query('SELECT 1');
    console.log('✅ Local database connection: OK');
  } catch (error) {
    console.error('❌ Local database connection failed:', error.message);
    process.exit(1);
  }
  
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && !error.message.includes('permission')) {
      throw error;
    }
    console.log('✅ Supabase connection: OK\n');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
  
  // Migrate each table
  const results = [];
  for (const table of tables) {
    const result = await migrateTable(table);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  
  let totalMigrated = 0;
  let totalErrors = 0;
  
  results.forEach(result => {
    const status = result.errors.length > 0 ? '⚠️' : '✅';
    console.log(`${status} ${result.table.padEnd(30)} ${result.count.toString().padStart(5)} rows`);
    totalMigrated += result.count;
    totalErrors += result.errors.length;
    
    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        console.log(`   ⚠️  Error: ${err.error || err}`);
      });
    }
  });
  
  console.log('='.repeat(60));
  console.log(`Total rows migrated: ${totalMigrated}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log('='.repeat(60));
  
  await localPool.end();
  console.log('\n✅ Migration complete!');
}

main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});

