package uao.edu.co.scouts_project.organigrama.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Schema(description = "Representación de un grupo scout existente (en formato snake_case)")
public record GroupDTO(

    @Schema(description = "Identificador del grupo", example = "101")
    @JsonProperty("group_id")
    Long groupId,

    @Schema(description = "Identificador del tenant", example = "org-123abc", required = true)
    @JsonProperty("tenant_id")
    String tenantId,

    @NotBlank
    @Schema(description = "Slug único del grupo", example = "grupo-exploradores", required = true)
    @JsonProperty("slug")
    String slug,

    @NotBlank
    @Schema(description = "Nombre oficial del grupo", example = "Grupo Exploradores", required = true)
    @JsonProperty("name")
    String name,

    @JsonProperty("district")
    String district,

    @JsonProperty("identifier_number")
    String identifierNumber,

    @JsonProperty("address")
    String address,

    @JsonProperty("phone")
    String phone,

    @Email
    @Schema(description = "Correo electrónico oficial del grupo", example = "contacto@exploradores.org")
    @JsonProperty("email")
    String email,

    @JsonProperty("founded_in")
    @Schema(description = "Fecha de fundación del grupo", example = "1990-05-15")
    LocalDate foundedIn,

    @JsonProperty("motto")
    @Schema(description = "Lema del grupo", example = "Siempre hacia adelante")
    String motto,

    @JsonProperty("mission")
    @Schema(description = "Misión del grupo", example = "Formar líderes en la comunidad")
    String mission,

    @JsonProperty("vision")
    @Schema(description = "Visión del grupo", example = "Ser un referente en la formación de jóvenes")
    String vision,

    @JsonProperty("history")
    @Schema(description = "Historia del grupo", example = "Fundado en 1990, hemos crecido...")
    String history,

    @JsonProperty("logo_object_id")
    UUID logoObjectId,

    @JsonProperty("scarf_object_id")
    UUID scarfObjectId,

    @JsonProperty("social_links")
    Map<String, Object> socialLinks,

    @JsonProperty("config")
    Map<String, Object> config,

    @JsonProperty("is_active")
    @Schema(description = "Indica si el grupo está activo", example = "true")
    Boolean isActive,

    @JsonProperty("status")
    @Schema(description = "Estado actual del grupo", example = "ACTIVE")
    String status,

    @JsonProperty("created_at")
    @Schema(description = "Fecha de creación del grupo", example = "2024-01-10T15:30:00")
    LocalDateTime createdAt,

    @JsonProperty("updated_at")
    @Schema(description = "Fecha de última actualización del grupo", example = "2024-05-21T09:45:00")
    LocalDateTime updatedAt
) {}
