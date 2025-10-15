package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

@Schema(description = "Request para aplicar operaciones sobre imágenes de galería. El backend encuentra automáticamente el índice por UUID.")
public record GalleryPatchRequest(
    
    @Schema(description = "Lista de operaciones a aplicar sobre la galería", 
            example = """
            [
              {"op":"replace","targetUuid":"550e8400-e29b-41d4-a716-446655440000","newValue":"660e8400-e29b-41d4-a716-446655440001"}
            ]
            """,
            required = true)
    @NotNull
    List<PatchOperation> operations
) {
    
    @Schema(description = "Operación individual sobre la galería")
    public record PatchOperation(
        @Schema(description = "Tipo de operación: replace (reemplazar imagen), add (agregar nueva), remove (eliminar)", 
                example = "replace",
                allowableValues = {"replace", "add", "remove"})
        @NotNull
        String op,
        
        @Schema(description = "UUID de la imagen objetivo a modificar/eliminar. Requerido para 'replace' y 'remove'. El backend encuentra automáticamente su índice.", 
                example = "550e8400-e29b-41d4-a716-446655440000")
        UUID targetUuid,
        
        @Schema(description = "Nuevo UUID para 'replace' o 'add'. No se usa en 'remove'", 
                example = "660e8400-e29b-41d4-a716-446655440001")
        UUID newValue
    ) {}
}
