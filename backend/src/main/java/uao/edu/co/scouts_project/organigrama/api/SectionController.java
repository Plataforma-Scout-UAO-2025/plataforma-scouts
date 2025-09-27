package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@Tag(name = "Sections", description = "Operaciones CRUD para la gestión de secciones/ramas scouts (Manada, Tropa, Comunidad, Clan)")
@RestController
@RequestMapping("/api/tenants/{tenantSlug}/groups/{groupSlug}/sections")
public class SectionController {
    
    private final SectionService sectionService;
    
    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }
    
    @Operation(summary = "Obtener secciones por grupo", description = "Retorna todas las secciones/ramas scouts de un grupo específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de secciones obtenida exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @GetMapping
    public List<SectionDTO> getSectionsByGroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
        return sectionService.getSectionsByGroup(tenantSlug, groupSlug);
    }
    
    @Operation(summary = "Obtener sección por ID", description = "Retorna una sección específica por su ID dentro de un grupo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sección encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @GetMapping("/{sectionId}")
    public SectionDTO getSectionById(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
        return sectionService.getSectionById(tenantSlug, groupSlug, sectionId);
    }
    
    @Operation(summary = "Crear nueva sección", description = "Crea nueva sección/rama scout (Manada, Tropa, Comunidad, Clan) dentro de un grupo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Sección creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado"),
        @ApiResponse(responseCode = "409", description = "El nombre de la sección ya existe en el grupo")
    })
    @PostMapping
    public ResponseEntity<SectionDTO> createSection(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "Datos de la sección a crear")
        @Valid @RequestBody SectionDTO dto) {
        SectionDTO created = sectionService.createSection(tenantSlug, groupSlug, dto);
        return ResponseEntity.created(URI.create("/api/tenants/" + tenantSlug + "/groups/" + groupSlug + "/sections/" + created.sectionId())).body(created);
    }
    
    @Operation(summary = "Actualizar sección", description = "Actualiza los datos de una sección existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sección actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{sectionId}")
    public SectionDTO updateSection(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "Datos actualizados de la sección")
        @Valid @RequestBody SectionDTO dto) {
        return sectionService.updateSection(tenantSlug, groupSlug, sectionId, dto);
    }
    
    @Operation(summary = "Eliminar sección", description = "Elimina una sección del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Sección eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> deleteSection(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
        sectionService.deleteSection(tenantSlug, groupSlug, sectionId);
        return ResponseEntity.noContent().build();
    }
}
