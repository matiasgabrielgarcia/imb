const { Pool } = require('pg');

// Cargar variables de entorno
require('dotenv').config();

console.log('\n🔍 Verificando Conexión a Base de Datos\n');
console.log('Configuración:');
console.log(`  DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  DB_PORT: ${process.env.DB_PORT || '5432'}`);
console.log(`  DB_NAME: ${process.env.DB_NAME || '2fa_auth'}`);
console.log(`  DB_USER: ${process.env.DB_USER || 'postgres'}`);
console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NO CONFIGURADO'}`);
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '2fa_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar...\n');
    
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');
    
    // Test query
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Información de la base de datos:');
    console.log(`   Base de datos: ${result.rows[0].current_database}`);
    console.log(`   Usuario: ${result.rows[0].current_user}`);
    console.log(`   Versión PostgreSQL: ${result.rows[0].version.split(',')[0]}`);
    console.log('');
    
    // Check opportunities table
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count FROM opportunities
    `);
    console.log(`✅ Tabla opportunities: ${tableCheck.rows[0].count} registros\n`);
    
    client.release();
    
    console.log('🎉 Todo está configurado correctamente!\n');
    
  } catch (error) {
    console.log('❌ Error de conexión:\n');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensaje: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solución: PostgreSQL no está corriendo');
    } else if (error.code === '28P01') {
      console.log('💡 Solución: Usuario o contraseña incorrectos');
      console.log('   Verifica el archivo wapp/.env');
    } else if (error.code === '3D000') {
      console.log('💡 Solución: La base de datos no existe');
    } else if (error.message.includes('relation "opportunities"')) {
      console.log('💡 Solución: La tabla opportunities no existe');
      console.log('   Ejecuta: node run-migration.js');
    }
    console.log('');
  } finally {
    await pool.end();
  }
}

testConnection();

