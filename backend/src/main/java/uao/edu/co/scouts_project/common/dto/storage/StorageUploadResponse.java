package uao.edu.co.scouts_project.common.dto.storage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta exitosa de subida de archivo a Supabase Storage
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta exitosa de subida de archivo a Supabase Storage")
public class StorageUploadResponse {
    
    @Schema(description = "Mensaje de confirmación", example = "Documento subido exitosamente")
    private String message;
    
    @Schema(description = "Nombre del archivo generado en storage", example = "1758100082940_MINIPROYECTO #1 - BUENO, HERRERA, MORENO.pdf")
    private String fileName;
    
    @Schema(description = "Nombre original del archivo", example = "MINIPROYECTO #1 - BUENO, HERRERA, MORENO.pdf")
    private String originalName;
    
    @Schema(description = "URL pública del archivo en Supabase", example = "https://psafdlxbpiqwzucwsezw.supabase.co/storage/v1/object/public/files/1758100082940_file.pdf")
    private String fileUrl;
    
    @Schema(description = "Bucket donde se almacenó el archivo", example = "files", allowableValues = {"images", "files"})
    private String bucket;
    
    @Schema(description = "Tamaño del archivo en bytes", example = "795711")
    private Long size;
    
    @Schema(description = "Tipo MIME del archivo", example = "application/pdf")
    private String contentType;
}