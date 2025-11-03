package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "SlugValidationResponse", description = "Resultado de validación de slug")
public record SlugValidationResponseDTO(
        @Schema(description = "Slug evaluado", example = "grupo-exploradores") String slug,
        @Schema(description = "Si el slug es válido y está disponible") boolean valid,
        @Schema(description = "Motivo cuando no es válido", example = "format|exists", nullable = true) String reason,
        @Schema(description = "Mensaje adicional", nullable = true) String message
) {}
