package uao.edu.co.scouts_project.organigrama.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdateImageRequest;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;

import java.net.URI;
import java.util.List;
// TODO: GALERÍA DE FOTOS - Import temporalmente comentado
// import java.util.UUID; // <-- IMPORTADO

@Tag(name = "Subgroups", description = "Operaciones CRUD para la gestión de subgrupos scouts (Seisenes, Patrullas, Equipos, Tribus)")
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/groups/{groupSlug}/sections/{sectionId}/subgroups")
public class SubgroupController {
    
    private final SubgroupService subgroupService;
    
    public SubgroupController(SubgroupService subgroupService) {
        this.subgroupService = subgroupService;
    }

    @Operation(summary = "Obtener subgrupos por sección", description = "Retorna todos los subgrupos de una sección específica (Seisenes, Patrullas, Equipos, Tribus)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de subgrupos obtenida exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado")
    })
    @GetMapping
    public List<SubgroupResponseDTO> getSubgroupsBySection(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
    return subgroupService.getSubgroupsBySection(tenantId, groupSlug, sectionId);
    }
    
    @Operation(summary = "Obtener subgrupo por ID", description = "Retorna un subgrupo específico por su ID dentro de una sección")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Subgrupo encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @GetMapping("/{subgroupId}")
    public SubgroupResponseDTO getSubgroupById(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId) {
    return subgroupService.getSubgroupById(tenantId, groupSlug, sectionId, subgroupId);
    }
    
    @Operation(summary = "Crear nuevo subgrupo", description = "Crea un nuevo subgrupo scout (Seisen, Patrulla, Equipo, Tribu) dentro de una sección")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Subgrupo creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado"),
        @ApiResponse(responseCode = "409", description = "El nombre del subgrupo ya existe en la sección")
    })
    @PostMapping
    public ResponseEntity<SubgroupResponseDTO> createSubgroup(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "Datos del subgrupo a crear")
        @Valid @RequestBody SubgroupDTO dto) {
    SubgroupResponseDTO created = subgroupService.createSubgroup(tenantId, groupSlug, sectionId, dto);
    String location = "/api/v1/tenants/" + tenantId + "/groups/" + groupSlug +
                         "/sections/" + sectionId + "/subgroups/" + created.subgroupId();
        return ResponseEntity.created(URI.create(location)).body(created);
    }
    
    @Operation(summary = "Actualizar subgrupo", description = "Actualiza los datos de un subgrupo existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Subgrupo actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{subgroupId}")
    public SubgroupResponseDTO updateSubgroup(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId,
        @Parameter(description = "Datos actualizados del subgrupo")
        @Valid @RequestBody SubgroupDTO dto) {
    return subgroupService.updateSubgroup(tenantId, groupSlug, sectionId, subgroupId, dto);
    }
    
    @Operation(summary = "Eliminar subgrupo", description = "Elimina un subgrupo del sistema, incluyendo todas sus imágenes asociadas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Subgrupo eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @DeleteMapping("/{subgroupId}")
    public ResponseEntity<Void> deleteSubgroup(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId) {
    subgroupService.deleteSubgroup(tenantId, groupSlug, sectionId, subgroupId);
        return ResponseEntity.noContent().build();
    }



    // ============== ENDPOINT PARA ELIMINACIÓN DE IMAGEN INDIVIDUAL DE LA GALERÍA ==============
    // TODO: GALERÍA DE FOTOS - Endpoint temporalmente deshabilitado

    /*@Operation(summary = "Eliminar una imagen específica de la galería de un subgrupo", description = "Elimina un archivo específico de la galería de Supabase y desvincula su ID del subgrupo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Imagen de la galería eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección, subgrupo o imagen no encontrada")
    })
    @DeleteMapping("/{subgroupId}/gallery/{objectId}") // <-- RUTA CORREGIDA
    public ResponseEntity<Void> deleteGalleryImageById( // <-- MÉTODO CORREGIDO
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId,
        @Parameter(description = "ID (UUID) del objeto de storage a eliminar")
        @PathVariable UUID objectId) { // <-- PARÁMETRO AÑADIDO
        subgroupService.deleteGalleryImageById(tenantSlug, groupSlug, sectionId, subgroupId, objectId); // <-- LLAMADA CORREGIDA
        return ResponseEntity.noContent().build();
    }*/
    
    // ============== NUEVO ENDPOINT PATCH PARA ACTUALIZACIÓN INDIVIDUAL ==============
    
    @Operation(summary = "Actualizar solo la foto principal de un subgrupo", description = "Actualiza únicamente la imagen de la foto principal sin modificar otros campos del subgrupo. Elimina automáticamente la foto anterior de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Foto principal actualizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @PatchMapping("/{subgroupId}/photo-principal")
    public ResponseEntity<Void> updatePhotoPrincipal(
    @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
    @PathVariable String tenantId,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId,
        @Parameter(description = "UUID de la nueva foto principal en Supabase Storage")
        @Valid @RequestBody UpdateImageRequest request) {
    subgroupService.updatePhotoPrincipal(tenantId, groupSlug, sectionId, subgroupId, request.objectId());
        return ResponseEntity.noContent().build();
    }
    
    // TODO: GALERÍA DE FOTOS - Endpoint temporalmente deshabilitado
    /*@Operation(summary = "Modificar imágenes de la galería", 
               description = "Permite reemplazar, agregar o eliminar imágenes de la galería por UUID. " +
                             "El backend encuentra automáticamente el índice de la imagen. " +
                             "Operaciones: replace (reemplazar), add (agregar nueva), remove (eliminar). " +
                             "Elimina automáticamente las imágenes reemplazadas/eliminadas de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Operaciones aplicadas exitosamente"),
        @ApiResponse(responseCode = "400", description = "UUID no encontrado o operación inválida"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @PatchMapping("/{subgroupId}/gallery")
    public ResponseEntity<Void> patchGallery(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId,
        @Parameter(description = "Operaciones JSON Patch a aplicar")
        @Valid @RequestBody uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest request) {
        subgroupService.patchGallery(tenantSlug, groupSlug, sectionId, subgroupId, request.operations());
        return ResponseEntity.noContent().build();
    }*/
}