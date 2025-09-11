# Plataforma Scouts - Backend (Spring Boot)

## 1. Objetivo
Backend monolítico modular (miembros, progresion, eventos, finanzas, auth, common) listo para incorporar modelos y lógica. Actualmente sólo contiene esqueletos (controller, service, repository, dto, mapper) y configuración para PostgreSQL (Supabase) + Auth0.

## 2. Requisitos
- Java 21 (Temurin / OpenJDK) instalado y en PATH  
- Maven 3.9+  
- Cuenta / credenciales: Supabase (DB + Storage) y Auth0 (tenant / API)  
- Git (opcional para flujo colaborativo)  

Verifica versiones:
```powershell
java -version
mvn -version
```

## 3. Estructura (módulos funcionales)
```
src/main/java/uao/edu/co/scouts_project/
  miembros/ (controller, service, repository, model, dto, mapper)
  progresion/
  eventos/
  finanzas/
  auth/
  common/
  api/ (futuras integraciones transversales si aplica)
```

## 4. Variables de Entorno (mínimas)
| Variable | Descripción |
|----------|-------------|
| SUPABASE_JDBC_URL | JDBC completo (incluye host, puerto y DB) |
| SUPABASE_DB_USER | Usuario DB |
| SUPABASE_DB_PASSWORD | Password DB |
| PORT | Puerto HTTP (opcional, default 8080) |

### 4.1 Ejemplo PowerShell (Windows)
```powershell
$env:SUPABASE_JDBC_URL = "jdbc:postgresql://db.XYZ.supabase.co:5432/postgres"
$env:SUPABASE_DB_USER = "postgres"
$env:SUPABASE_DB_PASSWORD = "REEMPLAZAR"
$env:PORT = "8080"
```

### 4.3 Archivo .env (opcional)
(Si luego usas un loader de entorno)
```
SUPABASE_JDBC_URL=jdbc:postgresql://db.XYZ.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=REEMPLAZAR
PORT=8080
```

## 5. Configuración Clave (`application.properties`)
(Ya incluido)
```properties
spring.datasource.url=${SUPABASE_JDBC_URL}
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
spring.liquibase.change-log=classpath:db/changelog/master.xml
```

## 6. Construcción y Ejecución
### 6.1 Ejecutar directamente (desarrollo)
```powershell
mvn spring-boot:run
```


© Proyecto académico Scouts
