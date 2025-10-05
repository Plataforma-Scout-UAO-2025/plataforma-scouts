package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(description = "Request para actualizar una imagen individual (logo, ícono, foto principal, etc.)")
public record UpdateImageRequest(
    
    @Schema(description = "UUID del objeto de storage en Supabase", 
            example = "123e4567-e89b-12d3-a456-426614174000",
            required = true)
    @NotNull(message = "El objectId es obligatorio")
    UUID objectId
) {}
