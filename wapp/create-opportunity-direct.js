// Crear oportunidad directamente usando el endpoint principal

async function createOpportunity() {
  console.log('\n📝 Creando Oportunidad Directamente\n');
  
  const opportunityData = {
    channel: 'public_website',
    property_id: 1,
    email: 'test@example.com',
    phone: '011-1234-5678',
    mobile: '+54 9 11 1234-5678',
    contact_name: 'Juan Test',
    messages: ['Cliente interesado en la propiedad desde el sitio web'],
    opportunity_type: 'sale',
    metadata: {
      source: 'test_script',
      timestamp: new Date().toISOString()
    }
  };

  console.log('📤 POST http://localhost:3005/opportunities');
  console.log('📦 Datos:', JSON.stringify(opportunityData, null, 2));
  console.log('');

  try {
    const response = await fetch('http://localhost:3005/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opportunityData)
    });

    console.log(`📡 Status: ${response.status}`);
    
    const data = await response.json();
    console.log('📥 Respuesta:', JSON.stringify(data, null, 2));
    console.log('');

    if (response.ok && data.success) {
      console.log('✅ ¡Oportunidad creada exitosamente!');
      console.log(`   ID: #${data.opportunity.id}`);
      console.log(`   Nombre: ${data.opportunity.contact_name}`);
      console.log(`   Email: ${data.opportunity.email}`);
      console.log(`   Tipo: ${data.opportunity.opportunity_type}`);
      console.log(`   Estado: ${data.opportunity.status}`);
      console.log(`   Canal: ${data.opportunity.channel}`);
      console.log('');
      console.log('🎉 ¡Listo! Ahora puedes verla en:');
      console.log('   http://localhost:3000/oportunidades');
      console.log('');
    } else {
      console.log('❌ Error:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

createOpportunity();

