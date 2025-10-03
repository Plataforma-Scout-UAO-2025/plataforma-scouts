package uao.edu.co.scouts_project.organigrama.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;

import java.net.URI;
import java.util.List;
import java.util.UUID; 

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
    public List<SectionResponseDTO> getSectionsByGroup(
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
    public SectionResponseDTO getSectionById(
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
    public ResponseEntity<SectionResponseDTO> createSection(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "Datos de la sección a crear")
        @Valid @RequestBody SectionDTO dto) {
        SectionResponseDTO created = sectionService.createSection(tenantSlug, groupSlug, dto);
        return ResponseEntity.created(URI.create("/api/tenants/" + tenantSlug + "/groups/" + groupSlug + "/sections/" + created.sectionId())).body(created);
    }
    
    @Operation(summary = "Actualizar sección", description = "Actualiza los datos de una sección existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sección actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{sectionId}")
    public SectionResponseDTO updateSection(
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
    
    @Operation(summary = "Eliminar sección", description = "Elimina una sección del sistema, incluyendo todas sus imágenes asociadas.")
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

    // ============== ENDPOINTS PARA ELIMINACIÓN DE IMÁGENES INDIVIDUALES ==============

    @Operation(summary = "Eliminar imagen del ícono de una sección", description = "Elimina el archivo del ícono de Supabase y desvincula el ID de la sección.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Imagen del ícono eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrada")
    })
    @DeleteMapping("/{sectionId}/icon")
    public ResponseEntity<Void> deleteIconImage(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
        sectionService.deleteIconImage(tenantSlug, groupSlug, sectionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar una imagen específica de la galería de una sección", description = "Elimina un archivo específico de la galería de Supabase y desvincula su ID de la sección.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Imagen de la galería eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o imagen no encontrada")
    })
    @DeleteMapping("/{sectionId}/gallery/{objectId}") // <-- RUTA CORREGIDA
    public ResponseEntity<Void> deleteGalleryImageById( // <-- MÉTODO CORREGIDO
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID (UUID) del objeto de storage a eliminar")
        @PathVariable UUID objectId) { // <-- PARÁMETRO AÑADIDO
        sectionService.deleteGalleryImageById(tenantSlug, groupSlug, sectionId, objectId); // <-- LLAMADA CORREGIDA
        return ResponseEntity.noContent().build();
    }
}