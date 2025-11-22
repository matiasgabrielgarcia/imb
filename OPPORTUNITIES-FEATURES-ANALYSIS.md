# Análisis de Características - Oportunidades

## 1. Análisis: Campo DNI para Propiedades

### Contexto
Se solicitó analizar si agregar un campo DNI (Documento Nacional de Identidad) a las propiedades sería beneficioso para obtener información del cliente.

### Análisis

#### Beneficios Potenciales:

1. **Identificación Unívoca de Clientes**
   - El DNI permite identificar de forma única a cada cliente/propietario
   - Facilita la búsqueda y filtrado de propiedades por propietario
   - Reduce duplicados y errores en la gestión de clientes

2. **Integración con Sistemas Externos**
   - Permite consultar información crediticia o fiscal si se integra con servicios externos
   - Facilita la verificación de identidad para transacciones legales
   - Útil para reportes a AFIP u otros organismos gubernamentales

3. **Gestión de Documentos Legales**
   - Necesario para contratos de alquiler y venta
   - Requerido para verificaciones de antecedentes
   - Importante para cumplimiento normativo

4. **Experiencia de Usuarios en Sistemas Inmobiliarios**
   - Los sistemas inmobiliarios profesionales (Tango Gestión, GestiGlobal, etc.) suelen requerir DNI
   - Facilita la creación de expedientes digitales
   - Permite tracking de todas las propiedades de un mismo propietario

#### Consideraciones:

1. **Privacidad y Seguridad**
   - El DNI es información sensible que requiere protección especial (LGPD/GDPR)
   - Necesita encriptación y medidas de seguridad adicionales
   - Requiere consentimiento explícito del propietario

2. **Campo Opcional vs Requerido**
   - Debe ser opcional porque:
     - No todos los clientes pueden proporcionarlo inmediatamente
     - Para consultas iniciales puede no estar disponible
     - Facilita la creación de propiedades sin bloqueos

3. **Implementación**
   - Agregar campo `dni VARCHAR(20)` a la tabla `properties`
   - Validar formato según país (Argentina: 7-8 dígitos)
   - Considerar índices para búsquedas rápidas

### Recomendación

**SÍ, es beneficioso agregar un campo DNI opcional** porque:
- Mejora la gestión de clientes y propiedades
- Facilita futuras integraciones y reportes
- Es un estándar en la industria inmobiliaria
- Al ser opcional, no bloquea el flujo de trabajo actual

**Implementación sugerida:**
- Campo opcional en la tabla `properties`
- Validación de formato (opcional)
- UI con indicador de campo opcional
- Políticas de privacidad claras

---

## 2. Análisis: Opciones para Envío de Emails

### Contexto
Se solicitó analizar opciones para envío de emails, por ejemplo, cuando un estado específico (como "congelado") pasa su tiempo máximo de espera y enviar un email de recordatorio.

### Opciones Disponibles

#### 1. **Nodemailer (Ya implementado en el proyecto)**
   - **Ventajas:**
     - Ya está en el stack tecnológico
     - Fácil de configurar
     - Soporta múltiples proveedores (SMTP, Gmail, SendGrid, etc.)
     - Gratis para uso básico
   - **Desventajas:**
     - Requiere configuración de SMTP propio o servicio
     - Limitaciones en envíos masivos
     - No tiene tracking avanzado built-in
   - **Costo:** Gratis (pero necesita SMTP/servicio)
   - **Ideal para:** Emails transaccionales simples

#### 2. **SendGrid**
   - **Ventajas:**
     - Excelente deliverability
     - API RESTful fácil de usar
     - Tracking y analytics incluidos
     - Templates de email
     - Plan gratuito generoso (100 emails/día)
   - **Desventajas:**
     - Costo incrementa con volumen
     - Requiere configuración adicional
   - **Costo:** 
     - Free: 100 emails/día
     - Essentials: $19.95/mes (40k emails)
   - **Ideal para:** Emails transaccionales y marketing

#### 3. **Amazon SES (Simple Email Service)**
   - **Ventajas:**
     - Muy económico a gran escala
     - Excelente integración con AWS
     - Alta deliverability
     - Escalable
   - **Desventajas:**
     - Requiere cuenta AWS
     - Configuración más compleja
     - Sin UI, solo API
   - **Costo:** 
     - $0.10 por 1,000 emails (fuera de AWS)
     - $0.12 por 1,000 emails (desde AWS EC2)
   - **Ideal para:** Alto volumen, empresas ya en AWS

#### 4. **Resend**
   - **Ventajas:**
     - Moderno y fácil de usar
     - Excelente developer experience
     - React Email para templates
     - API simple
   - **Desventajas:**
     - Menos maduro que SendGrid
     - Plan gratuito limitado
   - **Costo:**
     - Free: 3,000 emails/mes
     - Pro: $20/mes (50k emails)
   - **Ideal para:** Proyectos modernos, developers que usan React

#### 5. **Mailgun**
   - **Ventajas:**
     - Fácil de integrar
     - API robusta
     - Analytics y tracking
     - Plan gratuito decente
   - **Desventajas:**
     - Menos popular que SendGrid
   - **Costo:**
     - Foundation: 5,000 emails/mes gratis (3 meses)
     - Growth: $35/mes (50k emails)
   - **Ideal para:** Proyectos que necesitan balance entre precio y features

#### 6. **Postmark**
   - **Ventajas:**
     - Excelente para emails transaccionales
     - Deliverability superior
     - Simple y confiable
   - **Desventajas:**
     - Más caro
     - Plan gratuito muy limitado
   - **Costo:**
     - No hay plan gratis permanente
     - $15/mes (10k emails)
   - **Ideal para:** Emails críticos (transaccionales, notificaciones)

### Recomendación para el Caso de Uso

**Para recordatorios automáticos cuando una oportunidad pasa a "congelado":**

#### Opción Recomendada: **SendGrid** o **Nodemailer con Gmail/Outlook SMTP**

**Razones:**
1. **Volumen bajo:** Para recordatorios automáticos, el volumen será relativamente bajo (dependiendo del número de oportunidades)
2. **Costo:** SendGrid free tier (100 emails/día) debería ser suficiente inicialmente
3. **Simplicidad:** Fácil de integrar y mantener
4. **Ya implementado:** Nodemailer ya está en el proyecto, solo necesita configuración

#### Implementación Sugerida:

1. **Sistema de Jobs/Cron:**
   - Usar `node-cron` o similar para ejecutar checks periódicos
   - Verificar oportunidades con estado "congelado" que excedan tiempo máximo
   - Enviar email de recordatorio

2. **Template de Email:**
   ```
   Asunto: Recordatorio - ¿Todavía estás interesado en [Tipo de Propiedad]?
   
   Hola [Nombre del Contacto],
   
   Hace X días que no hemos tenido contacto sobre tu interés en [propiedad/tipo].
   
   ¿Todavía estás interesado? Por favor, responde este email o contáctanos.
   
   [Enlace a WhatsApp] | [Enlace a Ver Propiedad]
   ```

3. **Configuración:**
   - Variable de entorno para habilitar/deshabilitar emails
   - Template configurable
   - Rate limiting para no spamear

### Casos de Uso Adicionales:

1. **Bienvenida:** Email cuando se crea una nueva oportunidad
2. **Seguimiento:** Email cuando una oportunidad no ha cambiado de estado en X días
3. **Notificaciones:** Email cuando se actualiza el estado de una oportunidad (opcional)
4. **Recordatorios de vencimiento:** Email antes de que una oportunidad se congele

### Consideraciones Legales:

- **Opt-out:** Proporcionar manera de desuscribirse
- **Consentimiento:** Asegurar que el cliente consintió recibir emails
- **LGPD/GDPR:** Cumplir con regulaciones de privacidad
- **Frecuencia:** No enviar demasiados emails para evitar spam

---

## Conclusión

1. **Campo DNI:** Recomendado como campo opcional
2. **Emails:** Recomendado usar SendGrid o Nodemailer con SMTP, implementar sistema de jobs para recordatorios automáticos

