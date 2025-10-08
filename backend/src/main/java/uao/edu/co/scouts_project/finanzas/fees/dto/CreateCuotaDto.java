package uao.edu.co.scouts_project.finanzas.fees.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.JsonNode;

import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCuotaDto(
  @NotBlank String tenant_id,             
  String name,
  String description,
  BigDecimal amount,
  @NotBlank Periodicity periodicity,
  @NotBlank FeeScope scope,
  @NotNull LocalDate start_date,
  @NotNull LocalDate end_date,
  JsonNode associated_to
) {}
