package uao.edu.co.scouts_project.finanzas.dashboard.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto;
import uao.edu.co.scouts_project.finanzas.dashboard.service.DashboardService;

@RestController
@RequestMapping("/api/v1/finanzas/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

@Operation(
    summary = "Dashboard financiero (Tesorería)",
    description = "Devuelve los KPIs, distribución de pagos, cumplimiento y morosos para el tenant indicado."
)
@ApiResponse(responseCode = "200", description = "OK",
    content = @Content(schema = @Schema(implementation = DashboardFinancieroDto.class)))
@GetMapping("/{tenantId}")
public ResponseEntity<DashboardFinancieroDto> getDashboardForTenant(
        @Parameter(name = "tenantId", in = ParameterIn.PATH, example = "org_6B3k4dao2Wf6eGxa")
        @PathVariable String tenantId
) {
    service.normalizeOverdues(tenantId);
    var dto = service.getDashboardForTenant(tenantId);
    return ResponseEntity.ok(dto);
}
    
}
