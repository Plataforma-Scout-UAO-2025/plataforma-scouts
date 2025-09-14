# Convenciones de Código

## 1. Convenciones de Nombres
- Paquetes: `lowercase` – ej: `uao.edu.co.scouts_project.miembros`
- Clases: `PascalCase` – `MiembroService`, `EventoController`
- Métodos / variables: `camelCase` – `findById`, `tenantId`
- Constantes: `MAYUS_CON_GUIONES` – `MAX_USERS`
- DTOs: sufijo `DTO` – `MiembroDTO`
- Repositorios (contratos): prefijo `I` + sufijo `Repository` – `IMiembroRepository`
- Mappers: sufijo `Mapper` – `MiembroMapper`
- Excepciones: sufijo `Exception` – `MiembroNotFoundException`

## 2. Estructura de Módulos
Cada módulo sigue el mismo patrón (crear sólo cuando se necesite):
```
<modulo>/
  controller/
  service/
  repository/
  model/
  dto/
  mapper/
  exception/
  config/
```
Ejemplos de módulos previstos: `miembros`, `progresion`, `eventos`, `finanzas`, `auth`, `common`.

## 3. Endpoints REST
- Prefijo y versión obligatoria: `/api/v1/...`
- Recursos en plural: `/miembros`, `/eventos`
- Rutas anidadas para relaciones: `/eventos/{eventId}/participantes`
- Verbos HTTP adecuados:
  - GET (list / detail)
  - POST (create)
  - PUT (replace) / PATCH (partial update)
  - DELETE (remove)

Ejemplo controlador mínimo:
```java
@RestController
@RequestMapping("/api/v1/miembros")
public class MiembrosController {

    private final IMiembroService miembroService; // inyección de dependencias

    public MiembrosController(IMiembroService miembroService) {
        this.miembroService = miembroService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MiembroDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(miembroService.findById(id));
    }
}
```

## 4. Swagger / OpenAPI
- Dependencia sugerida: `springdoc-openapi-starter-webmvc-ui`
- Anotar controlador:
```java
@Tag(name = "Miembros", description = "Operaciones sobre miembros")
@RestController
@RequestMapping("/api/v1/miembros")
class MiembrosController { }
```
- Anotar métodos:
```java
@Operation(summary = "Obtener miembro por id")
@GetMapping("/{id}")
public MiembroDTO get(@PathVariable Long id) { ... }
```
- DTOs:
```java
@Schema(description = "Miembro del grupo scout")
public record MiembroDTO(Long id, String nombre) { }
```

## 5. Git y Pull Requests
- Flujo: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`
- Commits: prefijos `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- PRs pequeñas (< ~300 líneas netas) y revisadas obligatoriamente
- Mensajes concisos (inglés):
  - `feat: add member retrieval endpoint`
  - `fix: correct null check in auth filter`

## 6. Manejo de Errores HTTP
| Código | Uso | Ejemplo |
|-------|-----|---------|
| 200 OK | Respuesta exitosa GET | Obtener miembro |
| 201 Created | POST exitoso | Crear miembro |
| 204 No Content | DELETE/PUT sin cuerpo | Eliminar miembro |
| 400 Bad Request | Validación fallida | Datos incompletos |
| 401 Unauthorized | Token inválido/ausente | Falta Auth header |
| 403 Forbidden | Sin permisos | Acceso a recurso de otro tenant |
| 404 Not Found | Recurso no existe | Miembro no encontrado |
| 409 Conflict | Estado conflictivo | Duplicado lógico |
| 422 Unprocessable Entity | Regla de negocio | Violación de progresión |
| 429 Too Many Requests | Rate limiting | Límite excedido |
| 500 Internal Server Error | Error no controlado | NullPointer imprevisto |
| 503 Service Unavailable | Dependencia caída | DB no accesible |


## 7. Excepciones
- Personalizadas por contexto: `MiembroNotFoundException`, `EventoInvalidoException`
- Manejador global futuro: `@ControllerAdvice` + `@ExceptionHandler`

## 8. DTO vs Model
- `model/`: entidades de dominio o persistencia (más adelante)
- `dto/`: objetos para entrada/salida API (no exponer entidades directamente)

## 9. Interfaces (Prefijo I)
- Servicios opcionalmente: `IMiembroService`
- Repositorios (contratos): `IMiembroRepository`
- Evitar prefijo en clases concretas: `MiembroServiceImpl` si se requiere distinción

## 10. Ejemplo de Servicio + Repositorio
```java
public interface IMiembroRepository { Optional<Miembro> findById(Long id); }

public interface IMiembroService { MiembroDTO findById(Long id); }

@Service
class MiembroServiceImpl implements IMiembroService {
    private final IMiembroRepository repo;
    private final MiembroMapper mapper;
    MiembroServiceImpl(IMiembroRepository repo, MiembroMapper mapper) { this.repo = repo; this.mapper = mapper; }
    @Override public MiembroDTO findById(Long id) { return repo.findById(id).map(mapper::toDto).orElseThrow(() -> new MiembroNotFoundException(id)); }
}
```

## 11. Mapper (ejemplo)
```java
@Component
public class MiembroMapper {
    public MiembroDTO toDto(Miembro m) { return new MiembroDTO(m.getId(), m.getNombre()); }
}
```

---
© Convenciones Proyecto Scouts
