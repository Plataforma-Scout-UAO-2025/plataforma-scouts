package uao.edu.co.scouts_project.storage.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import uao.edu.co.scouts_project.config.SupabaseConfig;
import uao.edu.co.scouts_project.storage.domain.StorageObject;
import uao.edu.co.scouts_project.storage.repository.StorageObjectRepository;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("organigramaStorageService")
public class SupabaseStorageService {

    private final RestTemplate restTemplate;
    private final SupabaseConfig.SupabaseProperties supabaseProperties;
    private final StorageObjectRepository storageObjectRepository;

    public SupabaseStorageService(RestTemplate supabaseRestTemplate,
                                  SupabaseConfig.SupabaseProperties supabaseProperties,
                                  StorageObjectRepository storageObjectRepository) {
        this.restTemplate = supabaseRestTemplate;
        this.supabaseProperties = supabaseProperties;
        this.storageObjectRepository = storageObjectRepository;
    }

    /**
     * Sube un archivo a un bucket específico, y devuelve el UUID del objeto creado.
     * @param file Archivo a subir.
     * @param bucket Nombre del bucket.
     * @return El UUID del registro en la tabla storage.objects.
     */
    public UUID uploadFileAndGetObjectId(MultipartFile file, String bucket) {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String objectPath = "organigrama/" + UUID.randomUUID().toString() + "." + extension;

        uploadFile(file, objectPath, bucket);

        StorageObject newObject = storageObjectRepository.findByNameAndBucketId(objectPath, bucket)
            .orElseThrow(() -> new RuntimeException("El objeto de storage no se pudo encontrar después de la subida: " + objectPath));

        return newObject.getId();
    }

    /**
     * Obtiene la URL pública de un archivo a partir de su UUID.
     * @param objectId El UUID del objeto en storage.objects.
     * @return La URL pública completa, o null si no se encuentra.
     */
    public String getPublicUrlFromObjectId(UUID objectId) {
        if (objectId == null) {
            return null;
        }
        return storageObjectRepository.findById(objectId)
            .map(obj -> getPublicUrl(obj.getBucketId(), obj.getName()))
            .orElse(null);
    }

    // =================================================================
    // ============== NUEVO MÉTODO PARA CARGA MASIVA (BULK) ==============
    // =================================================================
    
    /**
     * Obtiene un mapa de URLs públicas a partir de un conjunto de UUIDs en una sola consulta.
     * @param objectIds Conjunto de UUIDs de los objetos de storage.
     * @return Un mapa donde la clave es el UUID y el valor es la URL pública completa.
     */
    public Map<UUID, String> getPublicUrlsFromObjectIds(Set<UUID> objectIds) {
        if (objectIds == null || objectIds.isEmpty()) {
            return Collections.emptyMap();
        }
        
        // 1. Llama al método del repositorio para obtener todos los objetos en UNA SOLA consulta.
        List<StorageObject> objects = storageObjectRepository.findByIdIn(objectIds);
        
        // 2. Convierte la lista de objetos en un mapa para búsquedas eficientes (UUID -> URL).
        return objects.stream()
            .collect(Collectors.toMap(
                StorageObject::getId,
                obj -> getPublicUrl(obj.getBucketId(), obj.getName())
            ));
    }
    
    /**
     * Reemplaza/actualiza un archivo existente en Supabase Storage.
     * Usa el método PUT según la documentación oficial de Supabase.
     * @param objectId El UUID del objeto a reemplazar.
     * @param newFile El nuevo archivo que reemplazará al existente.
     * @return El UUID del objeto actualizado (mismo que el original).
     */
    public UUID replaceFileByObjectId(UUID objectId, MultipartFile newFile) {
        if (objectId == null) {
            throw new IllegalArgumentException("El objectId no puede ser nulo");
        }
        
        StorageObject existingObject = storageObjectRepository.findById(objectId)
            .orElseThrow(() -> new RuntimeException("Objeto no encontrado con ID: " + objectId));
        
        // Reemplazar usando PUT en la misma ruta
        replaceFile(newFile, existingObject.getName(), existingObject.getBucketId());
        
        return objectId; // El UUID permanece igual, solo cambia el contenido
    }

    /**
     * Elimina un archivo de Supabase Storage usando su UUID.
     * @param objectId El UUID del objeto a eliminar.
     */
    public void deleteFileByObjectId(UUID objectId) {
        if (objectId == null) {
            return;
        }
        storageObjectRepository.findById(objectId).ifPresent(obj -> {
            deleteFile(obj.getName(), obj.getBucketId());
        });
    }

    // --- MÉTODOS PRIVADOS

    private void uploadFile(MultipartFile file, String objectPath, String bucket) {
        try {
            String url = supabaseProperties.getStorageUrl() + "/object/" + bucket + "/" + objectPath;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
            // apikey header is required by Supabase for storage operations
            headers.set("apikey", supabaseProperties.getServiceRoleKey());
            // Content type fallback when unknown
            MediaType mediaType = null;
            try {
                String ct = file.getContentType();
                mediaType = (ct != null && !ct.isBlank()) ? MediaType.parseMediaType(ct) : MediaType.APPLICATION_OCTET_STREAM;
            } catch (Exception ignore) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            headers.setContentType(mediaType);
            
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Error al subir archivo: " + response.getStatusCode());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        }
    }

    public String getPublicUrl(String bucket, String fileName) {
        return supabaseProperties.getStorageUrl() + "/object/public/" + bucket + "/" + fileName;
    }

    /**
     * Reemplaza un archivo existente usando PUT.
     * Según la documentación oficial de Supabase: "Replace an existing file".
     * @param file Nuevo archivo.
     * @param objectPath Ruta completa del archivo a reemplazar.
     * @param bucket Nombre del bucket.
     */
    private void replaceFile(MultipartFile file, String objectPath, String bucket) {
        try {
            // PUT /storage/v1/object/{bucket}/{path}
            String url = supabaseProperties.getStorageUrl() + "/object/" + bucket + "/" + objectPath;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
            headers.set("apikey", supabaseProperties.getServiceRoleKey());
            MediaType mediaType = null;
            try {
                String ct = file.getContentType();
                mediaType = (ct != null && !ct.isBlank()) ? MediaType.parseMediaType(ct) : MediaType.APPLICATION_OCTET_STREAM;
            } catch (Exception ignore) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            headers.setContentType(mediaType);
            headers.set("x-upsert", "true"); // Permite sobrescribir si existe
            
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Error al reemplazar archivo: " + response.getStatusCode());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        }
    }

    /**
     * Elimina un archivo usando DELETE.
     * Según la documentación oficial: DELETE /storage/v1/object/{bucket}/{wildcard}
     * donde wildcard es la ruta completa del archivo.
     * @param fileName Ruta completa del archivo (path) dentro del bucket.
     * @param bucket Nombre del bucket.
     * @return true si se eliminó exitosamente.
     */
    private boolean deleteFile(String fileName, String bucket) {
        if (fileName == null || bucket == null) return false;
        
        // DELETE /storage/v1/object/{bucket}/{path}
        String url = supabaseProperties.getStorageUrl() + "/object/" + bucket + "/" + fileName;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
        headers.set("apikey", supabaseProperties.getServiceRoleKey());
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            // Log del error pero no lanzar excepción (operación idempotente)
            System.err.println("Error al eliminar archivo: " + fileName + " - " + e.getMessage());
            return false;
        }
    }
}