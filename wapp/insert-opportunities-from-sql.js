const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rental_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function insertTestOpportunities() {
  const client = await pool.connect();
  
  try {
    console.log('\n🎯 Insertando Oportunidades de Prueba\n');
    
    const sqlFile = path.join(__dirname, '..', 'insert-test-opportunities.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Oportunidades insertadas exitosamente!\n');
    
    const count = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`📊 Total de oportunidades: ${count.rows[0].count}\n`);
    
    const byType = await client.query(`
      SELECT opportunity_type, COUNT(*) as count 
      FROM opportunities 
      GROUP BY opportunity_type
    `);
    
    console.log('Por tipo:');
    byType.rows.forEach(row => {
      const type = row.opportunity_type === 'sale' ? '💰 Ventas' : '🏠 Alquileres';
      console.log(`   ${type}: ${row.count}`);
    });
    
    console.log('\n🎉 ¡Listo! Ahora puedes:');
    console.log('   1. Abrir http://localhost:3000/oportunidades');
    console.log('   2. Ver las oportunidades en el tablero Kanban');
    console.log('   3. Arrastrar y soltar las tarjetas entre columnas\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertTestOpportunities();

