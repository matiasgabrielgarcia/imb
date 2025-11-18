// Script para crear oportunidades de prueba

const testOpportunities = [
  {
    property_id: 1,
    email: 'juan.perez@example.com',
    phone: '011-4567-8910',
    mobile: '+54 9 11 1234-5678',
    contact_name: 'Juan Pérez',
    opportunity_type: 'sale',
    initial_message: 'Estoy muy interesado en comprar esta propiedad. ¿Podríamos coordinar una visita?'
  },
  {
    property_id: 2,
    email: 'maria.gonzalez@example.com',
    mobile: '+54 9 11 9876-5432',
    contact_name: 'María González',
    opportunity_type: 'rental',
    initial_message: 'Necesito alquilar un departamento de 2 ambientes. Mi presupuesto es $50,000/mes'
  },
  {
    property_id: 3,
    email: 'carlos.rodriguez@example.com',
    phone: '011-2345-6789',
    mobile: '+54 9 11 5555-4444',
    contact_name: 'Carlos Rodríguez',
    opportunity_type: 'sale',
    initial_message: 'Vi la propiedad en el sitio web. ¿Está disponible para escriturar este mes?'
  },
  {
    property_id: 4,
    email: 'ana.martinez@example.com',
    mobile: '+54 9 11 3333-2222',
    contact_name: 'Ana Martínez',
    opportunity_type: 'rental',
    initial_message: 'Busco alquilar por 2 años. ¿Aceptan mascotas?'
  },
  {
    property_id: 5,
    email: 'pedro.sanchez@example.com',
    mobile: '+54 9 11 7777-8888',
    contact_name: 'Pedro Sánchez',
    opportunity_type: 'sale',
    initial_message: 'Quiero comprar pero necesito financiación. ¿Tienen opciones?'
  }
];

async function createOpportunities() {
  console.log('\n🎯 Creando Oportunidades de Prueba\n');
  console.log('='.repeat(50));
  
  let created = 0;
  let errors = 0;

  for (const opp of testOpportunities) {
    try {
      const response = await fetch('http://localhost:3005/opportunities/test/from-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opp)
      });

      if (response.ok) {
        const result = await response.json();
        created++;
        const type = opp.opportunity_type === 'sale' ? '💰 VENTA' : '🏠 ALQUILER';
        console.log(`✅ ${type} - ${opp.contact_name}`);
      } else {
        errors++;
        console.log(`❌ Error al crear: ${opp.contact_name}`);
      }
    } catch (error) {
      errors++;
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Creadas: ${created}`);
  if (errors > 0) console.log(`❌ Errores: ${errors}`);
  
  console.log('\n📊 Resumen:');
  console.log(`   - Ventas: ${testOpportunities.filter(o => o.opportunity_type === 'sale').length}`);
  console.log(`   - Alquileres: ${testOpportunities.filter(o => o.opportunity_type === 'rental').length}`);
  
  console.log('\n🎉 ¡Listo! Ahora puedes:');
  console.log('   1. Abrir http://localhost:3000/oportunidades');
  console.log('   2. Ver las oportunidades en el tablero Kanban');
  console.log('   3. Arrastrar y soltar las tarjetas entre columnas\n');
}

createOpportunities();

