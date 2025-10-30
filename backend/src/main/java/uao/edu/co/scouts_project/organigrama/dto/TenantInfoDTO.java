package uao.edu.co.scouts_project.organigrama.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TenantInfoDTO {

    @JsonProperty("tenant_id")
    @Schema(description = "ID del tenant, opcional. Si no se envía, puede generarse automáticamente", example = "123")
    private String tenantId;

    @JsonProperty("slug")
    @NotBlank
    @Schema(description = "Slug único del tenant", example = "grupo-1", required = true)
    private String slug;

    @JsonProperty("status")
    @Schema(description = "Estado del tenant", example = "active")
    private String status;

    @JsonProperty("created_at")
    @Schema(description = "Fecha de creación (opcional)", example = "2025-10-28T23:00:00Z")
    private Instant createdAt;

    @JsonProperty("updated_at")
    @Schema(description = "Fecha de actualización (opcional)", example = "2025-10-28T23:00:00Z")
    private Instant updatedAt;
}
