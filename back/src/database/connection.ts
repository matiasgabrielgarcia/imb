import { Pool, PoolClient } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Detect if using Supabase
const isSupabase = process.env.DB_HOST?.includes('supabase.co') || process.env.SUPABASE_URL;

// Initialize Supabase client if using Supabase
let supabaseClient: SupabaseClient | null = null;
if (isSupabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
  supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY, // Use secret key for admin operations
    {
      auth: {
        persistSession: false
      }
    }
  );
}

// Initialize PostgreSQL pool for local connections
let pool: Pool | null = null;
if (!isSupabase) {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'rental_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Execute SQL via Supabase REST API using PostgREST
async function executeSupabaseSQL(sql: string, params?: any[]): Promise<any> {
  if (!supabaseClient || !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error('Supabase client not initialized');
  }

  // Parse SQL and convert to PostgREST calls
  const sqlUpper = sql.trim().toUpperCase();
  
  // Simple SELECT queries
  if (sqlUpper.startsWith('SELECT')) {
    return executeSelectQuery(sql, params);
  }
  
  // INSERT queries
  if (sqlUpper.startsWith('INSERT')) {
    return executeInsertQuery(sql, params);
  }
  
  // UPDATE queries
  if (sqlUpper.startsWith('UPDATE')) {
    return executeUpdateQuery(sql, params);
  }
  
  // DELETE queries
  if (sqlUpper.startsWith('DELETE')) {
    return executeDeleteQuery(sql, params);
  }
  
  // For complex queries (JOINs, etc.), use REST API with raw SQL execution
  // This requires a PostgreSQL function in Supabase - for now, throw error
  throw new Error('Complex SQL queries not yet supported. Use simple SELECT/INSERT/UPDATE/DELETE or create RPC functions in Supabase.');
}

// Execute SELECT query via Supabase REST API
async function executeSelectQuery(sql: string, params?: any[]): Promise<any> {
  // Parse table name from SELECT * FROM table_name WHERE...
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('Could not parse table name from SELECT query');
  }
  const tableName = tableMatch[1];
  
  // Parse WHERE conditions
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
  let query = supabaseClient!.from(tableName).select('*');
  
  if (whereMatch && params) {
    // Simple WHERE id = $1 support
    const whereClause = whereMatch[1];
    const idMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/i);
    if (idMatch) {
      const column = idMatch[1];
      const paramIndex = parseInt(idMatch[2]) - 1;
      query = query.eq(column, params[paramIndex]);
    }
  }
  
  // Parse ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)\s+(ASC|DESC)?/i);
  if (orderMatch) {
    const column = orderMatch[1];
    const direction = (orderMatch[2] || 'ASC').toLowerCase() as 'asc' | 'desc';
    query = query.order(column, { ascending: direction === 'asc' });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return { rows: data || [], rowCount: data?.length || 0 };
}

// Execute INSERT query via Supabase REST API
async function executeInsertQuery(sql: string, params?: any[]): Promise<any> {
  // Match INSERT INTO table (cols) VALUES (placeholders) RETURNING *
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)(?:\s+RETURNING\s+\*)?/i);
  if (!insertMatch) {
    throw new Error('Could not parse INSERT query');
  }
  
  const tableName = insertMatch[1];
  const columns = insertMatch[2].split(',').map(c => c.trim());
  const placeholders = insertMatch[3].split(',').map(p => p.trim());
  
  // Extract values from params
  const values: any = {};
  if (params) {
    columns.forEach((col, index) => {
      if (index < params.length) {
        values[col] = params[index];
      }
    });
  }
  
  const { data, error } = await supabaseClient!.from(tableName).insert(values).select();
  if (error) throw error;
  
  return { rows: Array.isArray(data) ? data : [data], rowCount: data?.length || 1 };
}

// Execute UPDATE query via Supabase REST API
async function executeUpdateQuery(sql: string, params?: any[]): Promise<any> {
  const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
  if (!updateMatch) {
    throw new Error('Could not parse UPDATE query');
  }
  
  const tableName = updateMatch[1];
  const setClause = updateMatch[2];
  const whereClause = updateMatch[3];
  
  // Parse SET clause
  const updates: any = {};
  const setParts = setClause.split(',').map(s => s.trim());
  setParts.forEach((part, index) => {
    const [key, value] = part.split('=').map(s => s.trim());
    const cleanKey = key.trim();
    if (value.startsWith('$')) {
      const paramIndex = parseInt(value.substring(1)) - 1;
      if (params && params[paramIndex] !== undefined) {
        updates[cleanKey] = params[paramIndex];
      }
    } else {
      updates[cleanKey] = value.replace(/['"]/g, '');
    }
  });
  
  // Parse WHERE clause
  let query = supabaseClient!.from(tableName).update(updates);
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
async function executeDeleteQuery(sql: string, params?: any[]): Promise<any> {
  const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
  if (!deleteMatch) {
    throw new Error('Could not parse DELETE query');
  }
  
  const tableName = deleteMatch[1];
  const whereClause = deleteMatch[2];
  
  let query = supabaseClient!.from(tableName).delete();
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
export const query = async (text: string, params?: any[]): Promise<any> => {
  if (isSupabase && supabaseClient) {
    // Use Supabase REST API for SQL execution
    try {
      return await executeSupabaseSQL(text, params);
    } catch (error: any) {
      // If RPC method fails, try parsing SQL and using PostgREST
      // For now, fall back to trying direct REST API calls
      console.error('Supabase SQL execution error:', error.message);
      throw error;
    }
  } else if (pool) {
    // Use direct PostgreSQL connection for local
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  } else {
    throw new Error('No database connection available');
  }
};

export const getClient = async (): Promise<PoolClient> => {
  if (!pool) {
    throw new Error('PostgreSQL pool not available (using Supabase mode)');
  }
  return await pool.connect();
};

export default pool;
