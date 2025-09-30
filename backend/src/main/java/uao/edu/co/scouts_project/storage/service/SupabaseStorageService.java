package uao.edu.co.scouts_project.storage.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import uao.edu.co.scouts_project.config.SupabaseConfig;
import uao.edu.co.scouts_project.storage.domain.StorageObject;
import uao.edu.co.scouts_project.storage.repo.StorageObjectRepository;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

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
        // 1. Generar una ruta única para el archivo para evitar colisiones.
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String objectPath = "organigrama/" + UUID.randomUUID().toString() + "." + extension;

        // 2. Subir el archivo usando la lógica existente de RestTemplate.
        uploadFile(file, objectPath, bucket);

        // 3. Después de subir, consultar la DB para obtener el objeto y su UUID.
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
            .orElse(null); // Devuelve null si el ID no corresponde a ningún objeto.
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

    // --- MÉTODOS PRIVADOS Y EXISTENTES (con pequeños ajustes) ---

    private void uploadFile(MultipartFile file, String objectPath, String bucket) {
        try {
            String url = supabaseProperties.getStorageUrl() + "/object/" + bucket + "/" + objectPath;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            
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

    private boolean deleteFile(String fileName, String bucket) {
        if (fileName == null || bucket == null) return false;
        String url = supabaseProperties.getStorageUrl() + "/object/" + bucket + "/" + fileName;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
        return response.getStatusCode().is2xxSuccessful();
    }
}