# Tests Bruno - HU-ING-1.2: Autenticación diferenciada por roles

Este directorio contiene las pruebas E2E para la Historia de Usuario **HU-ING-1.2 - Autenticación diferenciada por roles**.

## Descripción
Como usuario de la plataforma, quiero que al iniciar sesión el sistema me reconozca según mi rol, para acceder solo a las funciones que me corresponden y evitar accesos indebidos.

## Criterios de aceptación cubiertos

### Criterio 1: Reconocimiento de rol en inicio de sesión
- `Login ADMIN_GLOBAL - Role Recognition.bru`
- `Login ADMIN_GRUPO - Role Recognition.bru`
- `Login SCOUT - Role Recognition.bru`

### Criterio 2: Acceso limitado por rol
- `ADMIN_GLOBAL Access to Global Resources.bru`
- `ADMIN_GRUPO Access to Group Resources.bru`
- `SCOUT Access to Member Functions.bru`

### Criterio 3: Bloqueo con mensaje "Acceso denegado"
- `ADMIN_GRUPO Blocked from Global Endpoint.bru`
- `SCOUT Blocked from Admin Action.bru`

### Criterio 4: Usuario sin rol no accede al sistema
- `User Without Role Blocked.bru`
- `User Without Role Blocked from Dashboard.bru`

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
En Bruno, configurar en el environment `Local`:
- `baseurl`: URL base del backend (ej: `http://localhost:8080/`)
- `tenantId`: ID del tenant para pruebas (si aplica)
- `groupId`: ID de grupo para pruebas de ADMIN_GRUPO
- `memberId`: ID de miembro para pruebas de SCOUT

### Endpoint requerido
Los tests asumen la existencia del endpoint:
- `GET /api/v1/auth/me` - Retorna información del usuario autenticado (id, email, roles, orgId)

Si este endpoint no existe, debe implementarse antes de ejecutar los tests.

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
bru run "backend/bruno/auth-roles/Login ADMIN_GLOBAL - Role Recognition.bru" --env Local
```

## Estructura de tests
Cada archivo `.bru` incluye:
- **meta**: nombre y secuencia
- **request**: método, URL, headers, body (si aplica)
- **tests**: aserciones usando Chai (expect)
- **docs**: documentación completa del caso (HU, criterio, descripción, respuesta esperada, responsable)

## Notas importantes
1. **Autenticación**: Los tests usan `auth: inherit`, lo que significa que deben ejecutarse con una sesión activa en Bruno. Alternativamente, pueden configurarse tokens Bearer en el environment.
2. **Endpoints**: Algunos endpoints (`/api/v1/admin/global`, `/api/v1/group/{groupId}/settings`) son ejemplos genéricos. Ajustarlos según los endpoints reales del backend.
3. **Tokens sin rol**: Para probar el usuario sin rol, se necesita un token válido de Auth0 pero sin roles asignados en la Management API.

## Responsable
QA Team - Plataforma Scout UAO

## Última actualización
2025-10-14
