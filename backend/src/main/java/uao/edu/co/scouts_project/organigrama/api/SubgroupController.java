package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;
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

@Tag(name = "Subgroups", description = "Operaciones CRUD para la gestión de subgrupos scouts (Seisenes, Patrullas, Equipos, Tribus)")
@RestController
@RequestMapping("/api/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups")
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
    public List<SubgroupDTO> getSubgroupsBySection(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId) {
        return subgroupService.getSubgroupsBySection(tenantSlug, groupSlug, sectionId);
    }
    
    @Operation(summary = "Obtener subgrupo por ID", description = "Retorna un subgrupo específico por su ID dentro de una sección")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Subgrupo encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @GetMapping("/{subgroupId}")
    public SubgroupDTO getSubgroupById(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId) {
        return subgroupService.getSubgroupById(tenantSlug, groupSlug, sectionId, subgroupId);
    }
    
    @Operation(summary = "Crear nuevo subgrupo", description = "Crea un nuevo subgrupo scout (Seisen, Patrulla, Equipo, Tribu) dentro de una sección")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Subgrupo creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo o sección no encontrado"),
        @ApiResponse(responseCode = "409", description = "El nombre del subgrupo ya existe en la sección")
    })
    @PostMapping
    public ResponseEntity<SubgroupDTO> createSubgroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "Datos del subgrupo a crear")
        @Valid @RequestBody SubgroupDTO dto) {
        SubgroupDTO created = subgroupService.createSubgroup(tenantSlug, groupSlug, sectionId, dto);
        String location = "/api/tenants/" + tenantSlug + "/groups/" + groupSlug + 
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
    public SubgroupDTO updateSubgroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId,
        @Parameter(description = "Datos actualizados del subgrupo")
        @Valid @RequestBody SubgroupDTO dto) {
        return subgroupService.updateSubgroup(tenantSlug, groupSlug, sectionId, subgroupId, dto);
    }
    
    @Operation(summary = "Eliminar subgrupo", description = "Elimina un subgrupo del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Subgrupo eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant, grupo, sección o subgrupo no encontrado")
    })
    @DeleteMapping("/{subgroupId}")
    public ResponseEntity<Void> deleteSubgroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "ID único de la sección", example = "1")
        @PathVariable Long sectionId,
        @Parameter(description = "ID único del subgrupo", example = "1")
        @PathVariable Long subgroupId) {
        subgroupService.deleteSubgroup(tenantSlug, groupSlug, sectionId, subgroupId);
        return ResponseEntity.noContent().build();
    }
}