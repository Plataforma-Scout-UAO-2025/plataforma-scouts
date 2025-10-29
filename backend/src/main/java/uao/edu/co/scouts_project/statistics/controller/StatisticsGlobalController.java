package uao.edu.co.scouts_project.statistics.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uao.edu.co.scouts_project.statistics.dto.*;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;

import java.util.Map;
import java.util.List;
import org.springframework.http.HttpStatus;

@Tag(name = "StatisticsGlobal", description = "Endpoints globales de estadísticas")
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsGlobalController {

    private final MemberStatisticsService memberStatisticsService;
    private final GroupStatisticsService groupStatisticsService;

    public StatisticsGlobalController(MemberStatisticsService memberStatisticsService, GroupStatisticsService groupStatisticsService) {
        this.memberStatisticsService = memberStatisticsService;
        this.groupStatisticsService = groupStatisticsService;
    }

    @Operation(summary = "Obtener número total de miembros en la base de datos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Total de miembros obtenido"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/members/total")
    public ResponseEntity<?> getTotalMembers() {
        try {
            TotalMembersDTO dto = memberStatisticsService.getTotalMembers();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "timestamp", java.time.LocalDateTime.now().toString(),
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Ha ocurrido un error interno en el servidor",
                    "details", e.getMessage()
                ));
        }
    }

    @Operation(summary = "Obtener estadísticas de grupos activos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups")
    public ResponseEntity<?> getGroupStatistics() {
        try {
            GroupStatisticsDTO dto = groupStatisticsService.getGroupStatistics();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "timestamp", java.time.LocalDateTime.now().toString(),
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Ha ocurrido un error interno en el servidor",
                    "details", e.getMessage()
                ));
        }
    }

    @Operation(summary = "Obtener estadísticas de grupos inactivos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/inactive")
    public ResponseEntity<?> getInactiveGroupStatistics() {
        try {
            InactiveGroupStatisticsDTO dto = groupStatisticsService.getInactiveGroupStatistics();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "timestamp", java.time.LocalDateTime.now().toString(),
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Ha ocurrido un error interno en el servidor",
                    "details", e.getMessage()
                ));
        }
    }

    @Operation(summary = "Obtener conteo de miembros por grupo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conteos obtenidos exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/members-count")
    public ResponseEntity<?> getMembersByGroup() {
        try {
            List<GroupMembersDTO> result = groupStatisticsService.getMembersByGroup();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "timestamp", java.time.LocalDateTime.now().toString(),
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Ha ocurrido un error interno en el servidor",
                    "details", e.getMessage()
                ));
        }
    }

    @Operation(summary = "Obtener grupos con más miembros")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/groups/most-members")
    public ResponseEntity<?> getTopGroupsByMembers() {
        try {
            List<GroupMembersCountDTO> result = groupStatisticsService.getTopGroupsByMembers(10);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "timestamp", java.time.LocalDateTime.now().toString(),
                    "status", 500,
                    "error", "Internal Server Error",
                    "message", "Ha ocurrido un error interno en el servidor",
                    "details", e.getMessage()
                ));
        }
    }
}
