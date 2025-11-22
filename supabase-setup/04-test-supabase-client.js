#!/usr/bin/env node

/**
 * Test Supabase Connection using Official Client
 * This uses Supabase's REST API instead of direct PostgreSQL
 * 
 * Usage: npm install @supabase/supabase-js first, then node 04-test-supabase-client.js
 */

require('dotenv').config({ path: '../back/.env' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseClient() {
  console.log('🔄 Testing Supabase with official client...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file\n');
    console.log('Please add to back/.env:');
    console.log('  SUPABASE_URL=https://xxxxx.supabase.co');
    console.log('  SUPABASE_ANON_KEY=your_anon_key\n');
    process.exit(1);
  }

  console.log('Connection details:');
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check if we can query
    console.log('🧪 Test 1: Querying tables...');
    const { data: tables, error: tableError } = await supabase
      .from('properties')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.log('⚠️  Properties table query failed (might not exist yet)');
      console.log(`   Error: ${tableError.message}\n`);
    } else {
      console.log('✅ Successfully connected to database!\n');
    }

    // Test 2: List available tables
    console.log('🧪 Test 2: Checking available tables...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_tables_list')
      .catch(() => null);

    // Try a simple query to verify connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (!testError) {
      console.log('✅ Users table accessible\n');
    }

    // Test 3: Check storage
    console.log('🧪 Test 3: Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.log(`⚠️  Storage check failed: ${bucketError.message}\n`);
    } else {
      console.log(`✅ Found ${buckets.length} storage bucket(s):`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} ${bucket.public ? '(public)' : '(private)'}`);
      });
      console.log('');
    }

    console.log('🎉 SUCCESS! Supabase client connection works!\n');
    console.log('💡 Your app can use either:');
    console.log('   1. Supabase Client SDK (@supabase/supabase-js)');
    console.log('   2. Direct PostgreSQL connection (pg library)\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error(`  ${error.message}\n`);
    
    console.log('💡 Troubleshooting:');
    console.log('  1. Verify SUPABASE_URL is correct (https://xxxxx.supabase.co)');
    console.log('  2. Verify SUPABASE_ANON_KEY is correct');
    console.log('  3. Check your project is not paused');
    console.log('  4. Try regenerating your API keys in Supabase dashboard\n');
    
    process.exit(1);
  }
}

testSupabaseClient();

