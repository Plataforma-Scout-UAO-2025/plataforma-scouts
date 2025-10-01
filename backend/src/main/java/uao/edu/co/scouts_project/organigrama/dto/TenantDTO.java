package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record TenantDTO(
    Long tenantId,
    @NotBlank String slug,
    String status,
    Instant createdAt,
    Instant updatedAt
) {}