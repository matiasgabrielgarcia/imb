const { Pool } = require('pg');

// Cargar variables de entorno
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '2fa_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function verifyTable() {
  const client = await pool.connect();
  
  try {
    console.log('\n✅ VERIFICACIÓN DEL SISTEMA DE OPORTUNIDADES\n');
    console.log('='.repeat(50));
    
    // Verificar que la tabla existe
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'opportunities'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('❌ La tabla "opportunities" NO existe');
      process.exit(1);
    }

    console.log('✅ Tabla "opportunities" existe\n');

    // Contar registros
    const count = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`📊 Registros en la tabla: ${count.rows[0].count}`);

    // Mostrar estructura
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'opportunities'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de la tabla:');
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(opcional)' : '(requerido)';
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    // Mostrar índices
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'opportunities'
      ORDER BY indexname
    `);
    
    console.log(`\n🔍 Índices creados: ${indexes.rows.length}`);
    indexes.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Si hay registros, mostrar algunos
    if (parseInt(count.rows[0].count) > 0) {
      const sample = await client.query(`
        SELECT id, contact_name, email, opportunity_type, status, received_at
        FROM opportunities
        ORDER BY received_at DESC
        LIMIT 5
      `);
      
      console.log('\n📝 Últimas oportunidades:');
      sample.rows.forEach(opp => {
        console.log(`   #${opp.id} - ${opp.contact_name || 'Sin nombre'} (${opp.opportunity_type}) - ${opp.status}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ TODO ESTÁ LISTO!\n');
    console.log('Próximos pasos:');
    console.log('1. npm start           (en wapp/ - iniciar servidor)');
    console.log('2. npm start           (en front/ - iniciar frontend)');
    console.log('3. Ir a http://localhost:3000/oportunidades\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyTable();

