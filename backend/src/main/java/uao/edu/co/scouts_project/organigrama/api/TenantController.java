package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.service.TenantService;
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

@Tag(name = "Tenants", description = "Operaciones CRUD para la gestión de tenants/organizaciones")
@RestController
@RequestMapping("/api/v1/tenants")
public class TenantController {
    
    private final TenantService tenantService;
    
    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }
    
    @Operation(summary = "Obtener todos los tenants", description = "Retorna una lista de todos los tenants/organizaciones registrados")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de tenants obtenida exitosamente")
    })
    @GetMapping
    public List<TenantDTO> getAllTenants() {
        return tenantService.getAllTenants();
    }
    
    @Operation(summary = "Obtener tenant por slug", description = "Retorna un tenant específico por su identificador slug")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tenant encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @GetMapping("/{tenantSlug}")
    public TenantDTO getTenantBySlug(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug) {
        return tenantService.getTenantBySlug(tenantSlug);
    }
    
    @Operation(summary = "Crear nuevo tenant", description = "Crea un nuevo tenant/organización en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Tenant creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
        @ApiResponse(responseCode = "409", description = "El slug del tenant ya existe")
    })
    @PostMapping
    public ResponseEntity<TenantDTO> createTenant(
        @Parameter(description = "Datos del tenant a crear")
        @Valid @RequestBody TenantDTO dto) {
        TenantDTO created = tenantService.createTenant(dto);
        return ResponseEntity.created(URI.create("/api/v1/tenants/" + created.slug())).body(created);
    }
    
    @Operation(summary = "Actualizar tenant", description = "Actualiza los datos de un tenant existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tenant actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{tenantSlug}")
    public TenantDTO updateTenant(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug,
        @Parameter(description = "Datos actualizados del tenant")
        @Valid @RequestBody TenantDTO dto) {
        return tenantService.updateTenant(tenantSlug, dto);
    }
    
    @Operation(summary = "Eliminar tenant", description = "Elimina un tenant del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Tenant eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @DeleteMapping("/{tenantSlug}")
    public ResponseEntity<Void> deleteTenant(
        @Parameter(description = "Identificador único del tenant", example = "region-valle")
        @PathVariable String tenantSlug) {
        tenantService.deleteTenant(tenantSlug);
        return ResponseEntity.noContent().build();
    }
}