package uao.edu.co.scouts_project.storage.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/storage")
@Tag(name = "Storage", description = "Endpoints para la gestión de archivos")
public class StorageController {

    private final SupabaseStorageService storageService;
    private static final String BUCKET_NAME = "images"; 

    public StorageController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    @Operation(summary = "Subir un archivo", description = "Sube un archivo al bucket 'images' y devuelve su UUID único.")
    public ResponseEntity<Map<String, UUID>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            UUID objectId = storageService.uploadFileAndGetObjectId(file, BUCKET_NAME);
            return ResponseEntity.ok(Map.of("objectId", objectId));
        } catch (Exception e) {
            // Considera un manejo de errores más detallado aquí
            return ResponseEntity.internalServerError().build();
        }
    }
}