Plan de Arranque por Rol - Líder de
Desarrollo / Arquitecto

1. Diseño de la Arquitectura
Se establece una arquitectura monolítica modular que permitirá un desarrollo ágil y
organizado, con posibilidad de escalar en el futuro.
El diagrama de alto nivel incluye los siguientes componentes:
- Navegador (usuarios) → acceso a través de HTTPS y subdominios dedicados.
- Servidor de aplicación → Java SE 24 + Spring Boot 3.5.5, desplegado en Fly.io mediante
contenedores Docker.
- Base de datos única (PostgreSQL en Supabase) con separación lógica multi-tenant
mediante Row-Level Security (RLS).
- Almacenamiento de archivos (Supabase Storage), organizado en carpetas por grupo scout,
con URLs firmadas.
- Servicio de correos (SendGrid) para notificaciones y procesos de registro.

Nota: Una vez esté disponible Java SE 25 LTS, se actualizará la plataforma para garantizar
soporte de largo plazo.

2. Multi-tenant
- La plataforma usará subdominios para cada grupo (ejemplo: grupo1.plataformascout.org).
- Se implementará RLS en la base de datos, con tenant_id presente en todas las tablas
principales.
- El control de acceso se basará en tokens JWT emitidos por Auth0, incluyendo un claim
tenant_id en los tokens, que será usado por el ORM (Hibernate + Liquibase) para filtrar
automáticamente los datos.

3. Manejo de Ambientes
- Desarrollo y pruebas: entornos controlados por los estudiantes, con despliegues Docker
locales y en staging cuando se requiera.
- Producción: bajo control exclusivo del docente, desplegado en Fly.io.
- Flujo GitFlow: ramas main, develop, feature/*, release/* y hotfix/*.
- CI/CD con GitHub Actions: integración y despliegue continuo desde el inicio, con pipelines
para build, test, seguridad, empaquetado y publicación de contenedores.

4. Seguridad y Privacidad
- Autenticación y autorización con Auth0, empleando Organizations y custom domain
(login.plataformascout.org).
- Roles y RBAC inicial: Administrador global (docente), Líder de grupo, Acudiente, Joven
miembro.
- Campos cifrados en la BD conforme a Habeas Data (Ley 1581/2012): EPS, alergias,
teléfonos de contacto, direcciones y fotografías de menores.
- Conexiones obligatoriamente HTTPS en todos los entornos públicos.
- Redis se empleará como caché y para limitar intentos de acceso (rate-limit).

5. Dimensionamiento
La arquitectura se diseña inicialmente para:
- Hasta 5 grupos, con un máximo de 100 integrantes por grupo.
- Preparada para escalar a más grupos sin rediseño profundo gracias a subdominios, RLS y
despliegues en PaaS (Fly.io).

6. Copias Automáticas
- Supabase proveerá backups diarios automáticos de la base de datos.
- El almacenamiento de archivos se mantendrá replicado en Supabase Storage.
- En producción se evaluará habilitar retención adicional según disponibilidad de planes.

7. Stack Tecnológico
- Frontend: React (última versión estable) + shadcn/ui, con enrutamiento por subdominio y
fallback por path. Internacionalización (i18n) desde el inicio, validación de formularios y
enmascarado de datos sensibles.
- Backend: Java SE 24 + Spring Boot 3.5.5, con OpenAPI/Swagger, Redis y políticas RLS en
PostgreSQL. Migraciones gestionadas con Liquibase.
- Base de datos: PostgreSQL (Supabase) con RLS.
- Almacenamiento: Supabase Storage con organización por tenant.
- Correo: SendGrid (plan gratuito inicial).
- Control de versiones y CI/CD: GitHub + GitHub Actions.
- Contenedores: imágenes base Alpine (eclipse-temurin:21-jre-alpine para backend y nginx-
alpine para frontend).
- Observabilidad: OpenTelemetry + Grafana en docker-compose para trazas y métricas.
- CDN: Cloudflare (plan gratuito), integrado con el dominio y TLS universal.
- PaaS: Fly.io como proveedor principal (región gru – São Paulo), con Render como
alternativa económica de respaldo.

8. Proveedores Externos – Cuentas necesarias
Proveedor

Uso principal

Cloudflare

Supabase

Fly.io

Auth0

Estado

Crear cuenta

Registro de dominio, DNS,
CDN, TLS

PostgreSQL,
almacenamiento y backups

Crear cuenta

Plataforma de despliegue
(PaaS Docker)

Crear cuenta

Identidad y autenticación
multi-tenant

Crear cuenta

SendGrid

Correos transaccionales

Crear cuenta

Conclusión

9. Control de versiones – GitHub
Para garantizar la custodia del proyecto y la trazabilidad del trabajo de cada estudiante, se
establece lo siguiente:
- La cuenta principal de GitHub será creada y gestionada por el docente.
- Todos los estudiantes deberán acceder con su **cuenta universitaria**, asociada a su
correo institucional.
- El repositorio central del proyecto será creado por el docente dentro de la organización, y
los estudiantes trabajarán mediante forking, ramas y pull requests bajo supervisión.
- Esto asegura control administrativo por parte del docente y registro transparente de
contribuciones individuales.

10. Definición de Repositorios y Estructura de Código
Se trabajará con un único repositorio central en GitHub, creado y administrado por el
docente. Los estudiantes accederán con su cuenta universitaria asociada al correo
institucional, trabajando mediante ramas y pull requests bajo la supervisión del docente.

Repositorio central
Estructura inicial propuesta:

/plataforma-scouts
 ├── frontend/              # React + shadcn/ui
 │    ├── src/
 │    ├── public/
 │    └── package.json
 ├── backend/               # Java + Spring Boot
 │    ├── src/
 │    ├── pom.xml
 │    └── liquibase/        # migraciones versionadas
 ├── docs/                  # documentación técnica y funcional
 ├── .github/               # workflows de GitHub Actions (CI/CD)
 ├── docker/                # Dockerfiles y configuraciones
 ├── docker-compose.yml
 └── README.md

Módulos del backend
Dentro del backend (Spring Boot), cada módulo funcional se organizará como un package o
bounded context:

backend/src/main/java/com/scouts
 ├── miembros/        # Gestión de miembros y ramas
 ├── progresion/      # Planes de adelanto e insignias
 ├── eventos/         # Eventos, autorizaciones
 ├── finanzas/        # Finanzas simples
 ├── auth/            # Integración con Auth0
 ├── common/          # Utilidades y configuraciones compartidas
 └── api/             # Controladores REST

Conexión del backend con los módulos
Cada módulo expone endpoints REST a través de controladores. Los controladores delegan
en servicios que usan repositorios JPA con RLS aplicado en PostgreSQL.

Flujo de ejemplo (módulo miembros):
1. Usuario accede a subdominio (ejemplo: miembros.grupo1.plataformascout.org).
2. Auth0 devuelve token con claim tenant_id.
3. Backend valida token en módulo auth y propaga tenant_id.
4. Controlador de miembros invoca servicio → repositorio JPA.
5. RLS asegura aislamiento de datos por tenant.
6. Respuesta se envía filtrada al frontend.

Plantilla inicial del backend
backend/
 ├── src/
 │    ├── main/
 │    │    ├── java/com/scouts/
 │    │    │    ├── miembros/
 │    │    │    ├── progresion/
 │    │    │    ├── eventos/
 │    │    │    ├── finanzas/
 │    │    │    ├── auth/
 │    │    │    ├── common/
 │    │    │    └── api/
 │    │    └── resources/
 │    │         ├── application.yml
 │    │         └── db/changelog/ (Liquibase)
 │    └── test/java/com/scouts/
 └── pom.xml

11. Plantilla y Estructura Inicial del Frontend (React)
El frontend se implementará con React (versión estable vigente) y shadcn/ui, con
enrutamiento por subdominio y fallback por path en desarrollo. Se habilita i18n desde el
inicio y validación de formularios con enmascaramiento de datos sensibles.

Estructura propuesta
frontend/
 ├── src/
 │    ├── app/                       # entrypoints y rutas (React Router)
 │    │    ├── routes/
 │    │    │    ├── index.tsx        # home / dashboard global
 │    │    │    ├── login.tsx        # autenticación
 │    │    │    ├── miembros.tsx     # módulo miembros
 │    │    │    ├── progresion.tsx   # módulo progresión
 │    │    │    ├── eventos.tsx      # módulo eventos
 │    │    │    └── finanzas.tsx     # módulo finanzas
 │    ├── components/                # componentes UI (shadcn/ui wrappers)
 │    │    ├── forms/
 │    │    ├── tables/
 │    │    └── layout/
 │    ├── hooks/
 │    │    ├── useTenant.ts          # obtiene tenant desde subdominio/claim
 │    │    └── useAuth.ts            # integra Auth0
 │    ├── lib/
 │    │    ├── api.ts                # cliente HTTP (fetch/axios) con interceptor JWT
 │    │    ├── rls.ts                # utilidades de cabeceras/claims por tenant
 │    │    └── conf.ts               # endpoints, feature flags
 │    ├── i18n/
 │    │    ├── index.ts              # inicialización i18next
 │    │    ├── es/translation.json
 │    │    └── en/translation.json
 │    ├── styles/
 │    │    └── globals.css
 │    └── main.tsx
 ├── public/
 ├── .env.example                    # variables (API_URL, AUTH0_DOMAIN, etc.)
 ├── package.json
 └── vite.config.ts (o next.config.js si aplica)

Lineamientos de conexión Front ↔ Back
- **Resolución de tenant**: `useTenant` extrae el subdominio (p. ej., grupo1) y lo añade
como claim/cabecera en las solicitudes.
- **Autenticación**: `useAuth` integra Auth0 (PKCE). El token incluye `tenant_id`; se envía
en `Authorization: Bearer <token>`.
- **Cliente HTTP**: `lib/api.ts` centraliza llamadas REST; interceptores renuevan token y
agregan `X-Tenant-Id` si se requiere.
- **Rutas protegidas**: guards en Router verifican sesión válida antes de cargar vistas de
módulos.
- **i18n**: textos en `i18n/es` y `i18n/en`. El idioma por defecto es `es` con posibilidad de
conmutar per usuario.

Buenas prácticas de formularios
- Validación con React Hook Form + resolvers (Yup/Zod).
- Enmascaramiento para teléfonos y documentos.
- No registrar datos sensibles en logs del navegador.
- Sanitizar entradas y restringir pegado en campos críticos cuando aplique.

12. Permisos y Flujo de Integraciones en GitHub
Se establecen permisos y reglas de integración para garantizar la custodia docente y la
calidad del código. Todas las integraciones desde ramas feature hacia develop deberán
realizarse mediante Pull Request (PR) y solo podrán ser aprobadas por los Líderes de
Desarrollo/Arquitectura.

Roles y permisos en el repositorio
Permisos
Rol

Docente (Owner/Admin)

Administración total de la
organización y repositorio.
Gestión de miembros,

Observaciones

Crea el repositorio central,
define los CODEOWNERS y
secretos y protecciones.

reglas de protección.

Líder de
Desarrollo/Arquitecto
(Maintainer)

Aprobar/merge de PR a
develop y main; administrar
issues, labels y releases.

Desarrollador/Estudiante
(Contributor)

Crear ramas feature/*,
realizar commits y abrir PR
hacia develop.

ÚNICO rol autorizado para
aprobar integraciones de
feature → develop y de
release/hotfix → main.

Acceso mediante su cuenta
universitaria (correo
institucional). No pueden
hacer push directo a
develop ni main.

Reglas de protección de ramas
- **main**: rama protegida. No se permiten pushes directos. Integración SOLO por PR desde
release/* o hotfix/*, aprobada por un Líder. Requiere pasar checks de CI/CD y firma digital
de commits si aplica.
- **develop**: rama protegida. No se permiten pushes directos. Integración SOLO por PR
desde feature/*, aprobada por un Líder. Requiere checks de CI/CD exitosos.
- **feature/***: ramas de desarrollo por funcionalidad. Se crean a partir de develop. Al
finalizar, abrir PR a develop.
- **release/*** y **hotfix/***: ramas de estabilización/corrección. PR hacia main (y back-
merge a develop) con aprobación de un Líder.

Política de Pull Requests (PR)
- Toda integración feature → develop debe realizarse vía PR.
- **Aprobación obligatoria por un Líder** (CODEOWNERS) antes del merge.
- Checks obligatorios: build, pruebas unitarias, análisis estático, y smoke QA (cuando
aplique).
- Convención de títulos de PR: `feat:`, `fix:`, `chore:`, `docs:`; incluir referencia a issue.
- Revisión de seguridad: políticas de secretos (no credenciales), tamaño de PR razonable y
escaneo SAST.
- Estrategia de merge: preferencia **Squash & Merge** para mantener historial limpio.

CODEOWNERS y revisiones
- Se define archivo `.github/CODEOWNERS` para requerir revisión de Líderes en cambios de
backend (`/backend/**`), frontend (`/frontend/**`), y archivos de migraciones
(`/backend/src/main/resources/db/**`).
- Se habilita la regla "Require review from Code Owners" en GitHub para develop y main.

Conclusión
Como líderes técnicos y arquitectos, hemos definido la arquitectura, tecnologías,
proveedores y mecanismos de seguridad de la plataforma.

Este diseño garantiza un arranque sólido, económico y seguro, respetando las restricciones
del proyecto académico y asegurando cumplimiento normativo en el manejo de datos
sensibles.

El plan está preparado para iniciar inmediatamente con Java SE 24 y Spring Boot 3.5.5, con
la actualización planificada a Java SE 25 LTS cuando se libere.
