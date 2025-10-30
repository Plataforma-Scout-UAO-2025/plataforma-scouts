package uao.edu.co.scouts_project.organigrama.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos requeridos para crear un grupo scout (en formato snake_case)")
public class CreatingGroupDTO {

    @NotBlank
    @JsonProperty("tenant_id")
    @Schema(description = "Identificador del tenant", example = "tenant-001", required = true)
    private String tenantId;

    @NotBlank
    @JsonProperty("slug")
    @Schema(description = "Slug único del grupo", example = "grupo-exploradores", required = true)
    private String slug;

    @NotBlank
    @JsonProperty("name")
    @Schema(description = "Nombre oficial del grupo", example = "Grupo Exploradores del Sur", required = true)
    private String name;

    @JsonProperty("district")
    private String district;

    @JsonProperty("identifier_number")
    private String identifierNumber;

    @JsonProperty("address")
    private String address;

    @JsonProperty("phone")
    private String phone;

    @Email
    @NotBlank
    @JsonProperty("email")
    private String email;

    @JsonProperty("founded_in")
    private LocalDate foundedIn;

    @JsonProperty("motto")
    private String motto;

    @JsonProperty("mission")
    private String mission;

    @JsonProperty("vision")
    private String vision;

    @JsonProperty("history")
    private String history;

    @JsonProperty("logo_object_id")
    private UUID logoObjectId;

    @JsonProperty("scarf_object_id")
    private UUID scarfObjectId;

    @JsonProperty("social_links")
    private Map<String, Object> socialLinks;

    @JsonProperty("config")
    private Map<String, Object> config;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("status")
    @Schema(description = "Estado del grupo", example = "ACTIVE")
    private String status;
}
