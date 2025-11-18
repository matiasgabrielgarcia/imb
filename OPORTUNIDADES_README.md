# 🎯 Sistema de Oportunidades - Resumen Completo

## ✅ ¿Qué se ha Creado?

Se ha implementado un **sistema completo de gestión de oportunidades (CRM)** tipo Kanban estilo Trello para gestionar leads de clientes interesados en propiedades.

---

## 📦 Componentes Implementados

### 1. **Base de Datos** ✅
- **Archivo**: `back/src/database/migrations/004_opportunities.sql`
- **Tabla**: `opportunities` con campos:
  - ID, channel, property_id
  - email, phone, mobile, contact_name
  - messages (array), status, opportunity_type
  - received_at, created_at, updated_at
  - metadata (JSONB)
- **Script**: `back/scripts/run-migration-004.sh` para ejecutar la migración

### 2. **Backend API (wapp server)** ✅
- **Archivo**: `wapp/server.js` (actualizado)
- **Endpoints**:
  - `GET /opportunities` - Listar todas (con filtros)
  - `GET /opportunities/:id` - Ver una específica
  - `POST /opportunities` - Crear nueva
  - `PUT /opportunities/:id/status` - Cambiar estado (drag & drop)
  - `PUT /opportunities/:id` - Actualizar información
  - `POST /opportunities/:id/messages` - Agregar mensajes
  - `DELETE /opportunities/:id` - Eliminar
  - `POST /opportunities/test/from-website` - Endpoint de prueba

### 3. **Frontend API Client** ✅
- **Archivo**: `front/src/services/api.ts` (actualizado)
- **Tipos TypeScript**:
  - `OpportunityDto`
  - `OpportunityStatus`
  - `OpportunityType`
  - `GroupedOpportunities`
  - `CreateOpportunityRequest`
- **Funciones API**: `opportunitiesAPI` con todos los métodos

### 4. **Componente React Kanban** ✅
- **Archivo**: `front/src/views/OpportunitiesView.tsx`
- **Características**:
  - Tablero Kanban con 8 columnas (estados)
  - Drag & Drop funcional
  - Tabs para Ventas y Alquileres
  - Tarjetas con información completa
  - Colores diferenciados por estado
  - Tiempo transcurrido calculado automáticamente
  - Tooltips para mensajes

### 5. **Integración en la Aplicación** ✅
- **Archivo**: `front/src/App.tsx` (actualizado)
  - Ruta `/oportunidades` agregada
- **Archivo**: `front/src/components/Layout.tsx` (actualizado)
  - Ítem de menú "Oportunidades" con ícono TrendingUp

### 6. **Dependencias** ✅
- **wapp**: `pg` (PostgreSQL driver)
- **front**: `@hello-pangea/dnd` (drag & drop)

---

## 📊 Estados del Tablero Kanban

El tablero tiene **8 columnas** con los siguientes estados:

| Estado | Descripción | Color |
|--------|-------------|-------|
| **Pendiente a Contactar** | Nueva oportunidad, requiere primer contacto | Azul claro |
| **Esperando Respuesta** | Contacto realizado, aguardando respuesta | Naranja |
| **Evolucionado** | Oportunidad con progreso positivo | Morado |
| **Tomar Acción** | Requiere acción inmediata | Rojo |
| **Congelado** | Oportunidad pausada temporalmente | Gris |
| **Tasaciones** | En proceso de tasación | Verde azulado |
| **Alquiler Inmobiliaria** | Alquiler gestionado por la inmobiliaria | Verde |
| **Alquiler Tercerizado** | Alquiler gestionado por terceros | Rosa |

---

## 📋 Información en las Tarjetas

Cada tarjeta de oportunidad muestra:
- ⏰ **Tiempo transcurrido** - "Hace X horas/días"
- 👤 **Nombre de contacto**
- 📧 **Email**
- 📞 **Teléfono fijo**
- 📱 **Celular/Móvil**
- 🏠 **ID de Propiedad** de interés
- 💬 **Contador de mensajes** con tooltip
- 📡 **Canal** de origen (sitio público, WhatsApp, etc.)

---

## 🚀 Instalación Rápida

### Paso 1: Ejecutar Migración de Base de Datos

```bash
cd back/scripts
psql -U postgres -d 2fa_auth -f ../src/database/migrations/004_opportunities.sql
```

### Paso 2: Instalar Dependencias

```bash
# Servidor wapp
cd wapp
npm install

# Frontend
cd front
npm install
```

### Paso 3: Iniciar Servicios

**Terminal 1 - wapp server:**
```bash
cd wapp
npm start
# Debe ejecutarse en http://localhost:3005
```

**Terminal 2 - Frontend:**
```bash
cd front
npm start
# Debe ejecutarse en http://localhost:3000
```

### Paso 4: Acceder

1. Abre `http://localhost:3000`
2. Inicia sesión
3. Haz clic en **"Oportunidades"** en el menú lateral
4. ¡Listo! Ya puedes ver el tablero Kanban

---

## 🧪 Crear Oportunidades de Prueba

### Usando cURL

```bash
# Crear oportunidad de VENTA
curl -X POST http://localhost:3005/opportunities/test/from-website \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "email": "comprador@example.com",
    "mobile": "+54 9 11 1111-1111",
    "contact_name": "Juan Comprador",
    "opportunity_type": "sale",
    "initial_message": "Quiero comprar esta casa"
  }'

# Crear oportunidad de ALQUILER
curl -X POST http://localhost:3005/opportunities/test/from-website \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 2,
    "email": "inquilino@example.com",
    "mobile": "+54 9 11 2222-2222",
    "contact_name": "María Inquilina",
    "opportunity_type": "rental",
    "initial_message": "Necesito alquilar un depto"
  }'
```

### Usando Postman

Importa la colección: `examples/postman-collection.json`

---

## 🎨 Cómo Usar el Tablero

### Ver Oportunidades
1. Selecciona la pestaña **"Ventas"** o **"Alquileres"**
2. Las oportunidades se muestran en columnas según su estado
3. Cada columna muestra el número de oportunidades

### Mover Oportunidades (Drag & Drop)
1. **Haz clic** en una tarjeta
2. **Arrastra** la tarjeta hacia otra columna
3. **Suelta** en la columna del nuevo estado
4. El cambio se guarda automáticamente en la base de datos

### Ver Mensajes
- Haz clic en el ícono de mensaje (💬) en la tarjeta
- Se mostrará un tooltip con todos los mensajes

---

## 🌐 Integración con Sitio Público

### Código JavaScript Básico

```javascript
// Cuando un visitante muestre interés en una propiedad
async function submitInterest(propertyId, contactInfo) {
  const response = await fetch('http://localhost:3005/opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: 'public_website',
      property_id: propertyId,
      email: contactInfo.email,
      mobile: contactInfo.mobile,
      contact_name: contactInfo.name,
      opportunity_type: contactInfo.type, // 'sale' o 'rental'
      messages: [contactInfo.message || 'Cliente interesado'],
      metadata: {
        utm_source: 'google',
        utm_campaign: 'summer_2024',
        referrer: document.referrer
      }
    })
  });
  
  if (response.ok) {
    alert('¡Gracias! Te contactaremos pronto.');
  }
}
```

### Ejemplo HTML Completo

Ver: `examples/public-website-integration.html`

---

## 📚 Documentación Disponible

| Archivo | Descripción |
|---------|-------------|
| `OPPORTUNITIES_SYSTEM.md` | 📖 Documentación técnica completa |
| `OPPORTUNITIES_QUICKSTART.md` | ⚡ Guía de inicio rápido |
| `examples/api-usage-examples.md` | 💡 Ejemplos de uso de la API |
| `examples/public-website-integration.html` | 🌐 Ejemplo de integración HTML |
| `examples/postman-collection.json` | 📮 Colección de Postman |

---

## 🔑 Características Clave

### ✨ Frontend
- ✅ Tablero Kanban estilo Trello
- ✅ Drag & Drop fluido
- ✅ Actualización optimista (UI instantánea)
- ✅ Separación por tipo (Ventas/Alquileres)
- ✅ Colores diferenciados por estado
- ✅ Tiempo transcurrido automático
- ✅ Responsive design (Material-UI)

### 🔧 Backend
- ✅ API RESTful completa
- ✅ Conexión a PostgreSQL
- ✅ Validaciones de datos
- ✅ Mensajes como array
- ✅ Metadata flexible (JSONB)
- ✅ Endpoints de prueba

### 🗄️ Base de Datos
- ✅ Tabla optimizada con índices
- ✅ Relación con tabla properties
- ✅ Triggers de actualización automática
- ✅ Campos opcionales flexibles
- ✅ Array de mensajes

---

## 🎯 Flujo de Trabajo Completo

```
1. Cliente ve propiedad en sitio público
         ↓
2. Cliente completa formulario de interés
         ↓
3. Sitio público POST a /opportunities
         ↓
4. Se crea registro en base de datos
         ↓
5. Aparece en tablero Kanban como "Pendiente a Contactar"
         ↓
6. Agente ve la oportunidad en el panel
         ↓
7. Agente contacta al cliente
         ↓
8. Agente arrastra tarjeta a "Esperando Respuesta"
         ↓
9. Cliente responde positivamente
         ↓
10. Agente mueve a "Evolucionado"
         ↓
... y así hasta cerrar la venta/alquiler
```

---

## 🔍 Verificar que Todo Funciona

### 1. Verificar Base de Datos
```bash
psql -U postgres -d 2fa_auth -c "SELECT COUNT(*) FROM opportunities;"
```

### 2. Verificar API
```bash
curl http://localhost:3005/opportunities
# Debe retornar JSON con oportunidades
```

### 3. Verificar Frontend
- Abre `http://localhost:3000/oportunidades`
- Debes ver el tablero con las columnas

---

## 🐛 Troubleshooting

### Error: "connection refused" PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Services > PostgreSQL
# Linux: sudo systemctl status postgresql
```

### Error: "Failed to fetch opportunities"
```bash
# Verificar que wapp esté en puerto 3005
curl http://localhost:3005
```

### Las tarjetas no se mueven
```bash
# Verificar que la librería esté instalada
cd front
npm list @hello-pangea/dnd
```

---

## 🚀 Próximos Pasos Sugeridos

1. **Personalizar Estados**
   - Edita `OpportunitiesView.tsx` para cambiar nombres/colores

2. **Agregar Notificaciones**
   - Email cuando llega nueva oportunidad
   - Alertas para oportunidades antiguas

3. **Métricas y Analytics**
   - Dashboard con tasa de conversión
   - Tiempo promedio por estado

4. **Asignación de Agentes**
   - Agregar campo `assigned_to`
   - Distribuir oportunidades entre el equipo

5. **Automatización**
   - Mover automáticamente después de X días
   - Respuestas automáticas

---

## 📞 Canales Disponibles

Actualmente soporta:
- ✅ **public_website** - Sitio público (implementado)
- 🔜 **whatsapp** - WhatsApp (preparado para implementar)
- 🔜 **phone** - Llamadas telefónicas
- 🔜 **email** - Consultas por email
- 🔜 **facebook** - Facebook Messenger
- 🔜 **instagram** - Instagram DM

Para agregar más canales, solo modifica el campo `channel` al crear la oportunidad.

---

## ✅ Checklist de Implementación

- [x] Migración de base de datos creada
- [x] Tabla `opportunities` en PostgreSQL
- [x] Endpoints API en wapp server
- [x] Cliente API en frontend
- [x] Componente Kanban con drag & drop
- [x] Ruta agregada en App.tsx
- [x] Menú actualizado en Layout.tsx
- [x] Dependencias instaladas
- [x] Documentación completa
- [x] Ejemplos de integración
- [x] Colección de Postman
- [ ] **Pendiente**: Ejecutar migración en tu BD
- [ ] **Pendiente**: Crear oportunidades de prueba
- [ ] **Pendiente**: Configurar integración con sitio público

---

## 🎉 ¡Todo Listo!

El sistema de Oportunidades está **100% implementado** y listo para usar.

**¿Qué hacer ahora?**
1. Ejecuta la migración de base de datos
2. Inicia los servicios (wapp + frontend)
3. Crea algunas oportunidades de prueba
4. Prueba el drag & drop en el tablero
5. Integra con tu sitio público

**¿Preguntas?**
- Lee `OPPORTUNITIES_SYSTEM.md` para documentación completa
- Revisa `OPPORTUNITIES_QUICKSTART.md` para guía rápida
- Consulta `examples/api-usage-examples.md` para ejemplos

---

**¡Disfruta gestionando tus leads como un profesional!** 🚀

