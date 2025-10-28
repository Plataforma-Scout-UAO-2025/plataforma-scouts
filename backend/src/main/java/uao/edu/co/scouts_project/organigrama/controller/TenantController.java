package uao.edu.co.scouts_project.organigrama.controller;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.ITenantService;
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
    
    private final ITenantService tenantService;
    
    public TenantController(ITenantService tenantService) {
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
    
    @Operation(summary = "Obtener tenant por tenant_id", description = "Retorna un tenant específico por su identificador interno tenant_id")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tenant encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @GetMapping("/{tenantId}")
    public TenantDTO getTenantById(
        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
        @PathVariable String tenantId) {
        return tenantService.getTenantById(tenantId);
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
    String locationId = created.tenantId() != null ? created.tenantId() : created.slug();
    return ResponseEntity.created(URI.create("/api/v1/tenants/" + locationId)).body(created);
    }
    
    @Operation(summary = "Actualizar tenant", description = "Actualiza los datos de un tenant existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tenant actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    @PutMapping("/{tenantId}")
    public TenantDTO updateTenant(
        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
        @PathVariable String tenantId,
        @Parameter(description = "Datos actualizados del tenant")
        @Valid @RequestBody TenantDTO dto) {
        return tenantService.updateTenant(tenantId, dto);
    }
    
    @Operation(summary = "Eliminar tenant", description = "Elimina un tenant del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Tenant eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @DeleteMapping("/{tenantId}")
    public ResponseEntity<Void> deleteTenant(
        @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001")
        @PathVariable String tenantId) {
        tenantService.deleteTenant(tenantId);
        return ResponseEntity.noContent().build();
    }
}