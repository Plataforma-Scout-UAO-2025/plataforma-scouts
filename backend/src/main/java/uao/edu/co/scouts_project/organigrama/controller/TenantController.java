package uao.edu.co.scouts_project.organigrama.controller;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.dto.TenantInfoDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.ITenantService;
import uao.edu.co.scouts_project.organigrama.dto.OrgIdDTO;
import uao.edu.co.scouts_project.organigrama.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@Tag(name = "Tenants", description = "Operaciones CRUD para la gestión de tenants/organizaciones")
@RestController
@RequestMapping("/api/v1/tenants")
public class TenantController {

    private final ITenantService tenantService;

    private final Logger logger = LoggerFactory.getLogger(TenantController.class);

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
            @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId) {
        return tenantService.getTenantById(tenantId);
    }
    
    @Operation(summary = "Obtener org_id por slug", description = "Retorna el org_id (tenant_id) asociado a un slug público. Útil para flujo de login/redirect en frontend.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Org_id retornado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Tenant no encontrado para el slug")
    })
    @GetMapping("/slug/{slug}")
    public OrgIdDTO getOrgIdBySlug(
        @Parameter(description = "Slug público del tenant/organización", example = "plataformascouts")
        @PathVariable String slug) {
        String tenantId = tenantService.getTenantIdBySlug(slug);
        return new OrgIdDTO(tenantId);
    }

    @Operation(summary = "Crear nuevo tenant", description = "Crea un nuevo tenant/organización en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tenant creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
            @ApiResponse(responseCode = "409", description = "El slug del tenant ya existe")
    })
    @PostMapping
    public ResponseEntity<TenantDTO> createTenant(
            @Parameter(description = "Datos del tenant a crear") @Valid @RequestBody TenantDTO dto) {
        logger.info("Creando tenant con slug: {}", dto.slug());

        TenantDTO created = tenantService.createTenant(dto);
        logger.info("Tenant creado: {}", created.tenantId());

        String locationId = created.tenantId() != null ? created.tenantId() : created.slug();
        return ResponseEntity.created(URI.create("/api/v1/tenants/" + locationId)).body(created);
    }

    @PostMapping("/create")
    @Operation(summary = "Crear nuevo tenant", description = "Crea un nuevo tenant/organización en el sistema con validación de slug único")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tenant creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados"),
            @ApiResponse(responseCode = "409", description = "El slug del tenant ya existe")
    })
    public ResponseEntity<TenantDTO> createTenant(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del tenant a crear", required = true, content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json", schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = TenantInfoDTO.class))) @Valid @RequestBody TenantInfoDTO dto) {

        logger.info("Creando tenant con slug: {}", dto.getSlug());

        TenantDTO created = tenantService.createTenantInfo(dto);
        logger.info("Tenant creado con ID: {}", created.tenantId());

        return ResponseEntity
                .created(URI.create("/api/v1/tenants/" + created.tenantId()))
                .body(created);
    }

    @PutMapping("/{tenantId}")
    @Operation(summary = "Actualizar tenant", description = "Actualiza los datos de un tenant existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tenant actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos proporcionados")
    })
    public TenantDTO updateTenant(
            @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos actualizados del tenant", required = true, content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json", schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = TenantInfoDTO.class))) @Valid @RequestBody TenantInfoDTO dto) {
        return tenantService.updateTenantInfo(tenantId, dto);
    }

    @Operation(summary = "Eliminar tenant", description = "Elimina un tenant del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tenant eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado")
    })
    @DeleteMapping("/{tenantId}")
    public ResponseEntity<Void> deleteTenant(
            @Parameter(description = "Identificador interno (tenant_id)", example = "tenant-001") @PathVariable String tenantId) {
        tenantService.deleteTenant(tenantId);
        return ResponseEntity.noContent().build();
    }
}