# 🔗 Vinculación de Oportunidades con Usuarios

## 📋 Cómo Funciona la Asignación

### **Flujo Completo:**

1. **Oportunidad Creada (Sin Usuario):**
   - Una oportunidad se crea desde el sitio web o WhatsApp
   - Tiene `user_id = NULL` (no asignada)
   - **Visible para TODOS los usuarios** en estado "pending_contact"

2. **Usuario Abre el Chat:**
   - Usuario hace clic en una notificación o abre el chat
   - Selecciona una conversación por número de teléfono
   - **Automáticamente se asigna:**
     - ✅ Todos los mensajes de ese teléfono → `user_id = usuario actual`
     - ✅ Todas las oportunidades relacionadas (por teléfono) → `user_id = usuario actual`

3. **Resultado:**
   - La oportunidad **deja de ser visible** para otros usuarios
   - Solo el usuario que inició el chat puede verla
   - Los mensajes también quedan asignados a ese usuario

---

## 🔧 Implementación Técnica

### **1. Base de Datos**

**Migración:** `back/src/database/migrations/008_opportunities_user_assignment.sql`

```sql
-- Agrega user_id a oportunidades
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
```

**Significado:**
- `user_id = NULL` → Oportunidad sin asignar, visible para todos
- `user_id = X` → Oportunidad asignada al usuario X, solo visible para él (y admin/backoffice)

### **2. Asignación Automática**

**Endpoint:** `POST /conversations/:phoneNumber/assign`

Cuando un usuario abre un chat:
1. Se asignan los mensajes de WhatsApp
2. **Se buscan oportunidades relacionadas** por:
   - `phone` (teléfono)
   - `mobile` (móvil)
3. Se asignan automáticamente al usuario

**Código:**
```javascript
// Asigna mensajes
UPDATE whatsapp_messages
SET user_id = $1
WHERE message_from = $2 AND (user_id IS NULL OR user_id = $1)

// Asigna oportunidades relacionadas
UPDATE opportunities
SET user_id = $1, updated_at = NOW()
WHERE (phone = $2 OR mobile = $2)
  AND (user_id IS NULL OR user_id = $1)
```

### **3. Filtrado por Usuario**

**Endpoint:** `GET /opportunities`

**Para usuarios normales:**
```sql
WHERE (user_id = $1 OR user_id IS NULL)
```
- Ven sus oportunidades asignadas
- Ven oportunidades sin asignar (pending_contact)

**Para admin/backoffice:**
```sql
WHERE 1=1  -- Ven todas
```
- Ven todas las oportunidades (asignadas y sin asignar)

---

## 📱 Flujo de Usuario

### **Escenario: Oportunidad Pendiente**

1. **Cliente envía mensaje por WhatsApp:**
   ```
   "Hola, quiero comprar una casa"
   ```

2. **Sistema crea:**
   - ✅ Mensaje en `whatsapp_messages` (user_id = NULL)
   - ✅ Oportunidad en `opportunities` (user_id = NULL, status = 'pending_contact')

3. **Todos los usuarios ven:**
   - ✅ La notificación en "Notificaciones"
   - ✅ La oportunidad en "Oportunidades" → "pending_contact"

4. **Usuario Pepe hace clic:**
   - Clic en notificación → Abre chat
   - O clic en "Chat" → Selecciona conversación

5. **Asignación automática:**
   - ✅ Mensajes asignados a Pepe
   - ✅ Oportunidad asignada a Pepe
   - ✅ Oportunidad desaparece para otros usuarios

6. **Usuario Raúl:**
   - ❌ Ya NO ve la oportunidad
   - ❌ Ya NO ve los mensajes
   - ✅ Solo ve sus propias oportunidades/mensajes

---

## 🎯 Reglas de Visibilidad

### **Oportunidades:**

| Estado | user_id | Visible Para |
|--------|---------|--------------|
| `pending_contact` | `NULL` | **Todos los usuarios** |
| `pending_contact` | `X` | **Solo usuario X** (y admin) |
| `waiting_response` | `X` | **Solo usuario X** (y admin) |
| `evolved` | `X` | **Solo usuario X** (y admin) |
| ... | `X` | **Solo usuario X** (y admin) |

### **Mensajes:**

| user_id | Visible Para |
|---------|--------------|
| `NULL` | **Todos los usuarios** (mensajes sin asignar) |
| `X` | **Solo usuario X** (y admin) |

---

## 🔄 Casos Especiales

### **1. Oportunidad sin Mensajes de WhatsApp:**
- Oportunidad creada desde sitio web
- No hay mensajes de WhatsApp aún
- Se asigna cuando el usuario **envía el primer mensaje** desde el chat

### **2. Múltiples Oportunidades con Mismo Teléfono:**
- Si hay varias oportunidades con el mismo teléfono
- **Todas se asignan** cuando el usuario abre el chat
- Ejemplo: Cliente tiene oportunidad de venta Y alquiler → Ambas se asignan

### **3. Usuario ya Asignado:**
- Si una oportunidad ya tiene `user_id = X`
- Otro usuario NO puede asignarla
- Solo el usuario X (o admin) puede verla

### **4. Admin/Backoffice:**
- Ven todas las oportunidades (asignadas y sin asignar)
- Pueden ver conversaciones de todos los usuarios
- (Implementación futura)

---

## 🚀 Configuración

### **1. Ejecutar Migración:**

```sql
-- En Supabase SQL Editor o PostgreSQL local
\i back/src/database/migrations/008_opportunities_user_assignment.sql
```

### **2. Verificar:**

```sql
-- Ver oportunidades sin asignar
SELECT * FROM opportunities WHERE user_id IS NULL;

-- Ver oportunidades asignadas a un usuario
SELECT * FROM opportunities WHERE user_id = 1;
```

---

## ✅ Testing

### **Test 1: Asignación Automática**

1. Crear oportunidad sin asignar:
   ```sql
   INSERT INTO opportunities (phone, opportunity_type, status)
   VALUES ('5491234567890', 'sale', 'pending_contact');
   ```

2. Usuario Pepe abre chat con ese teléfono
3. Verificar:
   ```sql
   SELECT user_id FROM opportunities WHERE phone = '5491234567890';
   -- Debe ser el ID de Pepe
   ```

### **Test 2: Visibilidad**

1. Usuario Pepe asigna oportunidad
2. Usuario Raúl consulta `/opportunities`
3. Verificar: Raúl NO ve la oportunidad de Pepe

### **Test 3: Múltiples Oportunidades**

1. Crear 2 oportunidades con mismo teléfono
2. Usuario abre chat
3. Verificar: Ambas oportunidades se asignan

---

## 🐛 Troubleshooting

### **"Oportunidad no se asigna":**

**Causas posibles:**
- Teléfono no coincide (formato diferente)
- Oportunidad ya asignada a otro usuario
- Error en la consulta SQL

**Solución:**
```sql
-- Verificar formato de teléfono
SELECT phone, mobile FROM opportunities WHERE id = X;

-- Verificar si ya está asignada
SELECT user_id FROM opportunities WHERE id = X;
```

### **"Oportunidad visible para todos":**

**Causa:** `user_id` es NULL

**Solución:** Abrir el chat desde esa conversación para asignarla

### **"No puedo ver mis oportunidades":**

**Causa:** Filtro de usuario no funciona

**Solución:** Verificar que `authenticateToken` está aplicado al endpoint

---

## 📝 Resumen

✅ **Oportunidades sin asignar** → Visibles para todos  
✅ **Usuario abre chat** → Asignación automática  
✅ **Oportunidad asignada** → Solo visible para ese usuario  
✅ **Admin/Backoffice** → Ven todas (futuro)  

**Resultado:** Cuando alguien comienza a hablar con un cliente, la oportunidad deja de ser visible para otros usuarios automáticamente.

---

**¿Preguntas?** Revisa el código o pregunta si necesitas más detalles.


