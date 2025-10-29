package uao.edu.co.scouts_project.statistics.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uao.edu.co.scouts_project.statistics.dto.TotalMembersDTO;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;

import java.util.Map;
import org.springframework.http.HttpStatus;

@Tag(name = "StatisticsGlobal", description = "Endpoints globales de estadísticas")
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsGlobalController {

    private final MemberStatisticsService memberStatisticsService;

    public StatisticsGlobalController(MemberStatisticsService memberStatisticsService) {
        this.memberStatisticsService = memberStatisticsService;
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }
}
