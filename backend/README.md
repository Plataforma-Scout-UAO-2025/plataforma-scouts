# Plataforma Scouts - Backend

Monolítico modular con Spring Boot + Supabase Storage + PostgreSQL.

## 🚀 **Inicio Rápido**

### **Desarrollo**
*Estando en la carpeta backend*
```bash
# Copiar plantilla de variables
cp .env.example .env.local

# Configurar credenciales reales en .env.local
# Ejecutar aplicación
./mvnw spring-boot:run
```

### **QA Testing**
*Estando en la carpeta backend*
```bash
# Configurar perfil QA
export SPRING_PROFILES_ACTIVE=qa

# Ejecutar con endpoints de testing
./mvnw spring-boot:run
```

## 📋 **Variables Requeridas (.env.local)**
```env
SUPABASE_JDBC_URL=jdbc:postgresql://db.YOUR_PROJECT.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=YOUR_PASSWORD
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY
```

## 🧪 **Testing**
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **Health Check**: `http://localhost:8080/api/v1/qa/test/health`
- **QA Endpoints**: Solo disponibles en perfiles `development` y `qa`

## 📁 **Estructura**
```
src/main/java/uao/edu/co/scouts_project/
├── auth/           # Autenticación
├── common/         # DTOs, Services, Controllers comunes
├── config/         # Configuración Supabase, Security
└── [módulos]/      # Funcionalidades específicas
```

## ⚡ **Tecnologías**
- Java 21 + Spring Boot 3.5.5
- PostgreSQL (Supabase)
- Supabase Storage (images/files)
- Liquibase (migraciones)
- Swagger/OpenAPI 3
- Lombok
