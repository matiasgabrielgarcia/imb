# 🚀 Quick Start - Sistema de Oportunidades

Guía rápida para poner en marcha el sistema de Oportunidades en 5 minutos.

## 📋 Requisitos Previos

- PostgreSQL ejecutándose
- Node.js instalado
- Base de datos `2fa_auth` creada
- Backend principal funcionando (puerto 3001)

## ⚡ Instalación Rápida

### 1. Crear la Tabla en la Base de Datos

**Windows (PowerShell):**
```powershell
cd back\scripts
# Editar run-migration-004.sh si es necesario o ejecutar directamente:
psql -U postgres -d 2fa_auth -f ..\src\database\migrations\004_opportunities.sql
```

**Linux/Mac:**
```bash
cd back/scripts
./run-migration-004.sh
```

### 2. Instalar Dependencias del Servidor wapp

```bash
cd wapp
npm install
```

Esto instalará:
- `express` (ya instalado)
- `pg` (nuevo - PostgreSQL driver)
- `dotenv` (ya instalado)

### 3. Configurar Variables de Entorno

Asegúrate de tener un archivo `.env` en el directorio `wapp` con:

```env
PORT=3005
DB_HOST=localhost
DB_PORT=5432
DB_NAME=2fa_auth
DB_USER=postgres
DB_PASSWORD=tu_password
```

### 4. Iniciar el Servidor wapp

```bash
cd wapp
npm start
```

Deberías ver:
```
================================================
WhatsApp Business Webhook Server
================================================
Server running on port 3005
```

### 5. Instalar Dependencias del Frontend (si no está hecho)

```bash
cd front
npm install
```

Esto instalará `@hello-pangea/dnd` para el drag & drop.

### 6. Iniciar el Frontend

```bash
cd front
npm start
```

## ✅ Verificar Instalación

### Probar el API

```bash
# Crear una oportunidad de prueba
curl -X POST http://localhost:3005/opportunities/test/from-website \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "email": "test@example.com",
    "mobile": "+54 9 11 1234-5678",
    "contact_name": "Test User",
    "opportunity_type": "sale",
    "initial_message": "Prueba del sistema"
  }'

# Ver todas las oportunidades
curl http://localhost:3005/opportunities
```

### Acceder al Panel

1. Abre el navegador en `http://localhost:3000`
2. Inicia sesión con tu usuario
3. Ve al menú lateral y haz clic en **"Oportunidades"**
4. Deberías ver el tablero Kanban con dos pestañas: **Ventas** y **Alquileres**

## 🎯 Crear Oportunidades de Prueba

Usa el script de Postman incluido en `examples/postman-collection.json` o:

```bash
# Crear oportunidad de VENTA
curl -X POST http://localhost:3005/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "public_website",
    "property_id": 1,
    "email": "comprador@example.com",
    "mobile": "+54 9 11 1111-1111",
    "contact_name": "Juan Comprador",
    "messages": ["Quiero comprar esta propiedad"],
    "opportunity_type": "sale"
  }'

# Crear oportunidad de ALQUILER
curl -X POST http://localhost:3005/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "public_website",
    "property_id": 2,
    "email": "inquilino@example.com",
    "mobile": "+54 9 11 2222-2222",
    "contact_name": "María Inquilina",
    "messages": ["Necesito alquilar un departamento"],
    "opportunity_type": "rental"
  }'
```

## 🎨 Usar el Tablero Kanban

1. **Ver Oportunidades**: Navega entre las pestañas "Ventas" y "Alquileres"
2. **Mover Tarjetas**: Arrastra y suelta las tarjetas entre columnas para cambiar su estado
3. **Ver Mensajes**: Haz clic en el ícono de mensaje para ver todas las notas
4. **Estados Disponibles**:
   - Pendiente a Contactar
   - Esperando Respuesta
   - Evolucionado
   - Tomar Acción
   - Congelado
   - Tasaciones
   - Alquiler Inmobiliaria
   - Alquiler Tercerizado

## 🌐 Integrar con tu Sitio Público

Usa el ejemplo en `examples/public-website-integration.html` como referencia.

**Código básico:**
```javascript
// Cuando un usuario muestre interés en una propiedad
fetch('http://localhost:3005/opportunities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channel: 'public_website',
    property_id: propertyId,
    email: userEmail,
    mobile: userMobile,
    contact_name: userName,
    opportunity_type: 'sale', // o 'rental'
    messages: ['Usuario interesado en la propiedad'],
    metadata: {
      utm_source: 'google',
      utm_campaign: 'summer_2024'
    }
  })
})
```

## 🐛 Troubleshooting

### Error: "Failed to fetch opportunities"
```bash
# Verificar que wapp esté corriendo
curl http://localhost:3005
# Debe responder con status: "running"
```

### Error: "connection refused" en PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Services > PostgreSQL
# Linux/Mac: sudo systemctl status postgresql

# Verificar la conexión
psql -U postgres -d 2fa_auth -c "SELECT COUNT(*) FROM opportunities;"
```

### Las tarjetas no se mueven
```bash
# Verificar que @hello-pangea/dnd esté instalado
cd front
npm list @hello-pangea/dnd
# Si no está instalado:
npm install @hello-pangea/dnd
```

### CORS errors en el navegador
El servidor wapp ya tiene CORS habilitado para desarrollo. Si usas otro dominio en producción, actualiza la configuración CORS en `wapp/server.js`.

## 📚 Documentación Completa

Para más detalles, consulta:
- `OPPORTUNITIES_SYSTEM.md` - Documentación completa del sistema
- `examples/public-website-integration.html` - Ejemplo de integración
- `examples/postman-collection.json` - Colección de Postman para testing

## 🎉 ¡Listo!

Ya tienes el sistema de Oportunidades funcionando. Empieza a gestionar tus leads como un profesional.

**Próximos pasos sugeridos:**
1. Personaliza los colores de las columnas en `OpportunitiesView.tsx`
2. Agrega más campos personalizados según tus necesidades
3. Integra con tu sitio público usando el ejemplo provisto
4. Configura notificaciones para nuevas oportunidades

