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
    @Schema(description = "Identificador del tenant", example = "org-123abc", required = true)
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
    @Schema(description = "Lema del grupo", example = "Siempre hacia adelante", required = true)
    private String motto;

    @JsonProperty("mission")
    @Schema(description = "Misión del grupo", example = "Formar líderes en la comunidad", required = true)
    private String mission;

    @JsonProperty("vision")
    @Schema(description = "Visión del grupo", example = "Ser un referente en la formación de jóvenes", required = true)
    private String vision;

    @JsonProperty("history")
    @Schema(description = "Historia del grupo", example = "Fundado en 1990, hemos crecido...", required = true)
    private String history;

    // Send it as null, because it will be added later.
    @JsonProperty("logo_object_id")
    private UUID logoObjectId;

    // Send it as null, because it will be added later.
    @JsonProperty("scarf_object_id")
    private UUID scarfObjectId;

    // Send it as null, because it will be added later.
    @JsonProperty("social_links")
    private Map<String, Object> socialLinks;

    // Send it as null, because it will be added later.
    @JsonProperty("config")
    private Map<String, Object> config;

    // Send it as true
    @JsonProperty("is_active")
    private Boolean isActive;

    // Send it as "ACTIVE"
    @JsonProperty("status")
    @Schema(description = "Estado del grupo", example = "ACTIVE")
    private String status;
}
