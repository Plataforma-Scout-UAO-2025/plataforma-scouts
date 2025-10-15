# Centralización de endpoints de Organigrama

Este documento describe, paso a paso, qué falta para centralizar TODOS los endpoints del submódulo `organigrama` en el cliente `src/api/organigramaClient.ts`, cómo hacerlo y cómo validar los cambios. Está pensado para que lo ejecute otra IA o un desarrollador y termine la migración de forma segura.

Resumen del objetivo
- Objetivo principal: mover todas las llamadas HTTP relacionadas con `organigrama` a un único archivo/cliente `src/api/organigramaClient.ts` (o exponer wrappers ahí) y eliminar llamadas directas a `api`/`axios` o a `organigramaApi` desde los servicios y componentes del subárbol `src/app/routes/organigrama/**`.
- Resultado esperado: los servicios en `organigramaRamas_Subramas/services/*` y otros consumidores deben usar exclusivamente `organigramaClient` y/o `imageFacade` para realizar peticiones HTTP. Solo las utilidades de bajo nivel (por ejemplo `uploadToStorage`) permanecen fuera.

Contexto y situación actual (resumen corto)
- Ya existe `src/api/organigramaApi.ts` (path builders + funciones HTTP básicas) y `src/api/organigramaClient.ts` (wrappers tipados + normalización + ya se añadieron algunos wrappers `Raw` y `deleteGalleryImageById`).
- Algunos servicios (gallery.service, image-upload*.service, subrama.service, rama.service) todavía usan `api`/`axios` y `organigramaApi` directamente para flujos complejos de imagen/galería.
- Se han comenzado cambios: `organigramaClient` ya tiene varias funciones nuevas (raw wrappers y `deleteGalleryImageById`, `patchGalleryRaw`). Parte del `gallery.service.ts` fue adaptado para usar esos wrappers, pero `rama.service.ts` fue revertido por el autor (revisar antes de editar).

Reglas generales (contrato)
- El cliente `organigramaClient` es la "fuente de verdad" para endpoints de organigrama.
- El cliente exporta dos familias de funciones:
  1. Operaciones normalizadas/validadas (ej. `getSections`, `getSectionWithSubgroups`, `createSection`, `updateSection`, `getSubgroups`, `createSubgroup`, `patchGallery` tipado, etc.). Estas devuelven shapes en camelCase y validados por Zod.
  2. Wrappers Raw / Low-level cuando el servicio ya construye payloads con snake_case o requiere la respuesta tal cual (ej. `getSectionRaw`, `patchGalleryRaw`, `deleteGalleryImageById`).
- Los servicios/componetes deben preferir las funciones normalizadas. Usar los `Raw` solo cuando sea estrictamente necesario (y documentarlo en el commit).
- No introducir duplicación de endpoints: si la operación existe en `organigramaClient`, usarla en lugar de llamar `api/organigramaApi` directamente.

Lista priorizada de archivos a migrar
(Orden sugerido: migraciones de bajo riesgo → alto riesgo)

1. `src/app/routes/organigrama/organigramaRamas_Subramas/services/gallery.service.ts`
   - Estado: ya parcialmente adaptado para usar `organigramaClient.patchGalleryRaw`, `getSectionRaw` y `deleteGalleryImageById`.
   - Objetivo: terminar de remover llamadas directas a `api.patch`/`api.delete`/`api.get` y usar únicamente `organigramaClient` para esas operaciones (mantener `uploadToStorage` y lógica local de extracción UUID y retry).
   - Tareas concretas:
     - Revisar que todas las rutas PATCH/DELETE/GET usen `organigramaClient.patchGalleryRaw`, `organigramaClient.deleteGalleryImageById`, `organigramaClient.getSectionRaw`.
     - Verificar tipos: `patchGalleryRaw` recibe payloads en formato backend (snake_case) — usar `createPayloadForBackend(...)` antes de pasarlo.

2. `src/app/routes/organigrama/organigramaRamas_Subramas/services/subrama.service.ts`
   - Objetivo: reemplazar `api.get(subgroupsPath(...))`, `api.get(subgroupPath(...))`, `api.post/put/delete` por `organigramaClient.getSubgroups`, `organigramaClient.createSubgroup`, `organigramaClient.updateSubgroup`, `organigramaClient.deleteSubgroup`.
   - Nota: `organigramaClient` no ofrece `getSubgroup` por id; estrategia: usar `getSubgroups(sectionId, ...)` y filtrar por id (o usar `getSubgroupRaw` si se añade en el cliente). Documentar la elección.

3. `src/app/routes/organigrama/organigramaRamas_Subramas/services/rama.service.ts`
   - Importante: el archivo fue revertido recientemente por el autor. Antes de modificarlo, abrir el archivo y confirmar su contenido actual.
   - Objetivo: reemplazar `api.get(sectionsPath(...))` y `api.get(sectionPath(...))` por `organigramaClient.getSections` / `organigramaClient.getSectionWithSubgroups` / `organigramaClient.getSectionRaw` según convenga; usar `imageFacade` (o `organigramaClient` imagen wrappers) para upload de icono y galería (`uploadSectionIcon`, `uploadGalleryImages` deberían delegar en `imageFacade` o `organigramaClient`).
   - Tareas concretas:
     - Sustituir llamadas que sólo hacen GET/POST/PUT/DELETE simples por las funciones `organigramaClient` de más alto nivel.
     - Mantener la lógica de mapping (mapBackendRamaToFrontend) pero preferir obtener ya normalized objects del cliente (si se usa `getSections`, se obtendrá `SectionZ[]` listo).
     - Probar flujo create/update con icon/gallery: `createRama` y `updateRama` deben usar `organigramaClient.createSection`/`updateSection` y luego, si hay uploads, usar `imageFacade` o `organigramaClient.uploadToGallery`.

4. `src/app/routes/organigrama/organigramaRamas_Subramas/services/image-upload.service.ts` y `image-upload-core.service.ts` y `subrama-image.service.ts`
   - Objetivo: mover endpoints simples (upload/post/patch) a `organigramaClient` o exponer wrappers en `imageFacade` dentro de `src/app/routes/organigrama/services/imageFacade.ts`.
   - Tareas:
     - Revisar cada función que llama `api.post(orgApi.galleryPath(...))` o `api.patch(orgApi.iconPath(...))` y reemplazar por `organigramaClient.uploadToGallery` / `organigramaClient.patchGallery` / `organigramaClient.setIcon` / `organigramaClient.setPhotoPrincipal` / `organigramaClient.uploadSubgroupPhoto` / `organigramaClient.setSubgroupPhotoPrincipal`.
     - Si el servicio construye payloads en snake_case, usar `patchGalleryRaw`/`createSectionRaw` etc.

5. `src/app/routes/organigrama/organigramaRamas_Subramas/utils/image-upload-diagnostics.ts`
   - Objetivo: usar `organigramaClient.getSectionRaw` / `organigramaClient.patchGalleryRaw` en lugar de `api` directo.

6. Otros lugares que referencian `api` directamente (buscar `import api from '@/api/axios'` y revisar si son de organigrama):
   - `utils/fetchGroup.ts` (revisar si debe usar `organigramaClient.getGroupsByTenant` o `organigramaApi.getGroupsByTenant` o quedarse como está)


Pasos técnicos detallados para cada archivo (ejemplo genérico)
- Paso 1: abrir el archivo y localizar las líneas con `api.get`, `api.post`, `api.patch`, `api.put`, `api.delete` o `organigramaApi.<pathFunction>`.
- Paso 2: decidir si existe wrapper en `organigramaClient`:
  - Si existe wrapper tipado que devuelve objeto normalizado → reemplazar la llamada por el wrapper tipado.
  - Si el servicio ya arma payloads `snake_case` para el backend → usar el wrapper `...Raw` (`patchGalleryRaw`, `createSectionRaw`, etc.).
  - Si la operación es un DELETE por objectId en gallery → usar `organigramaClient.deleteGalleryImageById`.
- Paso 3: ajustar imports del archivo para eliminar `import { ... } from '@/api/organigramaApi'` o `import api from '@/api/axios'` y añadir `import * as organigramaClient from '@/api/organigramaClient'` si procede.
- Paso 4: ejecutar `npx tsc --noEmit` y `npx lint`. Corregir tipos y errores.
- Paso 5: ejecutar `npx build` y realizar smoke tests manuales (crear rama, editar una rama, subir imagen, reemplazar imagen, borrar imagen, listar subgrupos).

Criterios de aceptación (must pass)
- compilar sin errores: `npx tsc --noEmit` ✅
- linter verde: `npx lint` ✅
- build de Vite exitoso: `npx build` ✅
- Flujos manuales que deben seguir funcionando (smoke):
  - Cargar lista de ramas (getSections)
  - Abrir rama y ver subramas (getSectionWithSubgroups / getSubgroups)
  - Crear rama con icono y gallery: createSection/createRama + upload
  - Reemplazar imagen de galería y borrar imagen via DELETE
  - Subir foto principal de subrama
- No deben quedar imports a `@/api/axios` o `@/api/organigramaApi` desde servicios del organigrama (excepción: utilidades de uploadToStorage o casos explícitos documentados).

Recomendaciones y buenas prácticas
- Hacer cambios en PRs pequeños (1 archivo por PR preferiblemente). Añadir en la descripción del PR "Migración a organigramaClient: archivo X".
- Mantener tests/validaciones en cada PR: `tsc`, `lint`, `build` y ejecutar los flujos críticos manualmente.
- Mantener `Raw` wrappers documentados en `organigramaClient` (comentario JSDoc) para que otros sepan cuándo utilizarlos.
- Añadir en `src/app/routes/organigrama/README.md` una sección corta que indique: "Usar `organigramaClient` para llamadas HTTP; `imageFacade` para operaciones compuestas de imagen; `Raw` para payloads backend-shaped.".

Notas importantes / riesgos conocidos
- `rama.service.ts` fue revertido por el autor recientemente: comprobar su contenido actual antes de editar. Evitar sobreescribir cambios humanos sin coordinación.
- Algunos servicios implementan lógica avanzada de retry/diagnostics que no deben perderse: trasladar lógica, no reemplazar sin preservar retry y logging.
- Tipos: `GalleryPatchRequest` espera `operations: GalleryOp[]` — si se usa `createPayloadForBackend(...)` el resultado es un objeto con `operations` en snake_case (Record<string, unknown>[]). Para usar `patchGallery` tipado habría que transformar las operaciones al shape TypeScript correcto; por simplicidad usar `patchGalleryRaw` (ya añadido en `organigramaClient`).

Este proyecto usa npm.

Checklist de entrega (para marcar cuando listo)
- [ ] `gallery.service.ts` migrado por completo a `organigramaClient`.
- [ ] `subrama.service.ts` migrado por completo a `organigramaClient`.
- [ ] `rama.service.ts` migrado por completo a `organigramaClient` (verificar reversiones previas antes de editar).
- [ ] `image-upload*.service.ts` y `subrama-image.service.ts` migrados a `organigramaClient`/`imageFacade`.
- [ ] `image-upload-diagnostics.ts` actualizado.
- [ ] `README.md` corto añadido describiendo la política de centralización y uso de `Raw`.
- [ ] PRs por archivo con pruebas y passing build.

Contactos y contexto adicional
- Revisa `src/app/routes/organigrama/utils/normalizers.ts` y `src/app/routes/organigrama/schemas/*` para entender cómo se normaliza la data.
- Si surge ambigüedad entre devolver raw o normalizado, priorizar la versión normalizada; documentar la excepción con un comentario en el commit.

---

