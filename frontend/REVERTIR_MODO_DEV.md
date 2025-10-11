# ⚠️ INSTRUCCIONES PARA REVERTIR MODO DEV ⚠️

Este archivo contiene las instrucciones para **eliminar el modo desarrollo** antes de hacer commit/push.

## 📝 Archivos que debes ELIMINAR:

1. **`src/config/dev.config.ts`** - Archivo de configuración DEV (ELIMINAR COMPLETAMENTE)
2. **`REVERTIR_MODO_DEV.md`** - Este archivo de instrucciones (ELIMINAR después de revertir)

## 🔄 Archivos que debes REVERTIR a su estado original:

### 1. `src/App.tsx`
**Eliminar:**
- El import de `DEV_CONFIG`
- El banner amarillo de desarrollo
- La redirección automática a `/app/acudiente`

**Cambiar de:**
```tsx
import { DEV_CONFIG } from "./config/dev.config";

// En el return:
{DEV_CONFIG.showDevBanner && (
  <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold text-sm sticky top-0 z-50">
    🚧 MODO DESARROLLO - Sin Backend - Solo Visualización 🚧
  </div>
)}

<Route path="/" element={DEV_CONFIG.skipAuth ? <Navigate to="/app/acudiente" replace /> : <Home />} />
```

**Cambiar a:**
```tsx
// Sin import de DEV_CONFIG
// Sin banner
<Route path="/" element={<Home />} />
```

---

### 2. `src/components/auth/ProtectedRoute.tsx`
**Eliminar:**
- El import de `DEV_CONFIG`
- El bypass de autenticación

**Cambiar de:**
```tsx
import { DEV_CONFIG } from "@/config/dev.config";

// En el componente:
if (DEV_CONFIG.skipAuth) {
  return <>{children}</>;
}
```

**Cambiar a:**
```tsx
// Sin import de DEV_CONFIG
// Sin el if de skipAuth
```

---

### 3. `src/context/RoleProvider.tsx`
**Eliminar:**
- El import de `DEV_CONFIG`
- El useEffect que configura el role mock
- El skip en el segundo useEffect

**Cambiar de:**
```tsx
import { DEV_CONFIG } from '@/config/dev.config';

// Eliminar este useEffect completo:
useEffect(() => {
  if (DEV_CONFIG.skipAuth) {
    setRoles([DEV_CONFIG.mockRole]);
    setCurrentUserRole(DEV_CONFIG.mockRole);
    setStatus('success');
    return;
  }
}, []);

// En el segundo useEffect, eliminar:
if (DEV_CONFIG.skipAuth) return; // Skip en modo DEV
```

**Cambiar a:**
```tsx
// Sin import de DEV_CONFIG
// Sin el useEffect de mock role
// Sin el skip en el segundo useEffect
```

---

### 4. `src/hooks/useAuth0ApiWrapper.ts`
**Eliminar:**
- El import de `DEV_CONFIG`
- El skip de token setup

**Cambiar de:**
```tsx
import { DEV_CONFIG } from '@/config/dev.config';

useEffect(() => {
  if (DEV_CONFIG.skipAuth) {
    return;
  }
  // resto del código...
```

**Cambiar a:**
```tsx
// Sin import de DEV_CONFIG
useEffect(() => {
  // directamente el código sin el if de skipAuth
```

---

## 🚀 Comando rápido (PowerShell):

```powershell
# Eliminar archivos DEV
Remove-Item "src/config/dev.config.ts" -Force
Remove-Item "REVERTIR_MODO_DEV.md" -Force

# Luego usar git para revertir los cambios en los demás archivos:
git checkout -- src/App.tsx
git checkout -- src/components/auth/ProtectedRoute.tsx
git checkout -- src/context/RoleProvider.tsx
git checkout -- src/hooks/useAuth0ApiWrapper.ts
```

---

## ✅ Verificación:

Después de revertir, asegúrate de que:
- [ ] No existe `src/config/dev.config.ts`
- [ ] No existe `REVERTIR_MODO_DEV.md`
- [ ] `App.tsx` no importa ni usa `DEV_CONFIG`
- [ ] `ProtectedRoute.tsx` requiere autenticación normal
- [ ] `RoleProvider.tsx` obtiene roles del API
- [ ] `useAuth0ApiWrapper.ts` configura tokens normalmente
- [ ] No hay ningún comentario que diga "⚠️ MODO DEV"

---

**IMPORTANTE:** NO hagas commit/push de estos archivos con el modo DEV activado.
