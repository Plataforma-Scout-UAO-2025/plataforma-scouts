package uao.edu.co.scouts_project.common.dto.storage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta de error en operaciones de Supabase Storage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta de error en operaciones de Supabase Storage")
public class StorageErrorResponse {
    
    @Schema(description = "Mensaje de error", example = "Error al subir archivo")
    private String error;
    
    @Schema(description = "Codigo de estado HTTP", example = "400")
    private Integer statusCode;
    
    @Schema(description = "Detalles adicionales del error", example = "El archivo excede el tamano maximo permitido")
    private String details;
    
    @Schema(description = "Timestamp del error", example = "2025-01-17T10:30:00Z")
    private String timestamp;
}