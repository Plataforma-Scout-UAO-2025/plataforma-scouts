package uao.edu.co.scouts_project.organigrama.dto;

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

/**
 * DTO para la creación de un grupo scout.
 * Solo requiere los campos NO NULLABLES según la base de datos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos requeridos para crear un grupo scout")
public class CreatingGroupDTO {

    @NotBlank
    @Schema(description = "Identificador del tenant", example = "tenant-001", required = true)
    private String tenantId;

    @NotBlank
    @Schema(description = "Slug único del grupo", example = "grupo-exploradores", required = true)
    private String slug;

    @NotBlank
    @Schema(description = "Nombre oficial del grupo", example = "Grupo Exploradores del Sur", required = true)
    private String name;

    // Campos opcionales (nullable)
    private String district;
    private String identifierNumber;
    private String address;
    private String phone;

    @Email
    @NotBlank
    private String email;

    private LocalDate foundedIn;
    private String motto;
    private String mission;
    private String vision;
    private String history;
    private UUID logoObjectId;
    private UUID scarfObjectId;
    private Map<String, Object> socialLinks;
    private Map<String, Object> config;

    private Boolean isActive;

    @Schema(description = "Estado del grupo", example = "ACTIVE")
    private String status;
}
