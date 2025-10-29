package uao.edu.co.scouts_project.finanzas.reports.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import uao.edu.co.scouts_project.finanzas.reports.model.enums.ReportScope;


@Data @NoArgsConstructor @AllArgsConstructor @Builder @Getter @Setter
public class GenerateFinancialReportRequest {
  @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date;
  @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date;
  @NotNull ReportScope generated_for; // MEMBER | SUBGROUP | SECTION
  @NotNull String id;

}
