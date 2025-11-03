package uao.edu.co.scouts_project.organigrama.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import uao.edu.co.scouts_project.organigrama.dto.UpdateGroupActiveStatusDTO;
import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdateImageRequest;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.IGroupService;
import uao.edu.co.scouts_project.organigrama.dto.CreateGroupAdminRequestDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupAdminCreatedResponseDTO;

import java.net.URI;
import java.util.List;

@Tag(name = "Groups", description = "Operaciones CRUD para la gestión de grupos scouts dentro de un tenant")
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/groups")
public class GroupController {

        private final IGroupService groupService;

        public GroupController(IGroupService groupService) {
                this.groupService = groupService;
        }

        @Operation(summary = "Obtener todos los grupos de un tenant")
        @ApiResponse(responseCode = "200", description = "Listado de grupos obtenido correctamente")
        @GetMapping
        public List<GroupResponseDTO> getGroupsByTenant(
                        @Parameter(description = "Identificador del tenant", example = "tenant-001") @PathVariable String tenantId) {
                return groupService.getGroupsByTenant(tenantId);
        }

        @Operation(summary = "Obtener un grupo por su slug")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Grupo encontrado"),
                        @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
        })
        @GetMapping("/{groupSlug}")
        public GroupResponseDTO getGroupBySlug(
                        @Parameter(description = "Tenant ID", example = "tenant-001") @PathVariable String tenantId,
                        @Parameter(description = "Slug del grupo", example = "grupo-803") @PathVariable String groupSlug) {
                return groupService.getGroupBySlug(tenantId, groupSlug);
        }

        @Operation(summary = "Obtener todos los grupos")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Grupos encontrados"),
                        @ApiResponse(responseCode = "404", description = "No se encontraron grupos")
        })
        @GetMapping("/getAll")
        public GroupResponseDTO[] getAllGroups() {
                return groupService.getAllGroups();
        }

        @Operation(summary = "Crear un nuevo grupo (multipart)", description = "Crea un nuevo grupo y permite enviar una imagen opcional para la organización")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o faltantes")
        })
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<GroupResponseDTO> createGroupMultipart(
                        @Parameter(description = "Payload JSON del grupo") @RequestPart("dto") @Valid GroupDTO dto,
                        @Parameter(description = "Imagen opcional para la organización", schema = @Schema(type = "string", format = "binary"))
                        @RequestPart(name = "image", required = false) MultipartFile image) {
                GroupResponseDTO created = groupService.createGroupFull(dto, image);
                return ResponseEntity
                                .created(URI.create("/api/v1/tenants/" + created.tenantId() + "/groups/" + created.slug()))
                                .body(created);
        }


        @Operation(summary = "Actualizar parcialmente un grupo existente", description = "Actualiza solo los campos enviados en el body (PATCH)")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Grupo actualizado correctamente"),
                        @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
        })
        @PatchMapping("/{groupSlug}/update")
        public GroupResponseDTO updateGroup(
                        @Parameter(description = "Tenant ID", example = "org-001") @PathVariable String tenantId,
                        @Parameter(description = "Slug del grupo", example = "grupo-803") @PathVariable String groupSlug,
                        @Valid @RequestBody UpdatingGroupDTO dto) {
                return groupService.updateGroup(tenantId, groupSlug, dto);
        }

        @PutMapping("/{groupSlug}")
        public GroupResponseDTO updateGroup(@PathVariable String tenantId, @PathVariable String groupSlug,
                        @Valid @RequestBody GroupDTO dto) {
                return groupService.updateGroup(tenantId, groupSlug, dto);
        }

        @Operation(summary = "Activar o desactivar un grupo", description = "Permite a un ADMIN_GLOBAL activar o desactivar el grupo (cambiar isActive)")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Estado actualizado correctamente"),
                        @ApiResponse(responseCode = "404", description = "Grupo no encontrado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos")
        })
        @PatchMapping("/{groupSlug}/active")
        @PreAuthorize("hasRole('ADMIN_GLOBAL')")
        public GroupResponseDTO updateGroupActiveStatus(
                        @PathVariable String tenantId,
                        @PathVariable String groupSlug,
                        @Valid @RequestBody UpdateGroupActiveStatusDTO dto) {
                return groupService.updateGroupActiveStatus(tenantId, groupSlug, dto.getIsActive());
        }

        // ============== NUEVOS ENDPOINTS PARA ELIMINACIÓN INDIVIDUAL ==============

        @Operation(summary = "Eliminar imagen del logo de un grupo", description = "Elimina el archivo del logo de Supabase y desvincula el ID del grupo.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Imagen del logo eliminada exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
        })
        @DeleteMapping("/{groupSlug}/logo")
        public ResponseEntity<Void> deleteLogoImage(
                        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId,
                        @Parameter(description = "Identificador único del grupo", example = "grupo-803") @PathVariable String groupSlug) {
                groupService.deleteLogoImage(tenantId, groupSlug);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Eliminar imagen del pañolón de un grupo", description = "Elimina el archivo del pañolón de Supabase y desvincula el ID del grupo.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Imagen del pañolón eliminada exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
        })
        @DeleteMapping("/{groupSlug}/scarf")
        public ResponseEntity<Void> deleteScarfImage(
                        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId,
                        @Parameter(description = "Identificador único del grupo", example = "grupo-803") @PathVariable String groupSlug) {
                groupService.deleteScarfImage(tenantId, groupSlug);
                return ResponseEntity.noContent().build();
        }

        // ============== NUEVOS ENDPOINTS PATCH PARA ACTUALIZACIÓN INDIVIDUAL
        // ==============

        @Operation(summary = "Actualizar solo el logo de un grupo", description = "Actualiza únicamente la imagen del logo sin modificar otros campos del grupo. Elimina automáticamente el logo anterior de Supabase.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Logo actualizado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "ObjectId inválido"),
                        @ApiResponse(responseCode = "404", description = "Tenant o grupo no encontrado")
        })
        @PatchMapping("/{groupSlug}/logo")
        public ResponseEntity<Void> updateLogo(
                        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId,
                        @Parameter(description = "Identificador único del grupo", example = "grupo-803") @PathVariable String groupSlug,
                        @Parameter(description = "UUID del nuevo logo en Supabase Storage") @Valid @RequestBody UpdateImageRequest request) {
                groupService.updateLogo(tenantId, groupSlug, request.objectId());
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
                        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId,
                        @Parameter(description = "Identificador único del grupo", example = "grupo-803") @PathVariable String groupSlug,
                        @Parameter(description = "UUID del nuevo pañolón en Supabase Storage") @Valid @RequestBody UpdateImageRequest request) {
                groupService.updateScarf(tenantId, groupSlug, request.objectId());
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/{groupId}/admins")
        @PreAuthorize("hasRole('ADMIN_GLOBAL')")
        @Operation(
                        summary = "Crear admin de grupo (ADMIN_GRUPO)",
                        description = "Crea un usuario en Auth0 con rol ADMIN_GRUPO dentro de la organización (tenant) del grupo",
                        responses = {
                                        @ApiResponse(responseCode = "201", description = "Admin de grupo creado",
                                                        content = @Content(schema = @Schema(implementation = GroupAdminCreatedResponseDTO.class))),
                                        @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
                                        @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
                        }
        )
        public ResponseEntity<GroupAdminCreatedResponseDTO> createGroupAdmin(
                        @PathVariable String tenantId,
                        @PathVariable Long groupId,
                        @Valid @RequestBody CreateGroupAdminRequestDTO request) {
                GroupAdminCreatedResponseDTO created = groupService.addGroupAdmin(groupId, request);
                return ResponseEntity.status(201).body(created);
        }

}