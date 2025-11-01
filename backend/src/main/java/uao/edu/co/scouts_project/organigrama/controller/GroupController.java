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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uao.edu.co.scouts_project.organigrama.dto.UpdateGroupActiveStatusDTO;
import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdateImageRequest;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.IGroupService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

import java.net.URI;
import java.util.List;

@Tag(name = "Groups", description = "Operaciones CRUD para la gestión de grupos scouts dentro de un tenant")
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/groups")
public class GroupController {

        private final IGroupService groupService;
        private final ObjectMapper objectMapper;
        private static final Logger log = LoggerFactory.getLogger(GroupController.class);

        public GroupController(IGroupService groupService, ObjectMapper objectMapper) {
                this.groupService = groupService;
                this.objectMapper = objectMapper;
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

        @Operation(summary = "Crear un nuevo grupo", description = "Crea un nuevo grupo dentro del tenant especificado")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o faltantes")
        })

        @PostMapping
        public ResponseEntity<GroupResponseDTO> createGroup(
                        @Parameter(description = "Tenant ID", example = "tenant-001") @PathVariable String tenantId,
                        @Valid @RequestBody GroupDTO dto) {
                GroupResponseDTO created = groupService.createGroup(tenantId, dto);
                return ResponseEntity
                                .created(URI.create("/api/v1/tenants/" + tenantId + "/groups/" + created.slug()))
                                .body(created);
        }

        @Operation(summary = "Crear un nuevo grupo scout", description = """
                        Crea un nuevo grupo dentro de un tenant específico.
                        Los campos requeridos son `slug`, `name` y el `tenantId` se toma desde la URL.
                        Los demás campos son opcionales (nullable).
                        """, tags = { "Groups" })
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente", content = @Content(schema = @Schema(implementation = GroupResponseDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
                        @ApiResponse(responseCode = "409", description = "Ya existe un grupo con el mismo slug dentro del tenant"),
                        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
        })
        @PostMapping("/create")
        public ResponseEntity<GroupResponseDTO> createGroup(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, description = "Datos necesarios para crear el grupo", content = @Content(schema = @Schema(implementation = CreatingGroupDTO.class))) @Valid @RequestBody CreatingGroupDTO entity) {

                GroupResponseDTO created = groupService.createGroup(entity);

                return ResponseEntity
                                .created(URI.create("/api/v1/tenants/" + entity.getTenantId() + "/groups/"
                                                + created.slug()))
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

        @Operation(summary = "Actualizar parcialmente un grupo (ruta base)", description = "PATCH genérico que acepta campos parciales y valida intento de cambiar slug/tenantId")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Grupo actualizado correctamente"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o intento de modificar campos inmutables"),
                        @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
        })
        @PatchMapping("/{groupSlug}")
        public GroupResponseDTO patchGroup(
                        @PathVariable String tenantId,
                        @PathVariable String groupSlug,
                        @RequestBody(required = false) String rawBody) {

                Map<String, Object> payload;
                if (rawBody == null || rawBody.trim().isEmpty()) {
                        payload = Map.of();
                } else {
                        try {
                                payload = objectMapper.readValue(rawBody, new TypeReference<Map<String, Object>>() {
                                });
                        } catch (JsonProcessingException e) {
                                String candidate = rawBody.trim();
                                // Si viene envuelto en comillas dobles, quitar las comillas externas y des-escapar
                                if (candidate.length() >= 2 && candidate.startsWith("\"") && candidate.endsWith("\"")) {
                                        candidate = candidate.substring(1, candidate.length() - 1).replaceAll("\\\\\"", "\"").trim();
                                }
                                if (!candidate.startsWith("{")) {
                                        candidate = "{" + candidate + "}";
                                }
                                try {
                                        payload = objectMapper.readValue(candidate, new TypeReference<Map<String, Object>>() {
                                        });
                                } catch (JsonProcessingException ex) {
                                        // Intentar parseo manual mediante regex de pares "key": value
                                        Pattern p = Pattern.compile("\\\"([^\\\"]+)\\\"\\s*:\\s*(\\\"([^\\\"]*)\\\"|true|false|null|[-+]?[0-9]+(?:\\.[0-9]+)?)", Pattern.CASE_INSENSITIVE);
                                        Matcher m = p.matcher(candidate);
                                        java.util.Map<String, Object> manual = new java.util.HashMap<>();
                                        while (m.find()) {
                                                String key = m.group(1);
                                                String rawVal = m.group(2);
                                                Object val = null;
                                                if (rawVal == null) {
                                                        val = null;
                                                } else if (rawVal.equalsIgnoreCase("true")) {
                                                        val = Boolean.TRUE;
                                                } else if (rawVal.equalsIgnoreCase("false")) {
                                                        val = Boolean.FALSE;
                                                } else if (rawVal.equalsIgnoreCase("null")) {
                                                        val = null;
                                                } else if (rawVal.startsWith("\"") && rawVal.endsWith("\"")) {
                                                        val = m.group(3); // contenido sin comillas
                                                } else {
                                                        // intentar como número
                                                        try {
                                                                if (rawVal.contains(".")) val = Double.valueOf(rawVal);
                                                                else val = Long.valueOf(rawVal);
                                                        } catch (NumberFormatException nfe) {
                                                                val = rawVal;
                                                        }
                                                }
                                                manual.put(key, val);
                                        }
                                        if (!manual.isEmpty()) {
                                                payload = manual;
                                        } else {
                                                log.warn("No se pudo parsear el body PATCH recibido (raw): {}", rawBody);
                                                throw new IllegalArgumentException("Body inválido para PATCH: no es JSON");
                                        }
                                }
                        }
                }

                // Validar intento de cambiar tenantId desde el body
                if (payload.containsKey("tenantId") || payload.containsKey("tenant_id") || payload.containsKey("tenantid")) {
                        throw new IllegalArgumentException("El campo tenantId es inmutable");
                }

                // Validar intento de cambiar slug (cuando viene no-null y distinto)
                if (payload.containsKey("slug")) {
                        Object slugValue = payload.get("slug");
                        if (slugValue != null && !groupSlug.equals(String.valueOf(slugValue))) {
                                throw new IllegalArgumentException("El campo slug es inmutable");
                        }
                        // slug == null --> ignorarlo
                }

                // Mapear manualmente los campos esperados al DTO (aceptar camelCase y snake_case)
                UpdatingGroupDTO dto = new UpdatingGroupDTO();
                // Usar conversiones seguras para evitar ClassCastException si Bruno envía
                // números u otros tipos en lugar de Strings (p. ej. identifier_number)
                if (payload.containsKey("name")) {
                        Object v = payload.get("name");
                        dto.setName(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("district")) {
                        Object v = payload.get("district");
                        dto.setDistrict(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("identifier_number")) {
                        Object v = payload.get("identifier_number");
                        dto.setIdentifierNumber(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("identifierNumber")) {
                        Object v = payload.get("identifierNumber");
                        dto.setIdentifierNumber(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("address")) {
                        Object v = payload.get("address");
                        dto.setAddress(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("phone")) {
                        Object v = payload.get("phone");
                        dto.setPhone(v == null ? null : String.valueOf(v));
                }
                if (payload.containsKey("email")) {
                        Object v = payload.get("email");
                        dto.setEmail(v == null ? null : String.valueOf(v));
                }
                // isActive puede venir como isActive o is_active
                if (payload.containsKey("is_active") || payload.containsKey("isActive")) {
                        Object isActiveVal = payload.containsKey("is_active") ? payload.get("is_active") : payload.get("isActive");
                        if (isActiveVal instanceof Boolean) dto.setIsActive((Boolean) isActiveVal);
                        else if (isActiveVal == null) dto.setIsActive(null);
                        else dto.setIsActive(Boolean.valueOf(String.valueOf(isActiveVal)));
                }
                if (payload.containsKey("status")) {
                        Object v = payload.get("status");
                        dto.setStatus(v == null ? null : String.valueOf(v));
                }
                // Otros campos opcionales que no se usan en los tests pueden ser añadidos si es necesario

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

}