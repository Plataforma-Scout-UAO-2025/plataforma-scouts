# Organigrama — Política de centralización de endpoints

Este pequeño README explica la convención adoptada para centralizar todas las llamadas HTTP relacionadas con el submódulo `organigrama` en el cliente central `src/api/organigramaClient.ts`.

Resumen rápido
- `organigramaClient` es la única fuente de verdad para endpoints del organigrama. No deberían usarse `api` (axios) ni `organigramaApi` directamente desde servicios o componentes del submódulo.
- Existen dos familias de funciones en `organigramaClient`:
  1. Wrappers normalizados (ej. `getSections`, `getSectionWithSubgroups`, `createSection`, `updateSubgroup`): devuelven objetos transformados a camelCase y normalizados por los schema/mappers del módulo.
  2. Wrappers Raw (sufijo `Raw`, ej. `getSectionRaw`, `patchGalleryRaw`, `patchSubgroupGalleryRaw`): devuelven el payload tal cual desde el backend o aceptan payloads ya construidos en snake_case. Úsalos cuando la función que implementas ya construye el payload con la forma que requiere el backend y no deseas volver a transformar los datos.

Cuándo usar cada uno
- Usa los wrappers normalizados cuando quieres recibir objetos listos para consumir por la UI (camelCase, shape consistente con los schemas de `src/app/routes/organigrama/schemas`).
- Usa los wrappers `Raw` cuando:
  - Estás implementando código de bajo nivel que prepara payloads al backend (p. ej. utilidades de upload que crean `{ add: [...], remove: [...] }` en snake_case).
  - Necesitas acceso al payload exacto que devuelve el backend (por ejemplo, para diagnóstico o migraciones).

Ejemplos
- Llamada normalizada (recomendada para componentes):

```ts
import * as organigramaClient from '@/api/organigramaClient';

const sections = await organigramaClient.getSections(tenantId, groupSlug);
// `sections` ya viene normalizado y listo para la UI
```

- Llamada Raw (cuando la lógica arma payloads backend-shaped):

```ts
import * as organigramaClient from '@/api/organigramaClient';

const payload = { add: [{ url: '...' }], remove: [] };
await organigramaClient.patchGalleryRaw(sectionId, payload, tenantId, groupSlug);
```

Notas operativas
- No se debe agregar `import api from '@/api/axios'` dentro del subtree `src/app/routes/organigrama`. Las únicas excepciones permitidas son utilidades de `upload` que hagan `postFormData`/`uploadToStorage` (siempre documentadas).
- Cuando agregues nuevos endpoints (en `organigramaApi.ts` o en el backend), añade primero un wrapper en `organigramaClient.ts` y los tests/ejemplos necesarios. Siempre preferir wrapper normalizado salvo que la operación sea explícitamente Raw.

Checklist de PR al migrar un archivo
- [ ] Reemplazar imports a `@/api/axios` o `@/api/organigramaApi` por `import * as organigramaClient from '@/api/organigramaClient'` cuando aplique.
- [ ] Elegir wrapper normalizado vs Raw según la regla más arriba.
- [ ] Ejecutar `npx tsc --noEmit` y `npx eslint` y corregir problemas.
- [ ] Añadir una breve nota en el PR describiendo por qué se escogió Raw vs normalizado si no es obvio.

Contacto
- Si dudas sobre qué wrapper usar, abre un comentario en el PR y etiqueta al responsable del módulo.
