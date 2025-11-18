const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runMigration() {
  console.log('=====================================');
  console.log('Migración de Oportunidades');
  console.log('=====================================\n');

  // Solicitar datos de conexión
  const host = await question('Host de PostgreSQL [localhost]: ') || 'localhost';
  const port = await question('Puerto [5432]: ') || '5432';
  const database = await question('Nombre de base de datos [2fa_auth]: ') || '2fa_auth';
  const user = await question('Usuario [postgres]: ') || 'postgres';
  const password = await question('Contraseña: ');

  rl.close();

  console.log('\n🔄 Conectando a la base de datos...\n');

  const pool = new Pool({
    host,
    port: parseInt(port),
    database,
    user,
    password,
  });

  const client = await pool.connect();
  
  try {
    console.log('✓ Conexión establecida');
    console.log('🔄 Ejecutando migración...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '..', 'back', 'src', 'database', 'migrations', '004_opportunities.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Ejecutar la migración
    await client.query(sql);

    console.log('✓ Migración ejecutada exitosamente!\n');

    // Verificar que la tabla se creó
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'opportunities'"
    );

    if (result.rows.length > 0) {
      console.log('✓ Tabla "opportunities" creada correctamente\n');
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) FROM opportunities');
      console.log(`📊 Registros en la tabla: ${count.rows[0].count}\n`);
    }

    console.log('✅ ¡Todo listo! Ya puedes usar el sistema de Oportunidades.\n');
    
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 La tabla ya existe. No hay problema, puedes continuar.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL no está ejecutándose o no está en el puerto especificado');
    } else if (error.code === '28P01') {
      console.error('\n💡 Usuario o contraseña incorrectos');
    } else if (error.code === '3D000') {
      console.error('\n💡 La base de datos no existe. Créala primero con:');
      console.error('   CREATE DATABASE 2fa_auth;');
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigration().catch(console.error);

