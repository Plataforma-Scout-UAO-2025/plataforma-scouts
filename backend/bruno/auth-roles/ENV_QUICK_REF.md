# Quick Reference - Environment Variables

## 🔧 Variables Requeridas

| Variable | Tipo | Valor por Defecto | Descripción |
|----------|------|-------------------|-------------|
| `baseurl` | Public | `http://localhost:8080/` | URL base del backend |
| `tenantId` | Secret | *(debes configurar)* | ID de organización Auth0 |
| `memberId` | Secret | *(debes configurar)* | ID de miembro existente |

## 📍 Ubicación

**Archivo**: `backend/bruno/environments/Local.bru`

## ⚡ Configuración Rápida

### En Bruno UI:
1. Environments → Local
2. Secret Variables:
   - `tenantId` = `org_tu_organization_id` 
   - `memberId` = `uuid-del-miembro`

### Obtener valores:

#### tenantId
```bash
# Desde Auth0 Dashboard:
Auth0 Dashboard → Organizations → [Tu Organización] → Settings → Organization ID
```

#### memberId  
```bash
# Desde la API (necesitas token válido):
GET http://localhost:8080/api/v1/members/list_members
Header: X-Tenant-Id: {tenantId}
Header: Authorization: Bearer {token}

# Copiar el "id" de cualquier miembro de la respuesta
```

## 📋 Tests que las Usan

### tenantId
- ✅ Login-SCOUT-RoleRecognition.bru
- ✅ SCOUT-AccessToMemberFunctions.bru  
- ✅ UserWithoutRole-Blocked.bru

### memberId
- ✅ SCOUT-AccessToMemberFunctions.bru

### baseurl (todas)
- ✅ Todos los 10 tests

---

💡 **Tip**: Si ves errores como `{{tenantId}} is not defined`, significa que no has configurado las variables secretas en Bruno UI.
