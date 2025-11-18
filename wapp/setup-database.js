const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ========================================
// ⚠️ EDITA AQUÍ TUS CREDENCIALES
// ========================================
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: '2fa_auth',
  user: 'postgres',
  password: 'postgres', // ⬅️ CAMBIA ESTO POR TU CONTRASEÑA
};
// ========================================

async function runMigration() {
  console.log('\n=====================================');
  console.log('🚀 Migración de Oportunidades');
  console.log('=====================================\n');
  console.log('Configuración:');
  console.log(`  Host: ${DB_CONFIG.host}`);
  console.log(`  Puerto: ${DB_CONFIG.port}`);
  console.log(`  Base de datos: ${DB_CONFIG.database}`);
  console.log(`  Usuario: ${DB_CONFIG.user}`);
  console.log('\n🔄 Conectando...\n');

  const pool = new Pool(DB_CONFIG);
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '..', 'back', 'src', 'database', 'migrations', '004_opportunities.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`No se encontró el archivo de migración en: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Ejecutando migración...\n');
    
    // Ejecutar la migración
    await client.query(sql);

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar que la tabla se creó
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'opportunities'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✅ Tabla "opportunities" creada correctamente\n');
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) FROM opportunities');
      console.log(`📊 Registros actuales: ${count.rows[0].count}\n`);

      // Mostrar índices creados
      const indexes = await client.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'opportunities'
        ORDER BY indexname
      `);
      
      console.log('📋 Índices creados:');
      indexes.rows.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
      console.log('');
    }

    console.log('=====================================');
    console.log('✅ ¡TODO LISTO!');
    console.log('=====================================\n');
    console.log('Puedes continuar con:');
    console.log('1. npm start  (iniciar servidor wapp)');
    console.log('2. Crear oportunidades de prueba');
    console.log('3. Ver el tablero en /oportunidades\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 SOLUCIÓN:');
      console.error('   PostgreSQL no está ejecutándose.');
      console.error('   Inicia el servicio de PostgreSQL.\n');
    } else if (error.code === '28P01') {
      console.error('💡 SOLUCIÓN:');
      console.error('   Usuario o contraseña incorrectos.');
      console.error('   Edita las credenciales en setup-database.js (línea 7)\n');
    } else if (error.code === '3D000') {
      console.error('💡 SOLUCIÓN:');
      console.error('   La base de datos no existe.');
      console.error('   Créala ejecutando en PostgreSQL:');
      console.error('   CREATE DATABASE 2fa_auth;\n');
    } else if (error.code === '42P07') {
      console.error('💡 INFO:');
      console.error('   La tabla ya existe. ¡No hay problema!\n');
    } else if (error.message.includes('relation "properties" does not exist')) {
      console.error('💡 SOLUCIÓN:');
      console.error('   La tabla "properties" no existe.');
      console.error('   Ejecuta primero las migraciones anteriores.\n');
    }
    
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Ejecutar
console.log('');
runMigration().catch(error => {
  console.error('\n❌ Error inesperado:', error);
  process.exit(1);
});

