package uao.edu.co.scouts_project.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import uao.edu.co.scouts_project.config.SupabaseConfig;
import uao.edu.co.scouts_project.common.dto.storage.StorageUploadResponse;

import java.io.IOException;
import java.util.Map;

/**
 * Servicio para interactuar con Supabase Storage
 * Maneja subida, descarga y eliminación de archivos
 */
@Service
public class SupabaseStorageService {

    private final RestTemplate restTemplate;
    private final SupabaseConfig.SupabaseProperties supabaseProperties;

    @Autowired
    public SupabaseStorageService(RestTemplate supabaseRestTemplate, 
                                  SupabaseConfig.SupabaseProperties supabaseProperties) {
        this.restTemplate = supabaseRestTemplate;
        this.supabaseProperties = supabaseProperties;
    }

    /**
     * Sube una imagen a Supabase Storage (bucket 'images')
     * @param file archivo de imagen a subir
     * @param fileName nombre del archivo en storage
     * @return Respuesta tipada con información del archivo subido
     */
    public StorageUploadResponse uploadImage(MultipartFile file, String fileName) {
        return uploadFile(file, fileName, supabaseProperties.getImagesBucket());
    }

    /**
     * Sube un archivo general a Supabase Storage (bucket 'files')
     * @param file archivo a subir
     * @param fileName nombre del archivo en storage
     * @return Respuesta tipada con información del archivo subido
     */
    public StorageUploadResponse uploadDocument(MultipartFile file, String fileName) {
        return uploadFile(file, fileName, supabaseProperties.getFilesBucket());
    }

    /**
     * Sube un archivo a Supabase Storage
     * @param file archivo a subir
     * @param fileName nombre del archivo en storage
     * @param bucket bucket de almacenamiento (opcional)
     * @return Respuesta tipada con información del archivo subido
     */
    public StorageUploadResponse uploadFile(MultipartFile file, String fileName, String bucket) {
        try {
            String bucketName = bucket != null ? bucket : supabaseProperties.getDefaultStorageBucket();
            String url = supabaseProperties.getStorageUrl() + "/object/" + bucketName + "/" + fileName;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
            String contentType = file.getContentType();
            if (contentType != null) {
                headers.setContentType(MediaType.parseMediaType(contentType));
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, entity, 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = getPublicUrl(bucketName, fileName);
                
                return StorageUploadResponse.builder()
                    .message("Archivo subido exitosamente")
                    .fileName(fileName)
                    .originalName(file.getOriginalFilename())
                    .fileUrl(publicUrl)
                    .bucket(bucketName)
                    .size(file.getSize())
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build();
            }
            
            throw new RuntimeException("Error al subir archivo: " + response.getStatusCode());
            
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        }
    }

    /**
     * Obtiene la URL pública de un archivo
     * @param bucket bucket de almacenamiento
     * @param fileName nombre del archivo
     * @return URL pública
     */
    public String getPublicUrl(String bucket, String fileName) {
        return supabaseProperties.getStorageUrl() + "/object/public/" + bucket + "/" + fileName;
    }

    /**
     * Elimina un archivo de Supabase Storage
     * @param fileName nombre del archivo a eliminar
     * @param bucket bucket de almacenamiento (opcional)
     * @return true si se eliminó correctamente
     */
    public boolean deleteFile(String fileName, String bucket) {
        String bucketName = bucket != null ? bucket : supabaseProperties.getDefaultStorageBucket();
        String url = supabaseProperties.getStorageUrl() + "/object/" + bucketName + "/" + fileName;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
        
        return response.getStatusCode().is2xxSuccessful();
    }

    /**
     * Crea un bucket en Supabase Storage
     * @param bucketName nombre del bucket
     * @param isPublic si el bucket es público
     * @return true si se creó correctamente
     */
    public boolean createBucket(String bucketName, boolean isPublic) {
        String url = supabaseProperties.getStorageUrl() + "/bucket";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey());
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> bucketConfig = Map.of(
            "id", bucketName,
            "name", bucketName,
            "public", isPublic
        );
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(bucketConfig, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, entity, 
            new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
        
        return response.getStatusCode().is2xxSuccessful();
    }
}