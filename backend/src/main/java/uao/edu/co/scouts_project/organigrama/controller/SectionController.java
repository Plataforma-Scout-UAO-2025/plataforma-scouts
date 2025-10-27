package uao.edu.co.scouts_project.organigrama.controller;

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
import uao.edu.co.scouts_project.organigrama.dto.UpdateImageRequest;
import uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest;
import uao.edu.co.scouts_project.organigrama.service.SectionService;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Sections", description = "Operaciones CRUD para la gestión de secciones/ramas scouts (Manada, Tropa, Comunidad, Clan)")
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/groups/{groupSlug}/sections")
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
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
    return sectionService.getSectionsByGroup(tenantId, groupSlug);
    }

    @Operation(
        summary = "Obtener una rama con sus subramas",
        description = "Devuelve la sección (rama) y la lista de subgrupos asociados."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @GetMapping("/{sectionId}/with-subgroups")
    public Map<String, Object> getSectionWithSubgroups(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId
    ) {
    return sectionService.getSectionWithSubgroups(tenantId, groupSlug, sectionId);
    }

    @Operation(summary = "Obtener sección por ID", description = "Retorna una sección específica por su ID dentro de un grupo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sección encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @GetMapping("/{sectionId}")
    public SectionResponseDTO getSectionById(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
    return sectionService.getSectionById(tenantId, groupSlug, sectionId);
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
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "Datos de la sección a crear")
        @Valid @RequestBody SectionDTO dto) {
        SectionResponseDTO created = sectionService.createSection(tenantId, groupSlug, dto);
        return ResponseEntity
            .created(URI.create("/api/v1/tenants/" + tenantId + "/groups/" + groupSlug + "/sections/" + created.sectionId()))
            .body(created);
    }

    @Operation(summary = "Actualizar sección", description = "Actualiza los datos de una sección existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sección actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{sectionId}")
    public SectionResponseDTO updateSection(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "Datos actualizados de la sección")
        @Valid @RequestBody SectionDTO dto) {
    return sectionService.updateSection(tenantId, groupSlug, sectionId, dto);
    }

    @Operation(summary = "Eliminar sección", description = "Elimina una sección del sistema, incluyendo todas sus imágenes asociadas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Sección eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> deleteSection(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
    sectionService.deleteSection(tenantId, groupSlug, sectionId);
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
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
    sectionService.deleteIconImage(tenantId, groupSlug, sectionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar foto principal de una sección", description = "Elimina el archivo de la foto principal de Supabase y desvincula el ID de la sección.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Foto principal eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrada")
    })
    @DeleteMapping("/{sectionId}/photo-principal")
    public ResponseEntity<Void> deletePhotoPrincipal(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
    sectionService.deletePhotoPrincipal(tenantId, groupSlug, sectionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar una imagen específica de la galería de una sección",
               description = "Desvincula una imagen (por UUID) de la galería de la sección. Opcionalmente, borra el objeto del storage si `deleteFromStorage=true`.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recurso actualizado devuelto"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o imagen no encontrada")
    })
    @DeleteMapping("/{sectionId}/gallery/{objectId}")
    public ResponseEntity<SectionResponseDTO> deleteGalleryImageById(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID (UUID) del objeto de storage a eliminar")
        @PathVariable UUID objectId,
        @Parameter(description = "Si es true, también borra el objeto del storage")
        @RequestParam(name = "deleteFromStorage", defaultValue = "false") boolean deleteFromStorage) {

        SectionResponseDTO updated = sectionService.deleteGalleryImageById(
            tenantId, groupSlug, sectionId, objectId, deleteFromStorage
        );
        return ResponseEntity.ok(updated);
    }

    // ============== ENDPOINTS PATCH PARA ACTUALIZACIÓN INDIVIDUAL ==============

    @Operation(summary = "Actualizar solo el ícono de una sección", description = "Actualiza únicamente la imagen del ícono sin modificar otros campos de la sección. Elimina automáticamente el ícono anterior de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Ícono actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @PatchMapping("/{sectionId}/icon")
    public ResponseEntity<Void> updateIcon(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "UUID del nuevo ícono en Supabase Storage")
        @Valid @RequestBody UpdateImageRequest request) {
    sectionService.updateIcon(tenantId, groupSlug, sectionId, request.objectId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Actualizar solo la foto principal de una sección", description = "Actualiza únicamente la imagen de la foto principal sin modificar otros campos de la sección. Elimina automáticamente la foto anterior de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Foto principal actualizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @PatchMapping("/{sectionId}/photo-principal")
    public ResponseEntity<Void> updatePhotoPrincipal(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "UUID de la nueva foto principal en Supabase Storage")
        @Valid @RequestBody UpdateImageRequest request) {
    sectionService.updatePhotoPrincipal(tenantId, groupSlug, sectionId, request.objectId());
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Modificar imágenes de la galería",
        description = "Permite reemplazar, agregar o eliminar imágenes de la galería por UUID. " +
                      "Operaciones: replace (reemplazar), add (agregar), remove (eliminar). " +
                      "Devuelve la sección actualizada con la galería en formato estable [{ id, url }]."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Operaciones aplicadas exitosamente y recurso actualizado devuelto"),
        @ApiResponse(responseCode = "400", description = "UUID faltante/no válido u operación inválida"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @PatchMapping("/{sectionId}/gallery")
    public ResponseEntity<SectionResponseDTO> patchGallery(
        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
        @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "Operaciones a aplicar sobre la galería")
        @Valid @RequestBody GalleryPatchRequest request) {

        SectionResponseDTO updated = sectionService.patchGalleryAndReturn(
            tenantId, groupSlug, sectionId, request.operations()
        );
        return ResponseEntity.ok(updated);
    }
}
