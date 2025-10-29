package uao.edu.co.scouts_project.finanzas.reports.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ReportPaymentsRow {
  String getPaymentId();
  String getFirstName();
  String getLastName();
  BigDecimal getAmount();
  LocalDate getPaidAt();
}
