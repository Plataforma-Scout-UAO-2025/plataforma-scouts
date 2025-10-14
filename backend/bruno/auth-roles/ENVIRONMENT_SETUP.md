# Variables de Entorno para Tests de Auth-Roles

## Configuración en Bruno UI

Estas variables deben configurarse en el environment **Local** de Bruno:
`backend/bruno/environments/Local.bru`

### 📌 Variables Públicas (vars)

```
baseurl: http://localhost:8080/
```

### 🔐 Variables Secretas (vars:secret)

Las siguientes variables deben agregarse manualmente en Bruno UI:

#### tenantId
- **Descripción**: ID del tenant/organización para las pruebas
- **Uso**: Header `X-Tenant-Id` en requests que requieren contexto multi-tenant
- **Tests que lo usan**:
  - `Login-SCOUT-RoleRecognition.bru`
  - `SCOUT-AccessToMemberFunctions.bru`
  - `UserWithoutRole-Blocked.bru`
- **Cómo obtenerlo**: 
  - Desde Auth0 Organizations: `org_xxxxxxxxxxxxx`
  - O desde la tabla `tenants` en la base de datos

#### memberId
- **Descripción**: ID de un miembro existente en el sistema
- **Uso**: Query parameter `member_id` en endpoints de miembros
- **Tests que lo usan**:
  - `SCOUT-AccessToMemberFunctions.bru`
- **Cómo obtenerlo**: 
  - Hacer GET a `/api/v1/members/list_members` con token válido
  - Copiar el `id` de cualquier miembro de la respuesta

---

## 🚀 Pasos para Configurar

### Opción 1: Desde Bruno UI (Recomendado)
1. Abre Bruno
2. Carga la colección desde `backend/bruno/`
3. Click en "Environments" (panel izquierdo)
4. Selecciona "Local"
5. En la sección "Secret Variables", agrega:
   ```
   tenantId: org_tu_organization_id
   memberId: 123e4567-e89b-12d3-a456-426614174000
   ```
6. Guarda los cambios

### Opción 2: Editar archivo directamente
Edita `backend/bruno/environments/Local.bru`:

```plaintext
vars {
  baseurl: http://localhost:8080/
}
vars:secret [
  tenantId,
  memberId
]
```

Luego, en Bruno UI, agrega los valores de las variables secretas.

---

## 📝 Valores de Ejemplo

```
tenantId: org_6B3k4dao2Wf6eGxa
memberId: 550e8400-e29b-41d4-a716-446655440000
```

**⚠️ Importante**: Estos son solo ejemplos. Debes usar valores reales de tu entorno de desarrollo.

---

## ✅ Verificación

Para verificar que las variables están configuradas:

1. Abre cualquier test en Bruno
2. En la pestaña "Vars", deberías ver:
   - `baseurl` con su valor
   - `tenantId` con valor (oculto por ser secreta)
   - `memberId` con valor (oculto por ser secreta)

3. Ejecuta `Login-SCOUT-RoleRecognition.bru` - si no hay errores de variables, está correcto.
