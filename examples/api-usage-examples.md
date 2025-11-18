# 📖 Ejemplos de Uso de la API de Oportunidades

## Tabla de Contenidos
- [Crear Oportunidades](#crear-oportunidades)
- [Consultar Oportunidades](#consultar-oportunidades)
- [Actualizar Oportunidades](#actualizar-oportunidades)
- [Gestionar Mensajes](#gestionar-mensajes)
- [Integración con Sitio Público](#integración-con-sitio-público)
- [Casos de Uso Reales](#casos-de-uso-reales)

---

## Crear Oportunidades

### Crear Oportunidad de Venta Básica

```bash
curl -X POST http://localhost:3005/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_type": "sale",
    "email": "comprador@example.com",
    "mobile": "+54 9 11 1234-5678",
    "contact_name": "Juan Pérez"
  }'
```

### Crear Oportunidad de Alquiler con Todos los Datos

```bash
curl -X POST http://localhost:3005/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "public_website",
    "property_id": 123,
    "email": "inquilino@example.com",
    "phone": "011-4567-8910",
    "mobile": "+54 9 11 9876-5432",
    "contact_name": "María González",
    "messages": [
      "Necesito alquilar un departamento de 2 ambientes",
      "Mi presupuesto es de $50,000 por mes"
    ],
    "opportunity_type": "rental",
    "metadata": {
      "utm_source": "google",
      "utm_campaign": "verano_2024",
      "referrer": "https://google.com",
      "budget": 50000
    }
  }'
```

### JavaScript/TypeScript

```javascript
async function createOpportunity() {
  const response = await fetch('http://localhost:3005/opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'public_website',
      property_id: 123,
      email: 'cliente@example.com',
      mobile: '+54 9 11 1234-5678',
      contact_name: 'Juan Pérez',
      opportunity_type: 'sale',
      messages: ['Estoy interesado en esta propiedad']
    })
  });
  
  const result = await response.json();
  console.log('Oportunidad creada:', result);
}
```

### Python

```python
import requests

def create_opportunity():
    url = 'http://localhost:3005/opportunities'
    data = {
        'channel': 'public_website',
        'property_id': 123,
        'email': 'cliente@example.com',
        'mobile': '+54 9 11 1234-5678',
        'contact_name': 'Juan Pérez',
        'opportunity_type': 'sale',
        'messages': ['Estoy interesado en esta propiedad']
    }
    
    response = requests.post(url, json=data)
    print('Oportunidad creada:', response.json())
```

---

## Consultar Oportunidades

### Obtener Todas las Oportunidades

```bash
curl http://localhost:3005/opportunities
```

### Filtrar por Tipo (Ventas)

```bash
curl 'http://localhost:3005/opportunities?type=sale'
```

### Filtrar por Tipo (Alquileres)

```bash
curl 'http://localhost:3005/opportunities?type=rental'
```

### Filtrar por Estado

```bash
curl 'http://localhost:3005/opportunities?status=pending_contact'
```

### Filtrar por Tipo y Estado

```bash
curl 'http://localhost:3005/opportunities?type=sale&status=waiting_response'
```

### Obtener una Oportunidad Específica

```bash
curl http://localhost:3005/opportunities/1
```

### JavaScript con Filtros

```javascript
// Obtener todas las oportunidades de venta pendientes
async function getSalePendingOpportunities() {
  const response = await fetch(
    'http://localhost:3005/opportunities?type=sale&status=pending_contact'
  );
  const data = await response.json();
  
  console.log('Total:', data.total);
  console.log('Oportunidades:', data.opportunities);
  console.log('Agrupadas por estado:', data.grouped);
}
```

---

## Actualizar Oportunidades

### Cambiar Estado (Drag & Drop)

```bash
curl -X PUT http://localhost:3005/opportunities/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "waiting_response"
  }'
```

### Estados Disponibles
- `pending_contact`
- `waiting_response`
- `evolved`
- `take_action`
- `frozen`
- `appraisals`
- `rental_agency`
- `rental_outsourced`

### Actualizar Información de Contacto

```bash
curl -X PUT http://localhost:3005/opportunities/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo_email@example.com",
    "phone": "011-9999-8888",
    "mobile": "+54 9 11 8888-9999",
    "contact_name": "Juan Carlos Pérez"
  }'
```

### Actualizar Property ID

```bash
curl -X PUT http://localhost:3005/opportunities/1 \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 456
  }'
```

### JavaScript - Actualización Completa

```javascript
async function updateOpportunity(id, updates) {
  const response = await fetch(`http://localhost:3005/opportunities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
}

// Uso
updateOpportunity(1, {
  email: 'nuevo@example.com',
  status: 'evolved',
  property_id: 999
});
```

---

## Gestionar Mensajes

### Agregar un Mensaje/Nota

```bash
curl -X POST http://localhost:3005/opportunities/1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cliente llamó el 15/11/2024. Mostró mucho interés. Agendar visita para el 20/11."
  }'
```

### JavaScript - Agregar Mensaje

```javascript
async function addMessage(opportunityId, message) {
  const response = await fetch(
    `http://localhost:3005/opportunities/${opportunityId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    }
  );
  
  return await response.json();
}

// Uso
addMessage(1, 'Cliente respondió por email. Está interesado.');
```

### Ver Mensajes de una Oportunidad

```bash
# Primero obtén la oportunidad
curl http://localhost:3005/opportunities/1

# Los mensajes están en el campo "messages" (array)
```

```javascript
async function getOpportunityMessages(id) {
  const response = await fetch(`http://localhost:3005/opportunities/${id}`);
  const opportunity = await response.json();
  return opportunity.messages;
}
```

---

## Integración con Sitio Público

### Formulario HTML Completo

```html
<form id="contactForm">
  <input type="text" name="name" placeholder="Nombre" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="mobile" placeholder="Celular" required>
  <select name="type" required>
    <option value="sale">Compra</option>
    <option value="rental">Alquiler</option>
  </select>
  <textarea name="message" placeholder="Mensaje"></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const propertyId = document.querySelector('[data-property-id]').dataset.propertyId;
  
  const response = await fetch('http://localhost:3005/opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'public_website',
      property_id: parseInt(propertyId),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      contact_name: formData.get('name'),
      opportunity_type: formData.get('type'),
      messages: [formData.get('message') || 'Cliente interesado'],
      metadata: {
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    })
  });
  
  if (response.ok) {
    alert('¡Gracias! Te contactaremos pronto.');
    e.target.reset();
  } else {
    alert('Error al enviar. Intenta nuevamente.');
  }
});
</script>
```

### React/Next.js Integration

```jsx
import { useState } from 'react';

function PropertyContactForm({ propertyId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    type: 'sale',
    message: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3005/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'public_website',
          property_id: propertyId,
          email: formData.email,
          mobile: formData.mobile,
          contact_name: formData.name,
          opportunity_type: formData.type,
          messages: [formData.message || 'Cliente interesado']
        })
      });
      
      if (response.ok) {
        alert('¡Gracias! Te contactaremos pronto.');
        setFormData({ name: '', email: '', mobile: '', type: 'sale', message: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar. Intenta nuevamente.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Casos de Uso Reales

### 1. Bot de WhatsApp que Crea Oportunidades

```javascript
// Cuando llega un mensaje de WhatsApp
async function handleWhatsAppMessage(message) {
  // Extraer información del mensaje
  const contactName = message.contact.name;
  const mobile = message.from;
  const messageText = message.text.body;
  
  // Determinar tipo basado en keywords
  const type = messageText.toLowerCase().includes('alquiler') 
    ? 'rental' 
    : 'sale';
  
  // Crear oportunidad
  await fetch('http://localhost:3005/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'whatsapp',
      mobile,
      contact_name: contactName,
      messages: [messageText],
      opportunity_type: type,
      metadata: {
        whatsapp_id: message.id,
        timestamp: message.timestamp
      }
    })
  });
}
```

### 2. CRM Automático - Mover a "Tomar Acción" después de 3 días sin respuesta

```javascript
async function autoMoveStaleOpportunities() {
  // Obtener oportunidades esperando respuesta
  const response = await fetch(
    'http://localhost:3005/opportunities?status=waiting_response'
  );
  const data = await response.json();
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  // Mover las que tienen más de 3 días
  for (const opp of data.opportunities) {
    const receivedAt = new Date(opp.received_at);
    if (receivedAt < threeDaysAgo) {
      await fetch(`http://localhost:3005/opportunities/${opp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'take_action' })
      });
      
      // Agregar nota
      await fetch(`http://localhost:3005/opportunities/${opp.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Movido automáticamente: Sin respuesta por 3 días'
        })
      });
    }
  }
}

// Ejecutar cada hora
setInterval(autoMoveStaleOpportunities, 60 * 60 * 1000);
```

### 3. Dashboard de Métricas

```javascript
async function getOpportunityMetrics() {
  const response = await fetch('http://localhost:3005/opportunities');
  const data = await response.json();
  
  // Total por tipo
  const saleCount = data.opportunities.filter(o => o.opportunity_type === 'sale').length;
  const rentalCount = data.opportunities.filter(o => o.opportunity_type === 'rental').length;
  
  // Por canal
  const channelStats = {};
  data.opportunities.forEach(opp => {
    channelStats[opp.channel] = (channelStats[opp.channel] || 0) + 1;
  });
  
  // Nuevas hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = data.opportunities.filter(opp => 
    new Date(opp.received_at) >= today
  ).length;
  
  return {
    total: data.total,
    sales: saleCount,
    rentals: rentalCount,
    byChannel: channelStats,
    today: todayCount,
    byStatus: data.grouped
  };
}
```

### 4. Email Automation - Notificar Nuevas Oportunidades

```javascript
// Ejecutar cada 5 minutos
async function notifyNewOpportunities() {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  const response = await fetch('http://localhost:3005/opportunities');
  const data = await response.json();
  
  const newOpps = data.opportunities.filter(opp => 
    new Date(opp.received_at) >= fiveMinutesAgo
  );
  
  if (newOpps.length > 0) {
    // Enviar email al equipo de ventas
    await sendEmail({
      to: 'ventas@inmobiliaria.com',
      subject: `${newOpps.length} Nueva(s) Oportunidad(es)`,
      body: `
        <h2>Nuevas oportunidades recibidas:</h2>
        <ul>
          ${newOpps.map(opp => `
            <li>
              <strong>${opp.contact_name}</strong><br>
              ${opp.email} - ${opp.mobile}<br>
              Tipo: ${opp.opportunity_type}<br>
              Propiedad: ${opp.property_id}
            </li>
          `).join('')}
        </ul>
      `
    });
  }
}

setInterval(notifyNewOpportunities, 5 * 60 * 1000);
```

### 5. Exportar Oportunidades a Excel

```javascript
async function exportOpportunitiesToCSV() {
  const response = await fetch('http://localhost:3005/opportunities');
  const data = await response.json();
  
  // Crear CSV
  const headers = ['ID', 'Nombre', 'Email', 'Móvil', 'Tipo', 'Estado', 'Propiedad', 'Fecha'];
  const rows = data.opportunities.map(opp => [
    opp.id,
    opp.contact_name,
    opp.email,
    opp.mobile,
    opp.opportunity_type,
    opp.status,
    opp.property_id,
    new Date(opp.received_at).toLocaleDateString()
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  // Descargar
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oportunidades_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
```

---

## Testing con cURL

### Crear 10 oportunidades de prueba

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3005/opportunities/test/from-website \
    -H "Content-Type: application/json" \
    -d "{
      \"property_id\": $i,
      \"email\": \"test$i@example.com\",
      \"mobile\": \"+54 9 11 $i$i$i$i-$i$i$i$i\",
      \"contact_name\": \"Test User $i\",
      \"opportunity_type\": \"sale\",
      \"initial_message\": \"Interesado en propiedad $i\"
    }"
  
  curl -X POST http://localhost:3005/opportunities/test/from-website \
    -H "Content-Type: application/json" \
    -d "{
      \"property_id\": $((i+10)),
      \"email\": \"rental$i@example.com\",
      \"mobile\": \"+54 9 11 9$i$i$i-9$i$i$i\",
      \"contact_name\": \"Rental User $i\",
      \"opportunity_type\": \"rental\",
      \"initial_message\": \"Quiero alquilar propiedad $((i+10))\"
    }"
done
```

---

## Webhooks y Integraciones

### Zapier Integration Example

```javascript
// Enviar a Zapier cuando se crea una oportunidad
async function sendToZapier(opportunity) {
  await fetch('https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opportunity)
  });
}
```

### Slack Notification

```javascript
async function notifySlack(opportunity) {
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🎯 Nueva oportunidad: ${opportunity.contact_name}`,
      attachments: [{
        color: opportunity.opportunity_type === 'sale' ? 'good' : 'warning',
        fields: [
          { title: 'Email', value: opportunity.email, short: true },
          { title: 'Móvil', value: opportunity.mobile, short: true },
          { title: 'Tipo', value: opportunity.opportunity_type, short: true },
          { title: 'Propiedad', value: `#${opportunity.property_id}`, short: true }
        ]
      }]
    })
  });
}
```

---

¿Necesitas más ejemplos? Consulta:
- `OPPORTUNITIES_SYSTEM.md` - Documentación completa
- `public-website-integration.html` - Ejemplo HTML funcional
- `postman-collection.json` - Colección de Postman para importar

