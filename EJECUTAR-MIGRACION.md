# 🚀 Cómo Ejecutar la Migración de Oportunidades

Tu PostgreSQL está instalado en: `C:\Program Files\PostgreSQL\18`

## Método 1: Comando PowerShell Directo (MÁS RÁPIDO) ⚡

Abre PowerShell en `C:\projects\imb` y ejecuta:

```powershell
# CAMBIA "tu_contraseña" por tu contraseña real de PostgreSQL
$env:PGPASSWORD="tu_contraseña"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d 2fa_auth -f "back\src\database\migrations\004_opportunities.sql"
```

### ✅ Si todo sale bien verás:

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
CREATE FUNCTION
CREATE TRIGGER
```

---

## Método 2: Script PowerShell Interactivo

```powershell
cd C:\projects\imb
.\run-migration.ps1
```

El script te pedirá:
- Host: `[Enter]` (usa localhost por defecto)
- Puerto: `[Enter]` (usa 5432 por defecto)
- Base de datos: `[Enter]` (usa 2fa_auth por defecto)
- Usuario: `[Enter]` (usa postgres por defecto)
- Contraseña: `*******` (escribe tu contraseña)

---

## Método 3: Script Node.js

```powershell
# 1. Edita el archivo
notepad C:\projects\imb\wapp\setup-database.js

# 2. En la línea 10, cambia:
#    password: 'postgres',
#    por tu contraseña real

# 3. Ejecuta:
cd C:\projects\imb\wapp
node setup-database.js
```

---

## Método 4: pgAdmin (Interfaz Gráfica)

1. Abre **pgAdmin**
2. Conéctate a tu servidor PostgreSQL
3. Expande el servidor → Databases → `2fa_auth`
4. Click derecho en `2fa_auth` → **Query Tool**
5. Menú → File → Open → Selecciona:
   ```
   C:\projects\imb\back\src\database\migrations\004_opportunities.sql
   ```
6. Presiona **F5** o click en el botón ▶ **Execute**
7. ¡Listo!

---

## 🐛 Problemas Comunes

### Error: "database 2fa_auth does not exist"

La base de datos no existe. Créala primero:

```powershell
$env:PGPASSWORD="tu_contraseña"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE 2fa_auth;"
```

### Error: "authentication failed"

La contraseña es incorrecta. Verifica tu contraseña de PostgreSQL.

### Error: "relation properties does not exist"

Primero necesitas ejecutar las migraciones anteriores. Ejecuta el script de inicialización de la base de datos.

### Error: "table already exists"

¡Perfecto! La tabla ya está creada. Puedes continuar.

---

## ✅ Verificar que Funcionó

Después de ejecutar la migración, verifica:

```powershell
$env:PGPASSWORD="tu_contraseña"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d 2fa_auth -c "SELECT COUNT(*) FROM opportunities;"
```

Deberías ver:
```
 count 
-------
     0
(1 row)
```

---

## 🎉 Siguientes Pasos

Una vez que la migración esté completa:

### 1. Inicia el servidor wapp

```powershell
cd C:\projects\imb\wapp
npm start
```

Deberías ver:
```
================================================
WhatsApp Business Webhook Server
================================================
Server running on port 3005
```

### 2. Inicia el frontend (nueva terminal)

```powershell
cd C:\projects\imb\front
npm start
```

### 3. Crea una oportunidad de prueba (nueva terminal)

```powershell
curl -X POST http://localhost:3005/opportunities/test/from-website -H "Content-Type: application/json" -d '{\"property_id\": 1, \"email\": \"test@example.com\", \"mobile\": \"+54 9 11 1234-5678\", \"contact_name\": \"Test User\", \"opportunity_type\": \"sale\", \"initial_message\": \"Prueba del sistema\"}'
```

### 4. Ver el tablero

Abre tu navegador en:
```
http://localhost:3000/oportunidades
```

Deberías ver:
- ✅ Tablero Kanban con 8 columnas
- ✅ Tabs para "Ventas" y "Alquileres"
- ✅ Tu oportunidad de prueba en "Pendiente a Contactar"
- ✅ Drag & drop funcionando

---

## 💡 Tip: Agregar PostgreSQL al PATH (Opcional)

Para poder usar `psql` desde cualquier lugar sin escribir la ruta completa:

1. Abre: Panel de Control → Sistema → Configuración avanzada del sistema
2. Variables de entorno
3. En "Variables del sistema" busca `Path` y click en Editar
4. Click en "Nuevo" y agrega:
   ```
   C:\Program Files\PostgreSQL\18\bin
   ```
5. Click OK en todo
6. Reinicia PowerShell

Ahora podrás usar:
```powershell
psql -U postgres -d 2fa_auth -f archivo.sql
```

---

¿Cuál método prefieres usar? Te recomiendo el **Método 1** (comando directo) por ser el más rápido. 🚀

