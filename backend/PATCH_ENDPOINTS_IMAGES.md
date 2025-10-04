# 🎨 Nuevos Endpoints PATCH para Actualización Individual de Imágenes

## 📋 Resumen

Se han implementado **7 nuevos endpoints PATCH** que permiten actualizar imágenes individuales sin necesidad de enviar todos los campos de la entidad. Esto mejora significativamente la eficiencia de la API y la experiencia del desarrollador.

---

## ✨ Ventajas

✅ **Actualizaciones parciales**: Solo envías el `objectId` de la nueva imagen  
✅ **Menos datos transferidos**: Peticiones HTTP más pequeñas y rápidas  
✅ **Semántica REST correcta**: PATCH para actualizaciones parciales  
✅ **Eliminación automática**: El backend elimina la imagen anterior de Supabase  
✅ **Validación robusta**: DTO con validación de `@NotNull` en `objectId`  
✅ **Código limpio**: No duplica lógica, reutiliza servicios existentes  

---

## 🆕 Endpoints Implementados

### 1️⃣ **GRUPOS** (Groups)

#### Actualizar Logo
```http
PATCH /api/tenants/{tenantSlug}/groups/{groupSlug}/logo
Content-Type: application/json

{
  "objectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta**: `204 No Content`

---

#### Actualizar Pañolón
```http
PATCH /api/tenants/{tenantSlug}/groups/{groupSlug}/scarf
Content-Type: application/json

{
  "objectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta**: `204 No Content`

---

### 2️⃣ **SECCIONES** (Sections)

#### Actualizar Ícono
```http
PATCH /api/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/icon
Content-Type: application/json

{
  "objectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta**: `204 No Content`

---

#### Actualizar Foto Principal
```http
PATCH /api/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/photo-principal
Content-Type: application/json

{
  "objectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta**: `204 No Content`

---

### 3️⃣ **SUBGRUPOS** (Subgroups)

#### Actualizar Foto Principal
```http
PATCH /api/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}/photo-principal
Content-Type: application/json

{
  "objectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta**: `204 No Content`

---

## 🔄 Flujo Completo de Actualización

### Ejemplo: Cambiar el Logo de un Grupo

```javascript
// Paso 1: Subir la nueva imagen a Supabase Storage
const formData = new FormData();
formData.append('file', nuevoArchivoLogo);

const uploadResponse = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData
});

const { objectId } = await uploadResponse.json();
// objectId: "123e4567-e89b-12d3-a456-426614174000"

// Paso 2: Actualizar solo el logo usando PATCH
const updateResponse = await fetch('/api/tenants/region-valle/groups/grupo-803/logo', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ objectId })
});

// Respuesta: 204 No Content
// ✅ Logo actualizado y anterior eliminado automáticamente de Supabase
```

---

## 📊 Comparación: PUT vs PATCH

### ❌ **ANTES (PUT)** - Actualizar TODO el grupo

```javascript
// Debes enviar TODOS los campos
const response = await fetch('/api/tenants/region-valle/groups/grupo-803', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Grupo Scout 803",
    district: "Distrito Cali",
    identifierNumber: "803",
    address: "Calle 123 #45-67",
    phone: "+57 300 123 4567",
    email: "grupo803@scouts.org.co",
    foundedIn: "1985-03-15",
    motto: "Siempre listos",
    mission: "Formar ciudadanos activos...",
    vision: "Ser el mejor grupo...",
    history: "Fundado en 1985...",
    logoObjectId: "123e4567-e89b-12d3-a456-426614174000", // ← Solo quieres cambiar esto
    scarfObjectId: "uuid-pañolon-actual",
    socialLinks: { /* ... */ },
    config: { /* ... */ },
    isActive: true,
    status: "active"
  })
});
```

**Tamaño aproximado**: ~1.5 KB

---

### ✅ **AHORA (PATCH)** - Actualizar SOLO el logo

```javascript
// Solo envías el objectId
const response = await fetch('/api/tenants/region-valle/groups/grupo-803/logo', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    objectId: "123e4567-e89b-12d3-a456-426614174000"
  })
});
```

**Tamaño aproximado**: ~80 bytes

**Reducción**: **~95% menos datos** 🎉

---

## 🧪 Pruebas con Bruno/Postman

### Ejemplo: Actualizar Ícono de Sección

```http
PATCH http://localhost:8080/api/tenants/region-valle/groups/grupo-803/sections/1/icon
Content-Type: application/json

{
  "objectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Respuestas Posibles

| Código | Descripción |
|--------|-------------|
| `204` | ✅ Imagen actualizada exitosamente |
| `400` | ❌ ObjectId inválido o faltante |
| `404` | ❌ Tenant, grupo o sección no encontrado |
| `500` | ❌ Error interno del servidor |

---

## 🔧 Implementación Técnica

### DTO: `UpdateImageRequest`

```java
package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "Request para actualizar una imagen individual")
public record UpdateImageRequest(
    
    @Schema(description = "UUID del objeto de storage en Supabase", 
            example = "123e4567-e89b-12d3-a456-426614174000",
            required = true)
    @NotNull(message = "El objectId es obligatorio")
    UUID objectId
) {}
```

### Ejemplo de Método en Service

```java
@Transactional
public void updateLogo(String tenantSlug, String groupSlug, UUID logoObjectId) {
    Tenant tenant = getTenantBySlug(tenantSlug);
    Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
    
    // Eliminar logo anterior si existe y es diferente
    if (group.getLogoObjectId() != null && !group.getLogoObjectId().equals(logoObjectId)) {
        storageService.deleteFileByObjectId(group.getLogoObjectId());
    }
    
    group.setLogoObjectId(logoObjectId);
    groupRepository.save(group);
}
```

### Ejemplo de Endpoint en Controller

```java
@Operation(summary = "Actualizar solo el logo de un grupo")
@ApiResponses(value = {
    @ApiResponse(responseCode = "204", description = "Logo actualizado exitosamente"),
    @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
    @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
})
@PatchMapping("/{groupSlug}/logo")
public ResponseEntity<Void> updateLogo(
    @PathVariable String tenantSlug,
    @PathVariable String groupSlug,
    @Valid @RequestBody UpdateImageRequest request) {
    groupService.updateLogo(tenantSlug, groupSlug, request.objectId());
    return ResponseEntity.noContent().build();
}
```

---

## 📝 Archivos Modificados

1. ✅ **Nuevo**: `UpdateImageRequest.java` (DTO)
2. ✅ `GroupService.java` - Métodos `updateLogo()` y `updateScarf()`
3. ✅ `SectionService.java` - Métodos `updateIcon()` y `updatePhotoPrincipal()`
4. ✅ `SubgroupService.java` - Método `updatePhotoPrincipal()`
5. ✅ `GroupController.java` - Endpoints PATCH `/logo` y `/scarf`
6. ✅ `SectionController.java` - Endpoints PATCH `/icon` y `/photo-principal`
7. ✅ `SubgroupController.java` - Endpoint PATCH `/photo-principal`

---

## ⚠️ Notas Importantes

1. **Eliminación automática**: Al actualizar una imagen, el backend elimina automáticamente la imagen anterior de Supabase Storage (si existe y es diferente).

2. **Validación**: El `objectId` debe ser un UUID válido. Si envías un valor inválido, recibirás un error `400 Bad Request`.

3. **Idempotencia**: Si envías el mismo `objectId` que ya está configurado, no se eliminará la imagen (la lógica detecta que es la misma).

4. **Transacciones**: Todos los métodos están anotados con `@Transactional` para garantizar consistencia.

5. **Compatibilidad**: Los endpoints `PUT` existentes siguen funcionando. Los nuevos `PATCH` son una alternativa más eficiente.

---

## 🚀 Casos de Uso

### Caso 1: Actualizar solo el logo
```bash
curl -X PATCH http://localhost:8080/api/tenants/region-valle/groups/grupo-803/logo \
  -H "Content-Type: application/json" \
  -d '{"objectId":"123e4567-e89b-12d3-a456-426614174000"}'
```

### Caso 2: Actualizar solo la foto principal de una sección
```bash
curl -X PATCH http://localhost:8080/api/tenants/region-valle/groups/grupo-803/sections/1/photo-principal \
  -H "Content-Type: application/json" \
  -d '{"objectId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'
```

### Caso 3: Actualizar solo el ícono de una sección
```bash
curl -X PATCH http://localhost:8080/api/tenants/region-valle/groups/grupo-803/sections/1/icon \
  -H "Content-Type: application/json" \
  -d '{"objectId":"f1e2d3c4-b5a6-7890-1234-567890abcdef"}'
```

---

## 📚 Resumen de Endpoints

| Entidad | Endpoint | Método | Campo Actualizado |
|---------|----------|--------|-------------------|
| **Grupo** | `/api/tenants/{slug}/groups/{slug}/logo` | `PATCH` | `logoObjectId` |
| **Grupo** | `/api/tenants/{slug}/groups/{slug}/scarf` | `PATCH` | `scarfObjectId` |
| **Sección** | `/api/tenants/{slug}/groups/{slug}/sections/{id}/icon` | `PATCH` | `iconObjectId` |
| **Sección** | `/api/tenants/{slug}/groups/{slug}/sections/{id}/photo-principal` | `PATCH` | `photoPrincipalObjectId` |
| **Subgrupo** | `/api/tenants/{slug}/groups/{slug}/sections/{id}/subgroups/{id}/photo-principal` | `PATCH` | `photoPrincipalObjectId` |

---

## ✅ Conclusión

Los nuevos endpoints PATCH proporcionan una forma **eficiente, semántica y fácil de usar** para actualizar imágenes individuales en el sistema de organigrama scout. Esto reduce significativamente la cantidad de datos transferidos y simplifica el código del frontend.

**¡Listo para usar! 🎉**
