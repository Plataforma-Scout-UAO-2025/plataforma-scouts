package uao.edu.co.scouts_project.finanzas.reports.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import uao.edu.co.scouts_project.finanzas.reports.dto.FinancialReport;
import uao.edu.co.scouts_project.finanzas.reports.dto.GenerateFinancialReportRequest;
import uao.edu.co.scouts_project.finanzas.reports.model.enums.ReportScope;
import uao.edu.co.scouts_project.finanzas.reports.repository.ReportsReadRepository;
import uao.edu.co.scouts_project.finanzas.reports.repository.projection.MemberOverdueCountRow;
import uao.edu.co.scouts_project.finanzas.reports.repository.projection.ReportPaymentsRow;
import uao.edu.co.scouts_project.finanzas.reports.repository.projection.ReportSummaryRow;

@ExtendWith(MockitoExtension.class)
class ReportsServiceImplTest {

  @Mock ReportsReadRepository repo;
  @InjectMocks ReportsServiceImpl service;

  @Test
  void genera_reporte_con_porcentaje_miembros_ok() {
    var req = GenerateFinancialReportRequest.builder()
        .start_date(LocalDate.of(2025,10,1))
        .end_date(LocalDate.of(2025,10,31))
        .generated_for(ReportScope.SECTION)
        .id("3")
        .build();

    // Proyecciones simuladas
    ReportSummaryRow summary = new ReportSummaryRow() {
      public BigDecimal getIncome() { return BigDecimal.valueOf(220000); }
      public BigDecimal getPending() { return BigDecimal.valueOf(80000); }
      public BigDecimal getOverdue() { return BigDecimal.valueOf(150000); }
    };
    MemberOverdueCountRow counts = new MemberOverdueCountRow() {
      public Integer getTotalMembers() { return 10; }
      public Integer getMembersOverdue() { return 3; }
    };
    ReportPaymentsRow pay1 = new ReportPaymentsRow() {
      public String getPaymentId() { return "p001"; }
      public String getFirstName() { return "Ana"; }
      public String getLastName() { return "Gómez"; }
      public BigDecimal getAmount() { return BigDecimal.valueOf(100000); }
      public LocalDate getPaidAt() { return LocalDate.of(2025,10,6); }
    };

    when(repo.findPayments("org_SCOUT", req.getStart_date(), req.getEnd_date(), "SECTION", "3"))
        .thenReturn(List.of(pay1));
    when(repo.summarizeByStatus("org_SCOUT", req.getStart_date(), req.getEnd_date(), "SECTION", "3"))
        .thenReturn(summary);
    when(repo.countMembersOverdue("org_SCOUT", req.getStart_date(), req.getEnd_date(), "SECTION", "3"))
        .thenReturn(counts);

    FinancialReport out = service.generateFinancialReport("org_SCOUT", req);

    assertThat(out.getFinancial_summary().getIncome()).isEqualByComparingTo("220000");
    assertThat(out.getMembers_ok()).isEqualTo(7);
    assertThat(out.getMembers_overdue()).isEqualTo(3);
    assertThat(out.getPercentage()).isEqualByComparingTo("70.00");
    assertThat(out.getPayments()).hasSize(1);
    assertThat(out.getPayments().get(0).getPayment_id()).isEqualTo("p001");
  }

  @Test
  void en_scope_MEMBER_campos_de_miembros_son_null() {
    var req = GenerateFinancialReportRequest.builder()
        .start_date(LocalDate.of(2025,10,1))
        .end_date(LocalDate.of(2025,10,31))
        .generated_for(ReportScope.MEMBER)
        .id("42")
        .build();

    // respuestas mínimas
    ReportSummaryRow summary = new ReportSummaryRow() {
      public BigDecimal getIncome() { return BigDecimal.ZERO; }
      public BigDecimal getPending() { return BigDecimal.ONE; }
      public BigDecimal getOverdue() { return BigDecimal.TEN; }
    };
    when(repo.findPayments("org_SCOUT", req.getStart_date(), req.getEnd_date(), "MEMBER", "42"))
        .thenReturn(List.of());
    when(repo.summarizeByStatus("org_SCOUT", req.getStart_date(), req.getEnd_date(), "MEMBER", "42"))
        .thenReturn(summary);

    var out = service.generateFinancialReport("org_SCOUT", req);
    assertThat(out.getMembers_ok()).isNull();
    assertThat(out.getMembers_overdue()).isNull();
    assertThat(out.getPercentage()).isNull();
  }
}
