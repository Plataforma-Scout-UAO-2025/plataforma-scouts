# Tests Bruno - HU-ING-1.2: Autenticación diferenciada por roles

Este directorio contiene las pruebas E2E para la Historia de Usuario **HU-ING-1.2 - Autenticación diferenciada por roles**.

## 🚀 Inicio Rápido

**¿Primera vez ejecutando estos tests?** Lee primero:
- 📘 **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía completa test por test con requisitos específicos
- 🔧 **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Configuración de variables de entorno
- ⚡ **[ENV_QUICK_REF.md](./ENV_QUICK_REF.md)** - Referencia rápida de variables
- 🔍 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas comunes

## Descripción
Como usuario de la plataforma, quiero que al iniciar sesión el sistema me reconozca según mi rol, para acceder solo a las funciones que me corresponden y evitar accesos indebidos.

## Criterios de aceptación cubiertos

### Criterio 1: Reconocimiento de rol en inicio de sesión
- `Login-ADMIN_GLOBAL-RoleRecognition.bru`
- `Login-ADMIN_GRUPO-RoleRecognition.bru`
- `Login-SCOUT-RoleRecognition.bru`

### Criterio 2: Acceso limitado por rol
- `ADMIN_GLOBAL-AccessToGlobalResources.bru`
- `ADMIN_GRUPO-AccessToGroupResources.bru`
- `SCOUT-AccessToMemberFunctions.bru`

### Criterio 3: Bloqueo con mensaje "Acceso denegado"
- `ADMIN_GRUPO-BlockedFromGlobalEndpoint.bru`
- `SCOUT-BlockedFromAdminAction.bru`

### Criterio 4: Usuario sin rol no accede al sistema
- `UserWithoutRole-Blocked.bru`
- `UserWithoutRole-BlockedFromDashboard.bru`

## 📊 Resumen de Tests

| # | Test | Rol Requerido | Variables Env | Respuesta Esperada |
|---|------|---------------|---------------|-------------------|
| 1 | Login-ADMIN_GLOBAL-RoleRecognition | ADMIN_GLOBAL | `baseurl` | 200 OK |
| 2 | Login-ADMIN_GRUPO-RoleRecognition | ADMIN_GRUPO | `baseurl` | 200 OK |
| 3 | Login-SCOUT-RoleRecognition | SCOUT | `baseurl`, `tenantId` | 200 OK |
| 4 | ADMIN_GLOBAL-AccessToGlobalResources | ADMIN_GLOBAL | `baseurl` | 200 OK |
| 5 | ADMIN_GRUPO-AccessToGroupResources | ADMIN_GRUPO | `baseurl` | 201 Created |
| 6 | SCOUT-AccessToMemberFunctions | SCOUT | `baseurl`, `tenantId`, `memberId` | 200 OK |
| 7 | ADMIN_GRUPO-BlockedFromGlobalEndpoint | ADMIN_GRUPO | `baseurl` | 403 Forbidden |
| 8 | SCOUT-BlockedFromAdminAction | SCOUT | `baseurl` | 403 Forbidden |
| 9 | UserWithoutRole-Blocked | Sin rol | `baseurl`, `tenantId` | 403 Forbidden |
| 10 | UserWithoutRole-BlockedFromDashboard | Sin rol | `baseurl` | 403 Forbidden |

## Prerrequisitos

### Usuarios de prueba en Auth0
Crear o configurar los siguientes usuarios en Auth0 con sus roles correspondientes:

1. **ADMIN_GLOBAL**
   - Email: `user_admin_global@example.com`
   - Rol: `ADMIN_GLOBAL`

2. **ADMIN_GRUPO**
   - Email: `user_admin_grupo@example.com`
   - Rol: `ADMIN_GRUPO`

3. **SCOUT**
   - Email: `user_scout@example.com`
   - Rol: `SCOUT`

4. **Sin rol**
   - Email: `user_no_role@example.com`
   - Sin rol asignado

### Variables de entorno
En Bruno, configurar en el environment `Local` (backend/bruno/environments/Local.bru):

**Variables públicas:**
- `baseurl`: URL base del backend
  - Ejemplo: `http://localhost:8080/`
  - Ya configurada por defecto

**Variables secretas (vars:secret):**
- `tenantId`: ID del tenant/organización para pruebas
  - Se usa en headers `X-Tenant-Id` 
  - Requerido para: tests de SCOUT y algunos de ADMIN_GRUPO
  - Obtenerlo desde: Auth0 Organizations o base de datos
  
- `memberId`: ID de un miembro existente para pruebas
  - Se usa en: `SCOUT-AccessToMemberFunctions.bru`
  - Requerido para: test de acceso a funciones de miembros
  - Obtenerlo desde: `/api/v1/members/list_members`

**Cómo configurar las variables secretas:**
1. Abre Bruno UI
2. Ve a Environments → Local
3. En la sección "Secret Variables", agrega:
   - `tenantId` = [tu-tenant-id]
   - `memberId` = [id-de-miembro-existente]

### Endpoints validados
Los tests utilizan los siguientes endpoints existentes del backend:
- `GET /api/v1/auth0/users` - Listado de usuarios (Auth0Controller)
- `GET /api/v1/auth0/roles` - Gestión de roles (Auth0Controller)
- `GET /api/v1/members/list_members` - Listado de miembros (MemberController)
- `POST /api/v1/tenants` - Creación de tenants (TenantController)

## Cómo ejecutar

### Desde Bruno UI
1. Abrir Bruno
2. Cargar la colección desde `backend/bruno/`
3. Configurar el environment `Local`
4. Autenticarse con cada usuario según el test
5. Ejecutar los tests individuales o la carpeta completa

### Desde CLI (Bruno CLI)
```bash
# Instalar Bruno CLI si no está instalado
npm install -g @usebruno/cli

# Ejecutar todos los tests de auth-roles
bru run backend/bruno/auth-roles --env Local

# Ejecutar un test específico
bru run "backend/bruno/auth-roles/Login-ADMIN_GLOBAL-RoleRecognition.bru" --env Local
```

## Estructura de tests
Cada archivo `.bru` incluye:
- **meta**: nombre y secuencia
- **request**: método, URL, headers, body (si aplica)
- **tests**: aserciones usando Chai (expect)
- **docs**: documentación completa del caso (HU, criterio, descripción, respuesta esperada, responsable)

## Notas importantes
1. **Autenticación**: Los tests usan `auth: inherit`, lo que significa que deben ejecutarse con una sesión activa en Bruno. Alternativamente, pueden configurarse tokens Bearer en el environment.
2. **Endpoints**: Todos los endpoints han sido validados contra el backend real. Se utilizan:
   - `/api/v1/auth0/users` - Gestión de usuarios Auth0
   - `/api/v1/auth0/roles` - Gestión de roles (recurso global)
   - `/api/v1/members/list_members` - Listado de miembros
   - `/api/v1/tenants` - Gestión de tenants (acción administrativa)
3. **Tokens sin rol**: Para probar el usuario sin rol, se necesita un token válido de Auth0 pero sin roles asignados en la Management API.

## Responsable
QA Team - Plataforma Scout UAO

## Última actualización
2025-10-14
