const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno si existe .env
try {
  require('dotenv').config();
} catch (e) {
  console.log('No dotenv found, using environment variables or defaults');
}

// Configuración de la base de datos
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
    console.log('=====================================');
    console.log('Ejecutando Migración: Opportunities');
    console.log('=====================================');
    console.log(`Base de datos: ${process.env.DB_NAME || '2fa_auth'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log('');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '..', 'back', 'src', 'database', 'migrations', '004_opportunities.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Ejecutando SQL...');
    
    // Ejecutar la migración
    await client.query(sql);

    console.log('');
    console.log('✓ Migración completada exitosamente!');
    console.log('');

    // Verificar que la tabla se creó
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'opportunities'"
    );

    if (result.rows.length > 0) {
      console.log('✓ Tabla "opportunities" creada correctamente');
      
      // Mostrar estructura de la tabla
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'opportunities'
        ORDER BY ordinal_position
      `);
      
      console.log('\nEstructura de la tabla:');
      console.log('---');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    console.log('\n✅ Todo listo! Ya puedes usar el sistema de Oportunidades.');
    
  } catch (error) {
    console.error('\n❌ Error al ejecutar la migración:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencia: Verifica que PostgreSQL esté ejecutándose');
    } else if (error.code === '28P01') {
      console.error('\n💡 Sugerencia: Verifica tu usuario y contraseña de PostgreSQL');
    } else if (error.code === '3D000') {
      console.error('\n💡 Sugerencia: La base de datos no existe. Créala primero.');
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigration();

