package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.service.GroupService;
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

@Tag(name = "Groups", description = "Operaciones CRUD para la gestión de grupos scouts dentro de un tenant")
@RestController
@RequestMapping("/api/tenants/{tenantSlug}/groups")
public class GroupController {
    
    private final GroupService groupService;
    
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }
    
    @Operation(summary = "Obtener grupos por tenant", description = "Retorna todos los grupos scouts de un tenant específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de grupos obtenida exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @GetMapping
    public List<GroupDTO> getGroupsByTenant(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug) {
        return groupService.getGroupsByTenant(tenantSlug);
    }
    
    @Operation(summary = "Obtener grupo por slug", description = "Retorna un grupo específico por su slug dentro de un tenant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Grupo encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @GetMapping("/{groupSlug}")
    public GroupDTO getGroupBySlug(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
        return groupService.getGroupBySlug(tenantSlug, groupSlug);
    }
    
    @Operation(summary = "Crear nuevo grupo", description = "Crea un nuevo grupo scout dentro de un tenant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
        @ApiResponse(responseCode = "409", description = "El slug del grupo ya existe")
    })
    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Datos del grupo a crear")
        @Valid @RequestBody GroupDTO dto) {
        GroupDTO created = groupService.createGroup(tenantSlug, dto);
        return ResponseEntity.created(URI.create("/api/tenants/" + tenantSlug + "/groups/" + created.slug())).body(created);
    }
    
    @Operation(summary = "Actualizar grupo", description = "Actualiza los datos de un grupo existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Grupo actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{groupSlug}")
    public GroupDTO updateGroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug,
        @Parameter(description = "Datos actualizados del grupo")
        @Valid @RequestBody GroupDTO dto) {
        return groupService.updateGroup(tenantSlug, groupSlug, dto);
    }
    
    @Operation(summary = "Eliminar grupo", description = "Elimina un grupo del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Grupo eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
    })
    @DeleteMapping("/{groupSlug}")
    public ResponseEntity<Void> deleteGroup(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Identificador único del grupo", example = "grupo-803")
        @PathVariable String groupSlug) {
        groupService.deleteGroup(tenantSlug, groupSlug);
        return ResponseEntity.noContent().build();
    }
}