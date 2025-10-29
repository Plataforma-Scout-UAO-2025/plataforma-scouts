package uao.edu.co.scouts_project.finanzas.reports.repository.projection;

import java.math.BigDecimal;

public interface ReportSummaryRow {
  BigDecimal getIncome();
  BigDecimal getPending();
  BigDecimal getOverdue();
}
