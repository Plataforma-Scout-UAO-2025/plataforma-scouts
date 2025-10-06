package uao.edu.co.scouts_project.organigrama.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdateImageRequest;
import uao.edu.co.scouts_project.organigrama.service.GroupService;

import java.net.URI;
import java.util.List;

@Tag(name = "Groups", description = "Operaciones CRUD para la gestión de grupos scouts dentro de un tenant")
@RestController
@RequestMapping("/api/v1/tenants/{tenantSlug}/groups")
public class GroupController {
    
    private final GroupService groupService;
    
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }
    
    @GetMapping
    public List<GroupResponseDTO> getGroupsByTenant(@PathVariable String tenantSlug) {
        return groupService.getGroupsByTenant(tenantSlug);
    }
    
    @GetMapping("/{groupSlug}")
    public GroupResponseDTO getGroupBySlug(@PathVariable String tenantSlug, @PathVariable String groupSlug) {
        return groupService.getGroupBySlug(tenantSlug, groupSlug);
    }
    
    @PostMapping
    public ResponseEntity<GroupResponseDTO> createGroup(@PathVariable String tenantSlug, @Valid @RequestBody GroupDTO dto) {
        GroupResponseDTO created = groupService.createGroup(tenantSlug, dto);
        return ResponseEntity.created(URI.create("/api/v1/tenants/" + tenantSlug + "/groups/" + created.slug())).body(created);
    }
    
    @PutMapping("/{groupSlug}")
    public GroupResponseDTO updateGroup(@PathVariable String tenantSlug, @PathVariable String groupSlug, @Valid @RequestBody GroupDTO dto) {
        return groupService.updateGroup(tenantSlug, groupSlug, dto);
    }
    
    @DeleteMapping("/{groupSlug}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String tenantSlug, @PathVariable String groupSlug) {
        groupService.deleteGroup(tenantSlug, groupSlug);
        return ResponseEntity.noContent().build();
    }

    // ============== NUEVOS ENDPOINTS PARA ELIMINACIÓN INDIVIDUAL ==============
    
    @Operation(summary = "Eliminar imagen del logo de un grupo", description = "Elimina el archivo del logo de Supabase y desvincula el ID del grupo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Imagen del logo eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @DeleteMapping("/{groupSlug}/logo")
    public ResponseEntity<Void> deleteLogoImage(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
        groupService.deleteLogoImage(tenantSlug, groupSlug);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar imagen del pañolón de un grupo", description = "Elimina el archivo del pañolón de Supabase y desvincula el ID del grupo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Imagen del pañolón eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @DeleteMapping("/{groupSlug}/scarf")
    public ResponseEntity<Void> deleteScarfImage(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
        groupService.deleteScarfImage(tenantSlug, groupSlug);
        return ResponseEntity.noContent().build();
    }
    
    // ============== NUEVOS ENDPOINTS PATCH PARA ACTUALIZACIÓN INDIVIDUAL ==============
    
    @Operation(summary = "Actualizar solo el logo de un grupo", description = "Actualiza únicamente la imagen del logo sin modificar otros campos del grupo. Elimina automáticamente el logo anterior de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Logo actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @PatchMapping("/{groupSlug}/logo")
    public ResponseEntity<Void> updateLogo(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "UUID del nuevo logo en Supabase Storage")
        @Valid @RequestBody UpdateImageRequest request) {
        groupService.updateLogo(tenantSlug, groupSlug, request.objectId());
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Actualizar solo el pañolón de un grupo", description = "Actualiza únicamente la imagen del pañolón sin modificar otros campos del grupo. Elimina automáticamente el pañolón anterior de Supabase.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pañolón actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @PatchMapping("/{groupSlug}/scarf")
    public ResponseEntity<Void> updateScarf(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "UUID del nuevo pañolón en Supabase Storage")
        @Valid @RequestBody UpdateImageRequest request) {
        groupService.updateScarf(tenantSlug, groupSlug, request.objectId());
        return ResponseEntity.noContent().build();
    }
}