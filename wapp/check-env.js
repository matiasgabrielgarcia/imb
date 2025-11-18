// Verificar configuración del .env

require('dotenv').config();

console.log('\n🔍 Verificación de Configuración .env\n');
console.log('='.repeat(50));
console.log('\nVariables de entorno cargadas:');
console.log(`  DB_HOST: ${process.env.DB_HOST || 'NO CONFIGURADO'}`);
console.log(`  DB_PORT: ${process.env.DB_PORT || 'NO CONFIGURADO'}`);
console.log(`  DB_NAME: ${process.env.DB_NAME || 'NO CONFIGURADO'}`);
console.log(`  DB_USER: ${process.env.DB_USER || 'NO CONFIGURADO'}`);
console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '✓ Configurado (' + process.env.DB_PASSWORD.length + ' caracteres)' : '❌ NO CONFIGURADO'}`);
console.log('\n' + '='.repeat(50));

if (!process.env.DB_PASSWORD) {
  console.log('\n❌ PROBLEMA: DB_PASSWORD no está configurado');
  console.log('\n💡 SOLUCIÓN:');
  console.log('   1. Abre el archivo: wapp/.env');
  console.log('   2. Asegúrate de que tenga la línea:');
  console.log('      DB_PASSWORD=tu_contraseña_real');
  console.log('   3. Guarda el archivo');
  console.log('   4. Reinicia el servidor wapp\n');
} else {
  console.log('\n✅ Configuración parece correcta');
  console.log('\n🔄 Probando conexión a PostgreSQL...\n');
  
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || '2fa_auth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  pool.connect()
    .then(client => {
      console.log('✅ ¡Conexión exitosa!\n');
      client.release();
      pool.end();
    })
    .catch(error => {
      console.log('❌ Error de conexión:\n');
      if (error.code === '28P01') {
        console.log('   La contraseña es INCORRECTA');
        console.log('\n💡 SOLUCIÓN:');
        console.log('   1. Verifica tu contraseña de PostgreSQL');
        console.log('   2. Actualiza wapp/.env con la contraseña correcta');
        console.log('   3. Reinicia el servidor wapp\n');
      } else if (error.code === '3D000') {
        console.log('   La base de datos no existe');
        console.log(`   Database esperada: ${process.env.DB_NAME}\n`);
      } else {
        console.log(`   Código: ${error.code}`);
        console.log(`   Mensaje: ${error.message}\n`);
      }
      pool.end();
    });
}

