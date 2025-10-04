package uao.edu.co.scouts_project.finanzas.fees.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de cuota/fee a exponer por API.
 * - 'member' puede ser null (cuando scope != SCOUT).
 * - periodicity/scope como String para desacoplar de enums del modelo.
 */
public record CuotaDto(
    Long id,
    BigDecimal amount,
    String name,
    String description,
    String periodicity,
    String scope,
    LocalDate start_date,
    LocalDate end_date,
    MemberPaymentDto member
) { }
