# Guía de Ejecución por Test - HU-ING-1.2

## 🎯 Matriz de Ejecución de Tests

Esta guía especifica **exactamente** qué necesitas para ejecutar cada test exitosamente.

---

## 📋 Criterio 1: Reconocimiento de Rol

### Test 1: `Login-ADMIN_GLOBAL-RoleRecognition.bru`

**Objetivo**: Verificar que un usuario ADMIN_GLOBAL es reconocido al listar usuarios

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `ADMIN_GLOBAL` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/auth0/users` |
| **Headers** | `Authorization: Bearer {token}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 200 OK con lista de usuarios |
| **Validación** | `res.status === 200` |

**Pasos para ejecutar:**
1. Obtén token de usuario con rol ADMIN_GLOBAL desde Auth0
2. En Bruno: Auth → Bearer Token → pega el token
3. Ejecuta el test
4. ✅ Debe retornar 200 con lista de usuarios

---

### Test 2: `Login-ADMIN_GRUPO-RoleRecognition.bru`

**Objetivo**: Verificar que un usuario ADMIN_GRUPO puede listar tenants

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `ADMIN_GRUPO` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/tenants` |
| **Headers** | `Authorization: Bearer {token}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No (lista todos) |
| **Respuesta esperada** | 200 OK con lista de tenants |
| **Validación** | `res.status === 200` |

**Pasos para ejecutar:**
1. Obtén token de usuario con rol ADMIN_GRUPO desde Auth0
2. En Bruno: Auth → Bearer Token → pega el token
3. Ejecuta el test
4. ✅ Debe retornar 200 con lista de tenants

---

### Test 3: `Login-SCOUT-RoleRecognition.bru`

**Objetivo**: Verificar que un usuario SCOUT puede listar miembros de su tenant

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `SCOUT` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/members/list_members` |
| **Headers** | `Authorization: Bearer {token}`<br>`X-Tenant-Id: {tenantId}` |
| **Variables env** | `baseurl`, `tenantId` ⚠️ |
| **Tenant requerido** | ✅ Sí - debe ser el tenant al que pertenece el usuario |
| **Respuesta esperada** | 200 OK con lista de miembros |
| **Validación** | `res.status === 200` |

**Pasos para ejecutar:**
1. Obtén token de usuario SCOUT desde Auth0
2. Identifica el organization ID del usuario (ej: `org_6B3k4dao2Wf6eGxa`)
3. En Bruno Environment: configura `tenantId` con ese organization ID
4. En Bruno: Auth → Bearer Token → pega el token
5. Ejecuta el test
6. ✅ Debe retornar 200 con miembros del tenant

---

## 📋 Criterio 2: Acceso Autorizado

### Test 4: `ADMIN_GLOBAL-AccessToGlobalResources.bru`

**Objetivo**: Verificar que ADMIN_GLOBAL puede acceder a recursos globales (roles)

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `ADMIN_GLOBAL` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/auth0/roles` |
| **Headers** | `Authorization: Bearer {token}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 200 OK con lista de roles |
| **Validación** | `res.status === 200` |

**Pasos para ejecutar:**
1. Usa el mismo token de ADMIN_GLOBAL del Test 1
2. Ejecuta el test
3. ✅ Debe retornar 200 con roles disponibles

---

### Test 5: `ADMIN_GRUPO-AccessToGroupResources.bru`

**Objetivo**: Verificar que ADMIN_GRUPO puede crear tenants

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `ADMIN_GRUPO` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `POST /api/v1/tenants` |
| **Headers** | `Authorization: Bearer {token}`<br>`Content-Type: application/json` |
| **Body** | `{"name": "Test Tenant", "description": "Test"}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 201 Created o 200 OK |
| **Validación** | `res.status === 200 || res.status === 201` |

**Pasos para ejecutar:**
1. Usa el mismo token de ADMIN_GRUPO del Test 2
2. Ejecuta el test
3. ✅ Debe retornar 201/200 indicando creación exitosa
4. ⚠️ Si falla con 409 Conflict, el tenant ya existe (cambiar nombre en body)

---

### Test 6: `SCOUT-AccessToMemberFunctions.bru`

**Objetivo**: Verificar que SCOUT puede consultar información de un miembro específico

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `SCOUT` asignado |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/members/list_member_by_id?member_id={memberId}` |
| **Headers** | `Authorization: Bearer {token}`<br>`X-Tenant-Id: {tenantId}` |
| **Variables env** | `baseurl`, `tenantId`, `memberId` ⚠️⚠️ |
| **Tenant requerido** | ✅ Sí - del usuario SCOUT |
| **memberId requerido** | ✅ Sí - debe existir en ese tenant |
| **Respuesta esperada** | 200 OK con datos del miembro |
| **Validación** | `res.status === 200` |

**Pasos para ejecutar:**
1. Usa el token de SCOUT del Test 3
2. Asegúrate que `tenantId` esté configurado (organization ID del usuario)
3. **IMPORTANTE**: Necesitas un `memberId` real:
   - Ejecuta primero `Login-SCOUT-RoleRecognition.bru` para obtener lista
   - Copia el `id` de cualquier miembro de la respuesta
   - En Bruno Environment: configura `memberId` con ese ID
4. Ejecuta el test
5. ✅ Debe retornar 200 con información del miembro

---

## 📋 Criterio 3: Bloqueo de Acceso No Autorizado

### Test 7: `ADMIN_GRUPO-BlockedFromGlobalEndpoint.bru`

**Objetivo**: Verificar que ADMIN_GRUPO NO puede acceder a recursos globales

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `ADMIN_GRUPO` (sin ADMIN_GLOBAL) |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `GET /api/v1/auth0/roles` |
| **Headers** | `Authorization: Bearer {token}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 403 Forbidden |
| **Validación** | `res.status === 403` |

**Pasos para ejecutar:**
1. Usa el token de ADMIN_GRUPO del Test 2
2. Ejecuta el test
3. ✅ Debe retornar 403 (acceso denegado)
4. ❌ Si retorna 200, el usuario tiene permisos que no debería

---

### Test 8: `SCOUT-BlockedFromAdminAction.bru`

**Objetivo**: Verificar que SCOUT NO puede crear tenants

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email con rol `SCOUT` (sin rol admin) |
| **Token** | Token JWT válido de ese usuario |
| **Endpoint** | `POST /api/v1/tenants` |
| **Headers** | `Authorization: Bearer {token}`<br>`Content-Type: application/json` |
| **Body** | `{"name": "Test Tenant", "description": "Test"}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 403 Forbidden |
| **Validación** | `res.status === 403` |

**Pasos para ejecutar:**
1. Usa el token de SCOUT del Test 3
2. Ejecuta el test
3. ✅ Debe retornar 403 (acceso denegado)
4. ❌ Si retorna 201/200, el usuario tiene permisos que no debería

---

## 📋 Criterio 4: Usuario Sin Rol Bloqueado

### Test 9: `UserWithoutRole-Blocked.bru`

**Objetivo**: Verificar que un usuario SIN rol asignado NO puede listar miembros

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email SIN ningún rol asignado |
| **Token** | Token JWT válido de ese usuario (sin roles) |
| **Endpoint** | `GET /api/v1/members/list_members` |
| **Headers** | `Authorization: Bearer {token}`<br>`X-Tenant-Id: {tenantId}` |
| **Variables env** | `baseurl`, `tenantId` ⚠️ |
| **Tenant requerido** | ✅ Sí - cualquier tenant válido |
| **Respuesta esperada** | 403 Forbidden |
| **Validación** | `res.status === 403` |

**Pasos para ejecutar:**
1. Crea un usuario en Auth0 SIN asignarle ningún rol
2. Obtén token de ese usuario
3. Configura `tenantId` en environment
4. En Bruno: Auth → Bearer Token → pega el token
5. Ejecuta el test
6. ✅ Debe retornar 403 (acceso denegado)

---

### Test 10: `UserWithoutRole-BlockedFromDashboard.bru`

**Objetivo**: Verificar que un usuario SIN rol NO puede listar tenants

| Campo | Valor Requerido |
|-------|-----------------|
| **Usuario Auth0** | Email SIN ningún rol asignado |
| **Token** | Token JWT válido de ese usuario (sin roles) |
| **Endpoint** | `GET /api/v1/tenants` |
| **Headers** | `Authorization: Bearer {token}` |
| **Variables env** | `baseurl` |
| **Tenant requerido** | ❌ No |
| **Respuesta esperada** | 403 Forbidden |
| **Validación** | `res.status === 403` |

**Pasos para ejecutar:**
1. Usa el mismo token del usuario sin rol del Test 9
2. Ejecuta el test
3. ✅ Debe retornar 403 (acceso denegado)

---

## 🔑 Cómo Obtener Tokens

### Opción 1: Desde Auth0 Test Application
1. Ve a Auth0 Dashboard → Applications → [Tu App] → Quick Start
2. Click en "Test" tab
3. Obtendrás un token de prueba
4. ⚠️ Asegúrate que el usuario tenga el rol correcto asignado

### Opción 2: Desde el Frontend (Recomendado)
1. Ejecuta el frontend: `cd frontend && npm run dev`
2. Abre DevTools → Network tab
3. Haz login con el usuario correspondiente
4. Busca cualquier request a la API
5. Copia el valor del header `Authorization: Bearer {token}`
6. Pégalo en Bruno

### Opción 3: Usando Auth0 Management API
```bash
curl --request POST \
  --url https://YOUR_DOMAIN.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET","audience":"YOUR_API_IDENTIFIER","grant_type":"client_credentials"}'
```

---

## 🔍 Cómo Obtener Variables

### tenantId
```bash
# Desde Auth0 Dashboard:
Organizations → [Tu Org] → Settings → Organization ID
# Ejemplo: org_6B3k4dao2Wf6eGxa

# O desde el frontend:
# Ver en frontend/src/app/routes/Home.tsx las organizaciones configuradas
```

### memberId
```bash
# Método 1: Ejecutar test de lista en Bruno
1. Ejecuta Login-SCOUT-RoleRecognition.bru con token válido
2. En la respuesta, copia cualquier "id" de la lista de miembros
3. Ejemplo: "550e8400-e29b-41d4-a716-446655440000"

# Método 2: Consultar la base de datos
SELECT id FROM members WHERE tenant_id = 'tu-tenant-id' LIMIT 1;
```

---

## ⚠️ Problemas Comunes

### Error: "{{tenantId}} is not defined"
**Solución**: Configura la variable en Bruno UI → Environments → Local → Secret Variables

### Error: 401 Unauthorized
**Solución**: Tu token expiró o es inválido. Genera uno nuevo desde Auth0/Frontend

### Error: 403 Forbidden (en tests de acceso autorizado)
**Solución**: El usuario no tiene el rol correcto asignado. Verifica en Auth0 Dashboard

### Error: 404 Not Found (memberId)
**Solución**: El memberId no existe o no pertenece al tenant. Usa un ID válido

### Error: 400 Bad Request (tenantId)
**Solución**: El tenantId es inválido. Verifica que sea un organization ID de Auth0

---

## ✅ Checklist Pre-Ejecución

Antes de ejecutar los tests, verifica:

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] Tienes 3 usuarios en Auth0:
  - [ ] Usuario con rol `ADMIN_GLOBAL`
  - [ ] Usuario con rol `ADMIN_GRUPO`
  - [ ] Usuario con rol `SCOUT`
  - [ ] Usuario SIN rol (para tests 9-10)
- [ ] Variables configuradas en Bruno:
  - [ ] `baseurl` = `http://localhost:8080/`
  - [ ] `tenantId` = organization ID válido (ej: `org_6B3k4dao2Wf6eGxa`)
  - [ ] `memberId` = ID de miembro existente en ese tenant
- [ ] Tokens válidos obtenidos desde Auth0/Frontend

---

## 🎯 Orden Recomendado de Ejecución

1. **Primero**: Tests de reconocimiento (1, 2, 3) - para validar tokens
2. **Segundo**: Tests de acceso autorizado (4, 5, 6) - para validar permisos
3. **Tercero**: Tests de bloqueo (7, 8) - para validar restricciones
4. **Cuarto**: Tests sin rol (9, 10) - para validar seguridad

---

## 📞 Soporte

Si un test falla:
1. Verifica que el usuario tenga el rol correcto en Auth0
2. Verifica que el token no haya expirado (duración ~24h)
3. Verifica que las variables de entorno estén configuradas
4. Revisa los logs del backend para ver el error exacto
