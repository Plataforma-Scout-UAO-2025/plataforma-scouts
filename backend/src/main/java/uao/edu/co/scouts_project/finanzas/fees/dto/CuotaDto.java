package uao.edu.co.scouts_project.finanzas.fees.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * DTO de cuota/fee a exponer por API.
 */
public record CuotaDto(
    Long fee_id,
    BigDecimal amount,
    String name,
    String description,
    String periodicity,
    String scope,
    LocalDate start_date,
    LocalDate end_date,
    JsonNode   associated_to
) { }
