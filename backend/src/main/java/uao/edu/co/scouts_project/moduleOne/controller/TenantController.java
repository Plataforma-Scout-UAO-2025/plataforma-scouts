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
import uao.edu.co.scouts_project.moduleOne.model.Tenant;
import uao.edu.co.scouts_project.moduleOne.repository.TenantRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenant Management", description = "Gestión de organizaciones/tenants en el sistema")
public class TenantController {

    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "Listar todos los tenants", description = "Obtiene una lista de todos los tenants/organizaciones registrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de tenants obtenida exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tenant.class)))
    })
    public ResponseEntity<List<Tenant>> getAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();
        return ResponseEntity.ok(tenants);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tenant por ID", description = "Obtiene un tenant específico por su identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tenant encontrado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tenant.class))),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<Tenant> getTenantById(
            @Parameter(description = "ID del tenant a buscar", required = true)
            @PathVariable Long id) {
        Optional<Tenant> tenant = tenantRepository.findById(id);
        return tenant.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear nuevo tenant", description = "Crea un nuevo tenant/organización en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tenant creado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tenant.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Tenant> createTenant(
            @Parameter(description = "Datos del tenant a crear", required = true)
            @RequestBody Tenant tenant) {
        try {
            Tenant savedTenant = tenantRepository.save(tenant);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTenant);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tenant", description = "Actualiza los datos de un tenant existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tenant actualizado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tenant.class))),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Tenant> updateTenant(
            @Parameter(description = "ID del tenant a actualizar", required = true)
            @PathVariable Long id,
            @Parameter(description = "Nuevos datos del tenant", required = true)
            @RequestBody Tenant tenantDetails) {
        Optional<Tenant> optionalTenant = tenantRepository.findById(id);
        if (optionalTenant.isPresent()) {
            Tenant tenant = optionalTenant.get();
            tenant.setNombre(tenantDetails.getNombre());
            // Actualizar otros campos según sea necesario
            Tenant updatedTenant = tenantRepository.save(tenant);
            return ResponseEntity.ok(updatedTenant);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar tenant", description = "Elimina un tenant del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tenant eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<Void> deleteTenant(
            @Parameter(description = "ID del tenant a eliminar", required = true)
            @PathVariable Long id) {
        if (tenantRepository.existsById(id)) {
            tenantRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/grupos")
    @Operation(summary = "Obtener grupos de un tenant", description = "Obtiene todos los grupos asociados a un tenant específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupos del tenant obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<?> getGruposByTenant(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable Long id) {
        Optional<Tenant> tenant = tenantRepository.findById(id);
        if (tenant.isPresent()) {
            return ResponseEntity.ok(tenant.get().getGrupos());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/miembros")
    @Operation(summary = "Obtener miembros de un tenant", description = "Obtiene todos los miembros asociados a un tenant específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Miembros del tenant obtenidos exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    public ResponseEntity<?> getMiembrosByTenant(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable Long id) {
        Optional<Tenant> tenant = tenantRepository.findById(id);
        if (tenant.isPresent()) {
            return ResponseEntity.ok(tenant.get().getMiembros());
        }
        return ResponseEntity.notFound().build();
    }
}