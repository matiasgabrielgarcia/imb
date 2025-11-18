# Sistema de Oportunidades (Opportunities System)

## Descripción General

El sistema de Oportunidades es un CRM Kanban que permite gestionar leads de clientes interesados en propiedades. Funciona como un tablero estilo Trello donde las oportunidades se pueden mover entre diferentes estados mediante drag & drop.

## Características

### 1. **Múltiples Canales de Entrada**
Las oportunidades pueden generarse desde diferentes canales:
- **Sitio Público** - Principal canal actual
- **WhatsApp** - Para integración futura
- **Teléfono** - Llamadas directas
- **Email** - Consultas por correo
- **Otros** - Canales personalizables

### 2. **Tablero Kanban con Drag & Drop**
Las oportunidades se visualizan en un tablero con columnas que representan diferentes estados:

#### Estados Disponibles:
- **Pendiente a Contactar** - Nueva oportunidad, requiere primer contacto
- **Esperando Respuesta** - Contacto realizado, aguardando respuesta del cliente
- **Evolucionado** - Oportunidad con progreso positivo
- **Tomar Acción** - Requiere acción inmediata
- **Congelado** - Oportunidad pausada temporalmente
- **Tasaciones** - En proceso de tasación
- **Alquiler Inmobiliaria** - Alquiler gestionado por la inmobiliaria
- **Alquiler Tercerizado** - Alquiler gestionado por terceros

### 3. **Información en las Tarjetas**
Cada tarjeta de oportunidad muestra:
- **Tiempo transcurrido** - "Hace X horas/días"
- **Email** - Correo electrónico de contacto
- **Teléfono** - Número de teléfono fijo
- **Celular** - Número de teléfono móvil
- **Propiedad** - ID de la propiedad de interés
- **Mensajes** - Contador de mensajes y tooltip con contenido
- **Canal** - Origen de la oportunidad
- **Nombre de contacto** - Si está disponible

### 4. **Separación por Tipo**
El sistema divide las oportunidades en dos categorías principales:
- **Ventas** (Sale)
- **Alquileres** (Rental)

Se accede a cada tipo mediante pestañas en la interfaz.

## Arquitectura

```
┌─────────────────────┐
│   Sitio Público     │───┐
└─────────────────────┘   │
                          │
┌─────────────────────┐   │  POST
│   Otros Canales     │───┼────────► ┌──────────────────┐
└─────────────────────┘   │          │  wapp Server     │
                          │          │  (Port 3005)     │
                                     └────────┬─────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │   PostgreSQL     │
                                     │   opportunities  │
                                     │      table       │
                                     └────────┬─────────┘
                                              │
                                              ▼ GET
                                     ┌──────────────────┐
                                     │  React Frontend  │
                                     │  Kanban Board    │
                                     └──────────────────┘
```

## Base de Datos

### Tabla: `opportunities`

```sql
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL DEFAULT 'public_website',
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  contact_name VARCHAR(255),
  messages TEXT[],
  status VARCHAR(50) NOT NULL DEFAULT 'pending_contact',
  opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('sale', 'rental')),
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);
```

### Índices
- Por property_id, status, opportunity_type, channel
- Por email, phone, mobile
- Por received_at (ordenamiento)
- Índice compuesto por (opportunity_type, status)

## API Endpoints (wapp server)

### GET /opportunities
Obtiene todas las oportunidades, con filtros opcionales.

**Query Parameters:**
- `type` - Filtrar por tipo: 'sale' o 'rental'
- `status` - Filtrar por estado

**Response:**
```json
{
  "total": 15,
  "opportunities": [...],
  "grouped": {
    "pending_contact": [...],
    "waiting_response": [...],
    ...
  }
}
```

### GET /opportunities/:id
Obtiene una oportunidad específica.

### POST /opportunities
Crea una nueva oportunidad.

**Body:**
```json
{
  "channel": "public_website",
  "property_id": 123,
  "email": "cliente@example.com",
  "phone": "123456789",
  "mobile": "987654321",
  "contact_name": "Juan Pérez",
  "messages": ["Interesado en la propiedad"],
  "opportunity_type": "sale",
  "metadata": {}
}
```

### PUT /opportunities/:id/status
Actualiza el estado de una oportunidad (usado en drag & drop).

**Body:**
```json
{
  "status": "waiting_response"
}
```

### PUT /opportunities/:id
Actualiza información completa de una oportunidad.

### POST /opportunities/:id/messages
Agrega un mensaje a una oportunidad.

**Body:**
```json
{
  "message": "Cliente llamó, volverá a contactar mañana"
}
```

### DELETE /opportunities/:id
Elimina una oportunidad.

### POST /opportunities/test/from-website
Endpoint de prueba para simular una oportunidad desde el sitio público.

**Body:**
```json
{
  "property_id": 123,
  "email": "test@example.com",
  "phone": "123456789",
  "mobile": "987654321",
  "contact_name": "Test User",
  "opportunity_type": "sale",
  "initial_message": "Interesado en esta propiedad"
}
```

## Frontend

### Componente: OpportunitiesView.tsx

Ubicación: `front/src/views/OpportunitiesView.tsx`

**Características:**
- Usa `@hello-pangea/dnd` para drag & drop
- Implementa Material-UI para la interfaz
- Actualización optimista al mover tarjetas
- Cálculo automático de tiempo transcurrido
- Tabs para separar ventas y alquileres

**Colores por Estado:**
- Pendiente a Contactar: Azul claro
- Esperando Respuesta: Naranja claro
- Evolucionado: Morado claro
- Tomar Acción: Rojo claro
- Congelado: Gris claro
- Tasaciones: Verde azulado
- Alquiler Inmobiliaria: Verde claro
- Alquiler Tercerizado: Rosa claro

## Setup e Instalación

### 1. Ejecutar Migración de Base de Datos

```bash
cd back/scripts
./run-migration-004.sh
```

O manualmente:
```bash
psql -U postgres -d 2fa_auth -f back/src/database/migrations/004_opportunities.sql
```

### 2. Instalar Dependencias del Servidor wapp

```bash
cd wapp
npm install
```

Esto instalará:
- `express` - Framework web
- `pg` - Driver PostgreSQL
- `dotenv` - Variables de entorno

### 3. Configurar Variables de Entorno

Asegúrate de que `wapp/.env` o las variables de entorno del sistema incluyan:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=2fa_auth
DB_USER=postgres
DB_PASSWORD=tu_password
```

### 4. Instalar Dependencias del Frontend

```bash
cd front
npm install
```

Esto instalará `@hello-pangea/dnd` (ya incluido si seguiste los pasos).

### 5. Iniciar los Servicios

**Terminal 1 - Backend Principal:**
```bash
cd back
npm start
```

**Terminal 2 - Servidor wapp:**
```bash
cd wapp
npm start
```

**Terminal 3 - Frontend:**
```bash
cd front
npm start
```

## Uso

### Crear una Oportunidad desde el Sitio Público

Cuando un visitante del sitio público muestre interés en una propiedad, el sitio debe hacer una petición POST al endpoint del servidor wapp:

```javascript
fetch('http://localhost:3005/opportunities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    channel: 'public_website',
    property_id: propertyId,
    email: userEmail,
    phone: userPhone,
    mobile: userMobile,
    contact_name: userName,
    opportunity_type: 'sale', // o 'rental'
    messages: [`Usuario interesado en la propiedad #${propertyId}`],
    metadata: {
      utm_source: 'google',
      utm_campaign: 'summer_2024',
      referrer: document.referrer
    }
  })
})
```

### Gestionar Oportunidades en el Panel

1. Accede a **Oportunidades** desde el menú lateral
2. Selecciona la pestaña **Ventas** o **Alquileres**
3. Visualiza las tarjetas organizadas por estado
4. Arrastra y suelta las tarjetas entre columnas para cambiar su estado
5. Haz clic en el ícono de mensaje para ver todos los mensajes de una oportunidad

## Pruebas

### Crear Oportunidades de Prueba

Usa Postman, cURL o cualquier cliente HTTP:

```bash
curl -X POST http://localhost:3005/opportunities/test/from-website \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "email": "test@example.com",
    "phone": "123456789",
    "mobile": "987654321",
    "contact_name": "Cliente de Prueba",
    "opportunity_type": "sale",
    "initial_message": "Estoy interesado en esta propiedad"
  }'
```

### Verificar Oportunidades

```bash
curl http://localhost:3005/opportunities?type=sale
```

## Futuras Mejoras

1. **Integración con WhatsApp**
   - Crear oportunidades automáticamente desde mensajes de WhatsApp
   - Categorización automática del tipo de interés

2. **Notificaciones**
   - Alertas cuando una oportunidad lleva mucho tiempo en un estado
   - Notificaciones de nuevas oportunidades

3. **Análisis y Reportes**
   - Dashboard con métricas de conversión
   - Tiempo promedio en cada estado
   - Tasa de cierre por canal

4. **Asignación de Agentes**
   - Asignar oportunidades a agentes específicos
   - Carga de trabajo balanceada

5. **Automatización**
   - Movimiento automático de estados basado en tiempo
   - Respuestas automáticas por email

6. **Historial de Actividades**
   - Registro completo de cambios de estado
   - Timeline de interacciones

## Notas Técnicas

- **Drag & Drop**: Usa `@hello-pangea/dnd` (fork activo de `react-beautiful-dnd`)
- **Base de Datos**: PostgreSQL con array de mensajes para flexibilidad
- **Metadata**: Campo JSONB para datos adicionales sin cambiar el esquema
- **Timestamps**: `received_at` vs `created_at` para distinguir cuándo llegó la oportunidad vs cuándo se registró
- **Actualizaciones Optimistas**: El frontend actualiza inmediatamente antes de confirmar con el servidor

## Troubleshooting

### Error: "Failed to fetch opportunities"
- Verifica que el servidor wapp esté corriendo en el puerto 3005
- Verifica la conexión a PostgreSQL
- Revisa los logs del servidor wapp

### Las tarjetas no se mueven
- Verifica que `@hello-pangea/dnd` esté instalado
- Revisa la consola del navegador por errores
- Asegúrate de que el servidor wapp esté respondiendo correctamente

### La migración falla
- Verifica que estés conectado a la base de datos correcta
- Asegúrate de que la tabla `properties` ya exista (referencia foránea)
- Revisa los permisos del usuario de base de datos

## Contacto y Soporte

Para problemas o sugerencias sobre el sistema de Oportunidades, contacta al equipo de desarrollo.

