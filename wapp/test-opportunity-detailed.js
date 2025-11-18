// Test detallado para crear una oportunidad

async function testOpportunity() {
  console.log('\n🧪 Test Detallado de Oportunidad\n');
  
  const testData = {
    property_id: 1,
    email: 'test@example.com',
    mobile: '+54 9 11 1234-5678',
    contact_name: 'Test User',
    opportunity_type: 'sale',
    initial_message: 'Esta es una prueba'
  };

  console.log('📤 Enviando request a: http://localhost:3005/opportunities/test/from-website');
  console.log('📦 Datos:', JSON.stringify(testData, null, 2));
  console.log('');

  try {
    const response = await fetch('http://localhost:3005/opportunities/test/from-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📥 Respuesta:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ ¡Oportunidad creada exitosamente!');
      console.log(`   ID: ${data.opportunity.id}`);
      console.log(`   Nombre: ${data.opportunity.contact_name}`);
      console.log(`   Estado: ${data.opportunity.status}`);
      console.log(`   Tipo: ${data.opportunity.opportunity_type}`);
    } else {
      console.log('\n❌ Error al crear la oportunidad');
    }
    
  } catch (error) {
    console.log('\n❌ Error de conexión:');
    console.log(`   ${error.message}`);
    console.log('\n💡 Asegúrate de que el servidor wapp esté corriendo:');
    console.log('   cd wapp');
    console.log('   npm start');
  }
}

testOpportunity();

