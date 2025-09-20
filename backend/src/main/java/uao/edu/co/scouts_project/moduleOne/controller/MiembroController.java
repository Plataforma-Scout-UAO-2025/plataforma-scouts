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
import uao.edu.co.scouts_project.moduleOne.model.Miembro;
import uao.edu.co.scouts_project.moduleOne.model.Tenant;
import uao.edu.co.scouts_project.moduleOne.repository.GrupoRepository;
import uao.edu.co.scouts_project.moduleOne.repository.MiembroRepository;
import uao.edu.co.scouts_project.moduleOne.repository.TenantRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/miembros")
@RequiredArgsConstructor
@Tag(name = "Miembro Management", description = "Gestión de miembros en el sistema")
public class MiembroController {

    private final MiembroRepository miembroRepository;
    private final TenantRepository tenantRepository;
    private final GrupoRepository grupoRepository;

    @GetMapping
    @Operation(summary = "Listar todos los miembros", description = "Obtiene una lista de todos los miembros registrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de miembros obtenida exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Miembro.class)))
    })
    public ResponseEntity<List<Miembro>> getAllMiembros() {
        List<Miembro> miembros = miembroRepository.findAll();
        return ResponseEntity.ok(miembros);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener miembro por ID", description = "Obtiene un miembro específico por su identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembro encontrado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Miembro.class))),
            @ApiResponse(responseCode = "404", description = "Miembro no encontrado")
    })
    public ResponseEntity<Miembro> getMiembroById(
            @Parameter(description = "ID del miembro a buscar", required = true)
            @PathVariable Long id) {
        Optional<Miembro> miembro = miembroRepository.findById(id);
        return miembro.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear nuevo miembro", description = "Crea un nuevo miembro en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Miembro creado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Miembro.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<Miembro> createMiembro(
            @Parameter(description = "Datos del miembro a crear", required = true)
            @RequestBody Miembro miembro) {
        try {
            // Verificar que el tenant existe
            if (miembro.getTenant() != null && miembro.getTenant().getTenantId() != null) {
                Optional<Tenant> tenant = tenantRepository.findById(miembro.getTenant().getTenantId());
                if (tenant.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                miembro.setTenant(tenant.get());
            }
            
            Miembro savedMiembro = miembroRepository.save(miembro);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMiembro);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar miembro", description = "Actualiza los datos de un miembro existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembro actualizado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Miembro.class))),
            @ApiResponse(responseCode = "404", description = "Miembro no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Miembro> updateMiembro(
            @Parameter(description = "ID del miembro a actualizar", required = true)
            @PathVariable Long id,
            @Parameter(description = "Nuevos datos del miembro", required = true)
            @RequestBody Miembro miembroDetails) {
        Optional<Miembro> optionalMiembro = miembroRepository.findById(id);
        if (optionalMiembro.isPresent()) {
            Miembro miembro = optionalMiembro.get();
            miembro.setNombre(miembroDetails.getNombre());
            miembro.setEmail(miembroDetails.getEmail());
            miembro.setApellido(miembroDetails.getApellido());
            miembro.setTelefono(miembroDetails.getTelefono());
            miembro.setFechaNacimiento(miembroDetails.getFechaNacimiento());
            miembro.setDocumentoIdentidad(miembroDetails.getDocumentoIdentidad());
            miembro.setTipoMiembro(miembroDetails.getTipoMiembro());
            miembro.setActivo(miembroDetails.getActivo());
            
            // Actualizar tenant si se proporciona
            if (miembroDetails.getTenant() != null && miembroDetails.getTenant().getTenantId() != null) {
                Optional<Tenant> tenant = tenantRepository.findById(miembroDetails.getTenant().getTenantId());
                if (tenant.isPresent()) {
                    miembro.setTenant(tenant.get());
                }
            }
            
            Miembro updatedMiembro = miembroRepository.save(miembro);
            return ResponseEntity.ok(updatedMiembro);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar miembro", description = "Elimina un miembro del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Miembro eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Miembro no encontrado")
    })
    public ResponseEntity<Void> deleteMiembro(
            @Parameter(description = "ID del miembro a eliminar", required = true)
            @PathVariable Long id) {
        if (miembroRepository.existsById(id)) {
            miembroRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/grupos")
    @Operation(summary = "Obtener grupos de un miembro", description = "Obtiene todos los grupos asociados a un miembro específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupos del miembro obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Miembro no encontrado")
    })
    public ResponseEntity<Set<Grupo>> getGruposByMiembro(
            @Parameter(description = "ID del miembro", required = true)
            @PathVariable Long id) {
        Optional<Miembro> miembro = miembroRepository.findById(id);
        if (miembro.isPresent()) {
            return ResponseEntity.ok(miembro.get().getGrupos());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{miembroId}/grupos/{grupoId}")
    @Operation(summary = "Agregar miembro a grupo", description = "Asocia un miembro a un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembro agregado al grupo exitosamente"),
            @ApiResponse(responseCode = "404", description = "Miembro o grupo no encontrado"),
            @ApiResponse(responseCode = "400", description = "El miembro ya pertenece al grupo")
    })
    public ResponseEntity<Miembro> addMiembroToGrupo(
            @Parameter(description = "ID del miembro", required = true)
            @PathVariable Long miembroId,
            @Parameter(description = "ID del grupo", required = true)
            @PathVariable Long grupoId) {
        Optional<Miembro> optionalMiembro = miembroRepository.findById(miembroId);
        Optional<Grupo> optionalGrupo = grupoRepository.findById(grupoId);
        
        if (optionalMiembro.isPresent() && optionalGrupo.isPresent()) {
            Miembro miembro = optionalMiembro.get();
            Grupo grupo = optionalGrupo.get();
            
            // Verificar que no esté ya en el grupo
            if (miembro.getGrupos().contains(grupo)) {
                return ResponseEntity.badRequest().build();
            }
            
            miembro.getGrupos().add(grupo);
            Miembro updatedMiembro = miembroRepository.save(miembro);
            return ResponseEntity.ok(updatedMiembro);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{miembroId}/grupos/{grupoId}")
    @Operation(summary = "Remover miembro de grupo", description = "Remueve la asociación de un miembro con un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembro removido del grupo exitosamente"),
            @ApiResponse(responseCode = "404", description = "Miembro o grupo no encontrado"),
            @ApiResponse(responseCode = "400", description = "El miembro no pertenece al grupo")
    })
    public ResponseEntity<Miembro> removeMiembroFromGrupo(
            @Parameter(description = "ID del miembro", required = true)
            @PathVariable Long miembroId,
            @Parameter(description = "ID del grupo", required = true)
            @PathVariable Long grupoId) {
        Optional<Miembro> optionalMiembro = miembroRepository.findById(miembroId);
        Optional<Grupo> optionalGrupo = grupoRepository.findById(grupoId);
        
        if (optionalMiembro.isPresent() && optionalGrupo.isPresent()) {
            Miembro miembro = optionalMiembro.get();
            Grupo grupo = optionalGrupo.get();
            
            // Verificar que esté en el grupo
            if (!miembro.getGrupos().contains(grupo)) {
                return ResponseEntity.badRequest().build();
            }
            
            miembro.getGrupos().remove(grupo);
            Miembro updatedMiembro = miembroRepository.save(miembro);
            return ResponseEntity.ok(updatedMiembro);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Obtener miembros por tenant", description = "Obtiene todos los miembros de un tenant específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembros del tenant obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<List<Miembro>> getMiembrosByTenant(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable Long tenantId) {
        Optional<Tenant> tenant = tenantRepository.findById(tenantId);
        if (tenant.isPresent()) {
            List<Miembro> miembros = miembroRepository.findByTenantTenantId(tenantId);
            return ResponseEntity.ok(miembros);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/grupo/{grupoId}")
    @Operation(summary = "Obtener miembros por grupo", description = "Obtiene todos los miembros de un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembros del grupo obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    public ResponseEntity<List<Miembro>> getMiembrosByGrupo(
            @Parameter(description = "ID del grupo", required = true)
            @PathVariable Long grupoId) {
        Optional<Grupo> grupo = grupoRepository.findById(grupoId);
        if (grupo.isPresent()) {
            List<Miembro> miembros = miembroRepository.findByGrupoId(grupoId);
            return ResponseEntity.ok(miembros);
        }
        return ResponseEntity.notFound().build();
    }
}