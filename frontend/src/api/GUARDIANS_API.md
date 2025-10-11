# 📡 API de Guardianes (Acudientes)

Documentación de los servicios de API para gestionar guardianes en la plataforma de scouts.

## 📚 Archivos

- **`guardiansApi.ts`** - Funciones base de API (CRUD simple)
- **`guardian.types.ts`** - Tipos TypeScript
- **`../services/guardianService.ts`** - Lógica de negocio adicional

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante **Auth0 JWT Token**. El token se añade automáticamente en los headers mediante el interceptor configurado en `axios.ts`.

---

## 📡 Endpoints Disponibles

### Base URL
```
http://localhost:8080/api/v1
```

---

## 🔧 API Functions (guardiansApi.ts)

### 1. `createGuardian(data)`

Crea un nuevo guardian en el sistema.

**Endpoint:** `POST /members/guardian/create`

**Parámetros:**
```typescript
data: CreateGuardianDTO {
  tenantId: string;
  subgroupId: number;
  firstName: string;
  lastName: string;
  phone: string;
  relationship: string;
  identification: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string; // YYYY-MM-DD
  address?: string;
  age?: number;
  isActive?: boolean;
  status?: string;
  acceptanceDate?: string;
  memberIdsInCharge?: string[];
  emergencyContacts?: EmergencyContact[];
}
```

**Retorna:** `Promise<Guardian>`

**Ejemplo:**
```typescript
import { createGuardian } from '@/api/guardiansApi';

const newGuardian = await createGuardian({
  tenantId: 'tenant-123',
  subgroupId: 1,
  firstName: 'María',
  lastName: 'González',
  phone: '3001234567',
  relationship: 'Madre',
  identification: '1234567890',
  documentType: 'CC',
  email: 'maria@example.com',
  address: 'Calle 123 #45-67',
  gender: 'Femenino',
  birthDate: '1985-05-15',
});
```

---

### 2. `getGuardianById(id)`

Obtiene la información completa de un guardian por su ID.

**Endpoint:** `GET /members/guardian/{id}`

**Parámetros:**
- `id: string` - ID del guardian (userId)

**Retorna:** `Promise<Guardian>`

**Ejemplo:**
```typescript
import { getGuardianById } from '@/api/guardiansApi';

const guardian = await getGuardianById('auth0|123456');
console.log(guardian.firstName); // "María"
console.log(guardian.members); // Array de miembros a cargo
```

---

### 3. `updateGuardian(id, data)`

Actualiza la información de un guardian existente.

**Endpoint:** `PUT /members/guardian/{id}`

**Parámetros:**
- `id: string` - ID del guardian (userId)
- `data: UpdateGuardianDTO` - Campos a actualizar

```typescript
data: UpdateGuardianDTO {
  identification?: string;
  documentType?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  email?: string;
  relationship?: string;
  status?: string;
  isActive?: boolean;
}
```

**Retorna:** `Promise<Guardian>`

**Ejemplo:**
```typescript
import { updateGuardian } from '@/api/guardiansApi';

const updated = await updateGuardian('auth0|123456', {
  phone: '3009876543',
  address: 'Nueva dirección #123',
  identification: '9876543210',
});
```

---

## 🎯 Service Functions (guardianService.ts)

El servicio agrega lógica de negocio adicional sobre las funciones base de la API.

### 1. `guardianService.getGuardianById(guardianId)`

Similar a la función de API pero con manejo especial de errores 404.

**Retorna:** `Promise<Guardian | null>`

**Ejemplo:**
```typescript
import { guardianService } from '@/services/guardianService';

const guardian = await guardianService.getGuardianById('auth0|123456');
if (!guardian) {
  console.log('Guardian no encontrado');
}
```

---

### 2. `guardianService.verifyCompleteData(guardianId)`

Verifica si un guardian tiene todos los campos requeridos completos.

**Campos verificados:**
- identification
- documentType
- phone
- address
- gender
- birthDate

**Retorna:** `Promise<boolean>`

**Ejemplo:**
```typescript
import { guardianService } from '@/services/guardianService';

const isComplete = await guardianService.verifyCompleteData('auth0|123456');
if (!isComplete) {
  // Mostrar modal para completar datos
  showCompleteDataModal();
}
```

---

### 3. `guardianService.updateData(guardianId, datos)`

Actualiza datos del guardian. Internamente obtiene el guardian actual, construye el objeto completo y envía el PUT.

**Parámetros:**
- `guardianId: string`
- `datos: UpdateGuardianData`

**Retorna:** `Promise<Guardian>`

**Ejemplo:**
```typescript
import { guardianService } from '@/services/guardianService';

await guardianService.updateData('auth0|123456', {
  identification: '1234567890',
  documentType: 'CC',
  phone: '3001234567',
  address: 'Calle 123',
  gender: 'Femenino',
  birthDate: '1985-05-15',
  age: 38,
});
```

---

### 4. `guardianService.crearGuardian(datos)`

Crea un nuevo guardian. Wrapper sobre la función de API con manejo de errores.

**Parámetros:**
- `datos: CreateGuardianData`

**Retorna:** `Promise<Guardian>`

**Ejemplo:**
```typescript
import { guardianService } from '@/services/guardianService';

const newGuardian = await guardianService.crearGuardian({
  tenantId: 'tenant-123',
  subgroupId: 1,
  firstName: 'María',
  lastName: 'González',
  phone: '3001234567',
  relationship: 'Madre',
  identification: '1234567890',
});
```

---

## 📝 TypeScript Types

### Guardian
```typescript
interface Guardian {
  userId: string;
  tenantId: string;
  subgroupId: string | number;
  firstName: string;
  lastName: string;
  identification: string;
  phone: string;
  isActive: boolean;
  age?: number;
  documentType?: string;
  relationship?: string;
  status?: string;
  acceptanceDate?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  members?: MemberBasicInfo[];
  membersInCharge?: MemberBasicInfo[];
}
```

### CreateGuardianDTO
```typescript
interface CreateGuardianDTO {
  tenantId: string;
  subgroupId: number;
  firstName: string;
  lastName: string;
  phone: string;
  relationship: string;
  identification: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  age?: number;
  isActive?: boolean;
  status?: string;
  acceptanceDate?: string;
  memberIdsInCharge?: string[];
  emergencyContacts?: EmergencyContact[];
}
```

### UpdateGuardianDTO
```typescript
interface UpdateGuardianDTO {
  identification?: string;
  documentType?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  age?: number;
  email?: string;
  relationship?: string;
  status?: string;
  isActive?: boolean;
}
```

---

## 🚨 Manejo de Errores

Las funciones de la API (`guardiansApi.ts`) **NO incluyen try-catch**, los errores se propagan al componente que las invoca.

Las funciones del servicio (`guardianService.ts`) **SÍ incluyen try-catch** con logging adicional.

**Errores comunes:**

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 404 | Not Found - Guardian no existe |
| 500 | Internal Server Error |

**Ejemplo de manejo:**
```typescript
try {
  const guardian = await getGuardianById('auth0|123456');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Guardian no encontrado');
  } else if (error.response?.status === 401) {
    console.log('No autenticado');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## 🔗 Archivos Relacionados

- **API Base:** `src/api/axios.ts`
- **Members API:** `src/api/membersApi.ts`
- **Types:** `src/api/guardian.types.ts`
- **Service:** `src/services/guardianService.ts`

---

## 📋 Notas Importantes

1. ✅ Autenticación automática vía Auth0 JWT
2. ✅ Fechas en formato ISO: `YYYY-MM-DD`
3. ✅ DocumentType válidos: `"CC"`, `"TI"`, `"CE"`, `"PASSPORT"`
4. ✅ Status válidos: `"PENDING"`, `"ACCEPTED"`, `"NOT_ACCEPTED"`, `"ACTIVE"`, `"INACTIVE"`
5. ⚠️ El endpoint DELETE no está implementado actualmente

---

**Última actualización:** Octubre 11, 2025
