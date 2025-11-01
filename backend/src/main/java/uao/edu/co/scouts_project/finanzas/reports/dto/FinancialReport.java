package uao.edu.co.scouts_project.finanzas.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FinancialReport {
  private ReportSummary financial_summary;
  private Integer members_ok;       // NULL si scope=MEMBER
  private Integer members_overdue;  // NULL si scope=MEMBER
  private BigDecimal percentage;    // NULL si scope=MEMBER (0..100 con 2 dec)
  private List<ReportPayments> payments;
  private LocalDate start_date;
  private LocalDate end_date;
  private String Scope;
}