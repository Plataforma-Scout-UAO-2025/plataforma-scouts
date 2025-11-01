package uao.edu.co.scouts_project.finanzas.reports.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data @NoArgsConstructor @AllArgsConstructor @Builder @Getter @Setter
public class ReportSummary {
  private BigDecimal income;  // suma de amounts con installments en estado PAID
  private BigDecimal pending; // suma de amounts con installments en estado PENDING
  private BigDecimal overdue; // suma de amounts con installments en estado OVERDUE
}

