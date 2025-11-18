# Script PowerShell para ejecutar la migración de Oportunidades
# Ejecutar con: .\run-migration.ps1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Migración de Oportunidades" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar psql.exe en las ubicaciones comunes
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlExe = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlExe = $path
        Write-Host "✓ Encontrado psql en: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlExe) {
    Write-Host "❌ No se encontró psql.exe automáticamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "Buscando en todo el disco (puede tardar un momento)..." -ForegroundColor Yellow
    
    $found = Get-ChildItem -Path "C:\Program Files" -Filter psql.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($found) {
        $psqlExe = $found.FullName
        Write-Host "✓ Encontrado en: $psqlExe" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "No se pudo encontrar psql.exe" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternativas:" -ForegroundColor Yellow
        Write-Host "1. Edita c:\projects\imb\wapp\setup-database.js y ejecuta: node setup-database.js"
        Write-Host "2. Usa pgAdmin para ejecutar el SQL manualmente"
        Write-Host ""
        exit 1
    }
}

Write-Host ""

# Solicitar credenciales
$dbHost = Read-Host "Host [localhost]"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Puerto [5432]"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbName = Read-Host "Base de datos [2fa_auth]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "2fa_auth" }

$dbUser = Read-Host "Usuario [postgres]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Contraseña" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "🔄 Ejecutando migración..." -ForegroundColor Cyan
Write-Host ""

# Ruta al archivo SQL
$sqlFile = Join-Path $PSScriptRoot "back\src\database\migrations\004_opportunities.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ No se encontró el archivo SQL en: $sqlFile" -ForegroundColor Red
    exit 1
}

# Establecer variable de entorno para la contraseña
$env:PGPASSWORD = $PlainPassword

try {
    # Ejecutar psql
    & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "  ✅ Migración completada exitosamente!" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. cd wapp; npm start  (iniciar servidor)" -ForegroundColor White
        Write-Host "2. cd front; npm start  (iniciar frontend)" -ForegroundColor White
        Write-Host "3. Ir a http://localhost:3000/oportunidades" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar la migración" -ForegroundColor Red
        Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
    }
} finally {
    # Limpiar la contraseña de la variable de entorno
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

