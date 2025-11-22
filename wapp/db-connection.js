const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Detect if using Supabase (not local)
const isLocal = process.env.LOCAL === 'true' || process.env.DB_HOST === 'localhost';
const isSupabase = !isLocal && (process.env.DB_HOST?.includes('supabase.co') || process.env.SUPABASE_URL);

// Initialize Supabase client if using Supabase
let supabaseClient = null;
if (isSupabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
  supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );
}

// Initialize PostgreSQL pool for local connections
let pool = null;
if (isLocal) {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'rental_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false
  });
}

// Execute SELECT query via Supabase REST API
async function executeSelectQuery(sql, params) {
  // Normalize SQL - remove extra whitespace and newlines
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();
  
  // Match FROM table_name - need to be careful not to match "as" from column aliases
  // Look for FROM followed by word characters (table name), possibly with schema prefix
  let fromMatch = normalizedSql.match(/FROM\s+(?:\w+\.)?(\w+)/i);
  if (!fromMatch) {
    throw new Error('Could not parse table name from SELECT query');
  }
  let tableName = fromMatch[1];
  
  // Make sure we didn't accidentally match "as" keyword
  if (tableName.toLowerCase() === 'as') {
    // Try again with a more specific pattern that looks for table name before WHERE/ORDER/LIMIT
    const betterMatch = normalizedSql.match(/FROM\s+(\w+)(?:\s+WHERE|\s+ORDER|\s+LIMIT|$)/i);
    if (betterMatch) {
      tableName = betterMatch[1];
    } else {
      throw new Error('Could not parse table name from SELECT query');
    }
  }
  
  let query = supabaseClient.from(tableName).select('*');
  
  // Parse WHERE conditions
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
  if (whereMatch && params) {
    const whereClause = whereMatch[1];
    // Handle simple WHERE column = $1
    const idMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
    if (idMatch) {
      const column = idMatch[1];
      const paramIndex = parseInt(idMatch[2]) - 1;
      query = query.eq(column, params[paramIndex]);
    }
    // Handle WHERE 1=1 with AND conditions
    const andMatches = whereClause.matchAll(/(\w+)\s*=\s*\$(\d+)/gi);
    for (const match of andMatches) {
      const column = match[1];
      const paramIndex = parseInt(match[2]) - 1;
      query = query.eq(column, params[paramIndex]);
    }
  }
  
  // Parse ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)\s+(ASC|DESC)?/i);
  if (orderMatch) {
    const column = orderMatch[1];
    const direction = (orderMatch[2] || 'ASC').toLowerCase() === 'asc' ? 'asc' : 'desc';
    query = query.order(column, { ascending: direction === 'asc' });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return { rows: data || [], rowCount: data?.length || 0 };
}

// Execute INSERT query via Supabase REST API
async function executeInsertQuery(sql, params) {
  // Match INSERT with optional ON CONFLICT
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)(?:\s+ON\s+CONFLICT[^;]*)?/i);
  if (!insertMatch) {
    throw new Error('Could not parse INSERT query');
  }
  
  const tableName = insertMatch[1];
  const columns = insertMatch[2].split(',').map(c => c.trim());
  
  const values = {};
  if (params) {
    columns.forEach((col, index) => {
      if (index < params.length) {
        values[col] = params[index];
      }
    });
  }
  
  // Handle ON CONFLICT DO NOTHING - use upsert with ignoreDuplicates
  const hasOnConflict = sql.toUpperCase().includes('ON CONFLICT');
  let query = supabaseClient.from(tableName);
  
  if (hasOnConflict) {
    // For ON CONFLICT DO NOTHING, we can use upsert with onConflict
    // But Supabase upsert requires a unique constraint column
    // For now, try insert and ignore errors if duplicate
    const { data, error } = await query.insert(values).select();
    // If error is about duplicate, ignore it (DO NOTHING behavior)
    if (error && error.code === '23505') {
      // Duplicate key error - this is OK for ON CONFLICT DO NOTHING
      return { rows: [], rowCount: 0 };
    }
    if (error) throw error;
    return { rows: Array.isArray(data) ? data : [data], rowCount: data?.length || 1 };
  } else {
    const { data, error } = await query.insert(values).select();
    if (error) throw error;
    return { rows: Array.isArray(data) ? data : [data], rowCount: data?.length || 1 };
  }
}

// Execute UPDATE query via Supabase REST API
async function executeUpdateQuery(sql, params) {
  const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
  if (!updateMatch) {
    throw new Error('Could not parse UPDATE query');
  }
  
  const tableName = updateMatch[1];
  const setClause = updateMatch[2];
  const whereClause = updateMatch[3];
  
  const updates = {};
  const setParts = setClause.split(',').map(s => s.trim());
  setParts.forEach(part => {
    const [key, value] = part.split('=').map(s => s.trim());
    const cleanKey = key.trim();
    if (value.startsWith('$')) {
      const paramIndex = parseInt(value.substring(1)) - 1;
      if (params && params[paramIndex] !== undefined) {
        updates[cleanKey] = params[paramIndex];
      }
    } else if (value === 'NOW()' || value.includes('NOW()')) {
      updates[cleanKey] = new Date().toISOString();
    } else if (value.startsWith('COALESCE')) {
      // Handle COALESCE($1, column) - use the param value if not null
      const coalesceMatch = value.match(/COALESCE\(\$(\d+)/);
      if (coalesceMatch && params) {
        const paramIndex = parseInt(coalesceMatch[1]) - 1;
        if (params[paramIndex] !== undefined && params[paramIndex] !== null) {
          updates[cleanKey] = params[paramIndex];
        }
        // If param is null/undefined, don't include in updates (Supabase will keep existing value)
      }
    } else if (value.includes('array_append')) {
      // Handle array_append(messages, $1) - this is complex, would need to fetch, append, update
      // For now, skip this field and log a warning
      console.warn(`array_append not fully supported in Supabase mode for ${cleanKey}`);
    } else {
      const cleanValue = value.replace(/['"]/g, '');
      if (cleanValue && cleanValue !== 'NULL') {
        updates[cleanKey] = cleanValue;
      }
    }
  });
  
  let query = supabaseClient.from(tableName).update(updates);
  const whereIdMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
  if (whereIdMatch && params) {
    const column = whereIdMatch[1];
    const paramIndex = parseInt(whereIdMatch[2]) - 1;
    query = query.eq(column, params[paramIndex]);
  }
  
  const { data, error } = await query.select();
  if (error) throw error;
  
  return { rows: Array.isArray(data) ? data : [data], rowCount: data?.length || 0 };
}

// Execute DELETE query via Supabase REST API
async function executeDeleteQuery(sql, params) {
  const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
  if (!deleteMatch) {
    throw new Error('Could not parse DELETE query');
  }
  
  const tableName = deleteMatch[1];
  const whereClause = deleteMatch[2];
  
  let query = supabaseClient.from(tableName).delete();
  const whereIdMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
  if (whereIdMatch && params) {
    const column = whereIdMatch[1];
    const paramIndex = parseInt(whereIdMatch[2]) - 1;
    query = query.eq(column, params[paramIndex]);
  }
  
  const { data, error } = await query.select();
  if (error) throw error;
  
  return { rows: [], rowCount: 0 };
}

// Main query function - routes to Supabase or PostgreSQL based on environment
async function query(sql, params) {
  if (isSupabase && supabaseClient) {
    const sqlUpper = sql.trim().toUpperCase();
    
    if (sqlUpper.startsWith('SELECT')) {
      return executeSelectQuery(sql, params);
    } else if (sqlUpper.startsWith('INSERT')) {
      return executeInsertQuery(sql, params);
    } else if (sqlUpper.startsWith('UPDATE')) {
      return executeUpdateQuery(sql, params);
    } else if (sqlUpper.startsWith('DELETE')) {
      return executeDeleteQuery(sql, params);
    } else {
      throw new Error('Complex SQL queries not yet supported. Use simple SELECT/INSERT/UPDATE/DELETE.');
    }
  } else if (isLocal && pool) {
    return await pool.query(sql, params);
  } else {
    throw new Error('No database connection available');
  }
}

module.exports = { query, pool };

