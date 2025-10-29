package uao.edu.co.scouts_project.finanzas.dashboard.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto.KpisDto;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto.PorcentajeCumplimientoDto;
import uao.edu.co.scouts_project.finanzas.dashboard.dto.DashboardFinancieroDto.DistribucionPagosDto;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.RecentPaymentProjection;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.TopDebtorProjection;
import uao.edu.co.scouts_project.finanzas.dashboard.service.DashboardService;

class DashboardControllerStandaloneTest {

  private MockMvc mvc;
  private DashboardService service;
  private DashboardController controller;

  @BeforeEach
  void setup() {
    service = mock(DashboardService.class);
    controller = new DashboardController(service);
    mvc = MockMvcBuilders.standaloneSetup(controller).build();
  }

  @Test
  void getDashboardForTenant_returns200_andBody() throws Exception {
    var dto = DashboardFinancieroDto.builder()
        .kpis(KpisDto.builder()
            .total_recaudado(new BigDecimal("500000"))
            .total_pendiente(new BigDecimal("120000"))
            .pagos_vencidos(8L)
            .build())
        .porcentaje_cumplimiento(List.of(
            PorcentajeCumplimientoDto.builder()
                .nombre("Lobatos")
                .porcentaje(85.5) // double
                .build()
        ))
        .distribucion_pagos(DistribucionPagosDto.builder()
            .porcentaje_pagado(62.5)
            .porcentaje_pendiente(25.0)
            .porcentaje_vencido(12.5)
            .build())
        .ultimos_pagos(Collections.<RecentPaymentProjection>emptyList())
        .miembros_mora(Collections.<TopDebtorProjection>emptyList())
        .build();

    when(service.getDashboardForTenant("org_SCOUT")).thenReturn(dto);

    mvc.perform(get("/api/v1/finanzas/dashboard/{tenantId}", "org_SCOUT")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.kpis.total_recaudado").value(500000))
        .andExpect(jsonPath("$.kpis.total_pendiente").value(120000))
        .andExpect(jsonPath("$.kpis.pagos_vencidos").value(8))
        .andExpect(jsonPath("$.porcentaje_cumplimiento[0].nombre").value("Lobatos"))
        .andExpect(jsonPath("$.porcentaje_cumplimiento[0].porcentaje").value(85.5))
        .andExpect(jsonPath("$.distribucion_pagos.porcentaje_pagado").value(62.5))
        .andExpect(jsonPath("$.distribucion_pagos.porcentaje_pendiente").value(25.0))
        .andExpect(jsonPath("$.distribucion_pagos.porcentaje_vencido").value(12.5));

    verify(service).getDashboardForTenant("org_SCOUT");
  }
}
