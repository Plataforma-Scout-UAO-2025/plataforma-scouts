package uao.edu.co.scouts_project.finanzas.fees.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCuotaDto(
  @NotBlank Long tenant_id,             
  String name,
  String description,
  BigDecimal amount,
  @NotBlank Periodicity periodicity,
  @NotBlank FeeScope scope,
  @NotNull LocalDate start_date,
  @NotNull LocalDate end_date,
    Long target_member_id,           // requerido si scope=SCOUT
    Long section_id,                 // requerido si scope=SECTION
    Long subgroup_id                 // requerido si scope=SUBGROUP
) {}
