package uao.edu.co.scouts_project.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uao.edu.co.scouts_project.common.service.SupabaseStorageService;
import uao.edu.co.scouts_project.common.dto.storage.StorageUploadResponse;
import uao.edu.co.scouts_project.common.dto.storage.StorageErrorResponse;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador de prueba para funcionalidades de Supabase Storage
 * Endpoints para probar la subida de archivos
 */
@RestController
@RequestMapping("/api/test")
@Tag(name = "Test Endpoints", description = "🧪 Endpoints para pruebas de upload")
public class TestController {

    private final SupabaseStorageService storageService;

    @Autowired
    public TestController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Endpoint de salud para verificar que la aplicación esté funcionando
     */
    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Verifica que el servidor esté funcionando")
    @ApiResponse(responseCode = "200", description = "Servidor funcionando correctamente")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Aplicación funcionando correctamente");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para subir una imagen al bucket 'images'
     */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir Imagen", description = "Sube una imagen al bucket 'images' de Supabase")
    @ApiResponse(responseCode = "200", description = "Imagen subida exitosamente", 
                content = @Content(schema = @Schema(implementation = StorageUploadResponse.class)))
    @ApiResponse(responseCode = "400", description = "Archivo vacío o inválido",
                content = @Content(schema = @Schema(implementation = StorageErrorResponse.class)))
    public ResponseEntity<?> uploadImage(
            @Parameter(description = "Archivo de imagen a subir", 
                      content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                StorageErrorResponse errorResponse = StorageErrorResponse.builder()
                    .error("El archivo está vacío")
                    .statusCode(400)
                    .details("No se puede procesar un archivo vacío")
                    .timestamp(java.time.Instant.now().toString())
                    .build();
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Generar nombre único para el archivo
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            
            // Subir imagen al bucket 'images'
            StorageUploadResponse response = storageService.uploadImage(file, fileName);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            StorageErrorResponse errorResponse = StorageErrorResponse.builder()
                .error("Error al subir imagen")
                .statusCode(500)
                .details(e.getMessage())
                .timestamp(java.time.Instant.now().toString())
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Endpoint para subir un documento al bucket 'files'
     */
    @PostMapping(value = "/upload/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir Documento", description = "Sube un documento al bucket 'files' de Supabase")
    @ApiResponse(responseCode = "200", description = "Documento subido exitosamente",
                content = @Content(schema = @Schema(implementation = StorageUploadResponse.class)))
    @ApiResponse(responseCode = "400", description = "Archivo vacío o inválido",
                content = @Content(schema = @Schema(implementation = StorageErrorResponse.class)))
    public ResponseEntity<?> uploadDocument(
            @Parameter(description = "Archivo de documento a subir",
                      content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                StorageErrorResponse errorResponse = StorageErrorResponse.builder()
                    .error("El archivo está vacío")
                    .statusCode(400)
                    .details("No se puede procesar un archivo vacío")
                    .timestamp(java.time.Instant.now().toString())
                    .build();
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Generar nombre único para el archivo
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            
            // Subir documento al bucket 'files'
            StorageUploadResponse response = storageService.uploadDocument(file, fileName);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            StorageErrorResponse errorResponse = StorageErrorResponse.builder()
                .error("Error al subir documento")
                .statusCode(500)
                .details(e.getMessage())
                .timestamp(java.time.Instant.now().toString())
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Endpoint para obtener la URL pública de un archivo
     */
    @GetMapping("/file-url")
    @Operation(summary = "Obtener URL de Archivo", description = "Genera la URL pública de un archivo en Supabase Storage")
    @ApiResponse(responseCode = "200", description = "URL generada exitosamente")
    public ResponseEntity<Map<String, String>> getFileUrl(
            @Parameter(description = "Nombre del archivo") 
            @RequestParam String fileName,
            @Parameter(description = "Bucket donde está almacenado el archivo")
            @RequestParam(defaultValue = "images") String bucket) {
        
        try {
            String fileUrl = storageService.getPublicUrl(bucket, fileName);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("bucket", bucket);
            response.put("fileUrl", fileUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al obtener URL: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}