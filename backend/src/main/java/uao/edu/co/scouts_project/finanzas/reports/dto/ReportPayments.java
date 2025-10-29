package uao.edu.co.scouts_project.finanzas.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data @NoArgsConstructor @AllArgsConstructor @Builder @Getter @Setter
public class ReportPayments {
  private String payment_id;
  private String fisrt_name;
  private String last_name;
  private BigDecimal amount;
  private LocalDate paid_at;
}
