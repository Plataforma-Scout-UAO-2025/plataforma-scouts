package uao.edu.co.scouts_project.moduleOne.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.moduleOne.model.Grupo;
import uao.edu.co.scouts_project.moduleOne.model.Tenant;
import uao.edu.co.scouts_project.moduleOne.repository.GrupoRepository;
import uao.edu.co.scouts_project.moduleOne.repository.TenantRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/grupos")
@RequiredArgsConstructor
@Tag(name = "Grupo Management", description = "Gestión de grupos en el sistema")
public class GrupoController {

    private final GrupoRepository grupoRepository;
    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Listar todos los grupos", description = "Obtiene una lista de todos los grupos registrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de grupos obtenida exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Grupo.class)))
    })
    public ResponseEntity<List<Grupo>> getAllGrupos() {
        List<Grupo> grupos = grupoRepository.findAll();
        return ResponseEntity.ok(grupos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener grupo por ID", description = "Obtiene un grupo específico por su identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupo encontrado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Grupo.class))),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    public ResponseEntity<Grupo> getGrupoById(
            @Parameter(description = "ID del grupo a buscar", required = true)
            @PathVariable Long id) {
        Optional<Grupo> grupo = grupoRepository.findById(id);
        return grupo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear nuevo grupo", description = "Crea un nuevo grupo en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Grupo.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<Grupo> createGrupo(
            @Parameter(description = "Datos del grupo a crear", required = true)
            @RequestBody Grupo grupo) {
        try {
            // Verificar que el tenant existe
            if (grupo.getTenant() != null && grupo.getTenant().getTenantId() != null) {
                Optional<Tenant> tenant = tenantRepository.findById(grupo.getTenant().getTenantId());
                if (tenant.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                grupo.setTenant(tenant.get());
            }
            
            Grupo savedGrupo = grupoRepository.save(grupo);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGrupo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar grupo", description = "Actualiza los datos de un grupo existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupo actualizado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Grupo.class))),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Grupo> updateGrupo(
            @Parameter(description = "ID del grupo a actualizar", required = true)
            @PathVariable Long id,
            @Parameter(description = "Nuevos datos del grupo", required = true)
            @RequestBody Grupo grupoDetails) {
        Optional<Grupo> optionalGrupo = grupoRepository.findById(id);
        if (optionalGrupo.isPresent()) {
            Grupo grupo = optionalGrupo.get();
            grupo.setNombre(grupoDetails.getNombre());
            
            // Actualizar tenant si se proporciona
            if (grupoDetails.getTenant() != null && grupoDetails.getTenant().getTenantId() != null) {
                Optional<Tenant> tenant = tenantRepository.findById(grupoDetails.getTenant().getTenantId());
                if (tenant.isPresent()) {
                    grupo.setTenant(tenant.get());
                }
            }
            
            Grupo updatedGrupo = grupoRepository.save(grupo);
            return ResponseEntity.ok(updatedGrupo);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar grupo", description = "Elimina un grupo del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Grupo eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    public ResponseEntity<Void> deleteGrupo(
            @Parameter(description = "ID del grupo a eliminar", required = true)
            @PathVariable Long id) {
        if (grupoRepository.existsById(id)) {
            grupoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/miembros")
    @Operation(summary = "Obtener miembros de un grupo", description = "Obtiene todos los miembros asociados a un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembros del grupo obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    public ResponseEntity<?> getMiembrosByGrupo(
            @Parameter(description = "ID del grupo", required = true)
            @PathVariable Long id) {
        Optional<Grupo> grupo = grupoRepository.findById(id);
        if (grupo.isPresent()) {
            return ResponseEntity.ok(grupo.get().getMiembros());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Obtener grupos por tenant", description = "Obtiene todos los grupos de un tenant específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupos del tenant obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<List<Grupo>> getGruposByTenant(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable Long tenantId) {
        Optional<Tenant> tenant = tenantRepository.findById(tenantId);
        if (tenant.isPresent()) {
            List<Grupo> grupos = grupoRepository.findByTenantTenantId(tenantId);
            return ResponseEntity.ok(grupos);
        }
        return ResponseEntity.notFound().build();
    }
}