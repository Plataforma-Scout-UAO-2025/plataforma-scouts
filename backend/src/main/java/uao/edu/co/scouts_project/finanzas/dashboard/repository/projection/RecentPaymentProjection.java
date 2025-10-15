package uao.edu.co.scouts_project.finanzas.dashboard.repository.projection;

import java.time.Instant;
import java.math.BigDecimal;

public interface RecentPaymentProjection {
  String getPaymentId();          
  Long getInstallmentId();
  String getName();
  String getDescription();
  java.time.LocalDate getDueDate();
  BigDecimal getAmount();
  String getStatus();
  Instant getPaidAt();   
  String getMethod();
  String getReference();
  Long getPayerMemberId();
}