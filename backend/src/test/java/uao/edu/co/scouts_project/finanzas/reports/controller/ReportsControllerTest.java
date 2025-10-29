package uao.edu.co.scouts_project.finanzas.reports.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uao.edu.co.scouts_project.finanzas.reports.dto.*;
import uao.edu.co.scouts_project.finanzas.reports.service.ReportsService;

class ReportsControllerStandaloneTest {

  private MockMvc mvc;
  private ReportsService reportsService;
  private ReportsController controller;

  @BeforeEach
  void setup() {
    reportsService = Mockito.mock(ReportsService.class);
    controller = new ReportsController(reportsService);
    mvc = MockMvcBuilders.standaloneSetup(controller).build();
  }

  @Test
  void post_financial_devuelve_200_y_objeto_esperado() throws Exception {
    var resp = FinancialReport.builder()
        .financial_summary(ReportSummary.builder()
            .income(new BigDecimal("220000"))
            .pending(new BigDecimal("80000"))
            .overdue(new BigDecimal("150000"))
            .build())
        .members_ok(7)
        .members_overdue(3)
        .percentage(new BigDecimal("70.00"))
        .payments(List.of(
            ReportPayments.builder()
                .payment_id("p001").fisrt_name("Ana").last_name("Gómez")
                .amount(new BigDecimal("100000")).paid_at(LocalDate.of(2025,10,6))
                .build()
        ))
        .build();

    when(reportsService.generateFinancialReport(
        org.mockito.ArgumentMatchers.eq("org_SCOUT"),
        org.mockito.ArgumentMatchers.any()
    )).thenReturn(resp);

    String body = """
      { "start_date":"2025-10-01", "end_date":"2025-10-31", "generated_for":"SECTION", "id":"3" }
      """;

    mvc.perform(post("/api/v1/finanzas/reports/{tenantId}", "org_SCOUT")
        .contentType(MediaType.APPLICATION_JSON)
        .content(body))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.financial_summary.income").value(220000))
      .andExpect(jsonPath("$.members_ok").value(7))
      .andExpect(jsonPath("$.percentage").value(70.00))
      .andExpect(jsonPath("$.payments[0].payment_id").value("p001"));
  }
}
