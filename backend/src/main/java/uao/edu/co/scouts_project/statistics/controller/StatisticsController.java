package uao.edu.co.scouts_project.statistics.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uao.edu.co.scouts_project.statistics.dto.GroupStatisticsDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;

import java.util.Map;
import java.util.List;

@Tag(name = "Statistics", description = "Endpoints para obtener estadísticas del sistema")
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/statistics")
public class StatisticsController {

    private final GroupStatisticsService groupStatisticsService;

    public StatisticsController(GroupStatisticsService groupStatisticsService) {
        this.groupStatisticsService = groupStatisticsService;
    }

    @Operation(summary = "Obtener grupos con más miembros por tenant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Top grupos obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido - No tiene permisos para este tenant"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/most-members")
    public ResponseEntity<?> getTopGroupsByMembers(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable String tenantId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String headerTenantId
    ) {
        try {
            if (headerTenantId == null || headerTenantId.isBlank()) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing X-Tenant-Id header"));
            }

            if (!headerTenantId.equals(tenantId)) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tenant mismatch or no permissions"));
            }

            // default top 5
            var result = groupStatisticsService.getTopGroupsByMembers(tenantId, 5);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }

    @Operation(summary = "Obtener estadísticas de grupos por tenant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido - No tiene permisos para este tenant"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups")
    public ResponseEntity<?> getGroupStatistics(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable String tenantId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String headerTenantId
    ) {
        try {
            // Simple header-based checks to support tests when security is not fully configured
            if (headerTenantId == null || headerTenantId.isBlank()) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing X-Tenant-Id header"));
            }

            if (!headerTenantId.equals(tenantId)) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tenant mismatch or no permissions"));
            }

            GroupStatisticsDTO result = groupStatisticsService.getGroupStatistics(tenantId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }

    @Operation(summary = "Obtener cantidad de miembros por grupo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cantidad de miembros por grupo obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido - No tiene permisos para este tenant"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/members-count")
    public ResponseEntity<Object> getMembersByGroup(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable String tenantId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String headerTenantId
    ) {
        if (headerTenantId == null || headerTenantId.isBlank()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Missing X-Tenant-Id header"));
        }

        if (!headerTenantId.equals(tenantId)) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Tenant mismatch or no permissions"));
        }

        try {
            List<GroupMembersDTO> result = groupStatisticsService.getMembersByGroup(tenantId);
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException e) {
            return ResponseEntity
                .status(e.getStatusCode())
                .body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }

    @Operation(summary = "Obtener número de grupos inactivos por tenant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conteo de grupos inactivos obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Prohibido - No tiene permisos para este tenant"),
            @ApiResponse(responseCode = "404", description = "Tenant no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/inactive")
    public ResponseEntity<?> getInactiveGroupStatistics(
            @Parameter(description = "ID del tenant", required = true)
            @PathVariable String tenantId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String headerTenantId
    ) {
        try {
            if (headerTenantId == null || headerTenantId.isBlank()) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing X-Tenant-Id header"));
            }

            if (!headerTenantId.equals(tenantId)) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tenant mismatch or no permissions"));
            }

            var result = groupStatisticsService.getInactiveGroupStatistics(tenantId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }
}