package uao.edu.co.scouts_project.common.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
    // no @InjectMocks needed; we build service manually with real properties
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import uao.edu.co.scouts_project.common.dto.storage.StorageUploadResponse;
import uao.edu.co.scouts_project.config.SupabaseConfig;

/**
 * Pruebas unitarias básicas para SupabaseStorageService.
 */
@ExtendWith(MockitoExtension.class)
class SupabaseStorageServiceTest {

    @Mock
    RestTemplate restTemplate;

    @Mock
    MultipartFile multipartFile;

    @Captor
    ArgumentCaptor<HttpEntity<byte[]>> httpEntityCaptor;

    private SupabaseConfig.SupabaseProperties props;

    private SupabaseStorageService service;

    @BeforeEach
    void setUp() {
        // Propiedades reales (no mock) para evitar problemas de tipos y facilitar verificación de URLs
        props = new SupabaseConfig.SupabaseProperties(
            "https://test.supabase.co",
            "anon-key",
            "service-role-key",
            "images", // default bucket
            "images",
            "files"
        );

        service = new SupabaseStorageService(restTemplate, props);
    }

    @Test
    void uploadImage_success_returnsExpectedResponseAndHeaders() throws Exception {
        // Arrange
        String fileName = "avatar.png";
        String contentType = "image/png";
        byte[] bytes = new byte[] {1, 2, 3};
        when(multipartFile.getContentType()).thenReturn(contentType);
        when(multipartFile.getBytes()).thenReturn(bytes);
        when(multipartFile.getOriginalFilename()).thenReturn("original-avatar.png");
        when(multipartFile.getSize()).thenReturn((long) bytes.length);

        String expectedUrl = props.getStorageUrl() + "/object/" + props.getImagesBucket() + "/" + fileName;
        ResponseEntity<Map<String, Object>> okResponse = new ResponseEntity<>(Map.of("ok", true), HttpStatus.OK);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST),
        org.mockito.ArgumentMatchers.<HttpEntity<byte[]>>any(),
        org.mockito.ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()))
            .thenReturn(okResponse);

        // Act
        StorageUploadResponse resp = service.uploadImage(multipartFile, fileName);

        // Assert response fields
        assertNotNull(resp);
        assertEquals("Archivo subido exitosamente", resp.getMessage());
        assertEquals(fileName, resp.getFileName());
        assertEquals("original-avatar.png", resp.getOriginalName());
        assertEquals(props.getImagesBucket(), resp.getBucket());
        assertEquals(bytes.length, resp.getSize());
        assertEquals(contentType, resp.getContentType());
        assertEquals(props.getStorageUrl() + "/object/public/" + props.getImagesBucket() + "/" + fileName,
            resp.getFileUrl());

        // Verify Authorization and Content-Type headers
    verify(restTemplate).exchange(eq(expectedUrl), eq(HttpMethod.POST), httpEntityCaptor.capture(),
        org.mockito.ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any());
    assertEquals((long) bytes.length, resp.getSize());
        HttpEntity<byte[]> captured = httpEntityCaptor.getValue();
        HttpHeaders headers = captured.getHeaders();
        assertEquals("Bearer " + props.getServiceRoleKey(), headers.getFirst("Authorization"));
        assertEquals(MediaType.parseMediaType(contentType), headers.getContentType());
        assertArrayEquals(bytes, captured.getBody());
    }

    @Test
    void uploadDocument_success_usesFilesBucket() throws Exception {
        // Arrange
        String fileName = "doc.pdf";
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getBytes()).thenReturn(new byte[] {9, 8});
        when(multipartFile.getOriginalFilename()).thenReturn("original.pdf");
        when(multipartFile.getSize()).thenReturn(2L);

        String expectedUrl = props.getStorageUrl() + "/object/" + props.getFilesBucket() + "/" + fileName;
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST),
        org.mockito.ArgumentMatchers.<HttpEntity<byte[]>>any(),
        org.mockito.ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()))
            .thenReturn(new ResponseEntity<>(Map.of("ok", true), HttpStatus.OK));

        // Act
        StorageUploadResponse resp = service.uploadDocument(multipartFile, fileName);

        // Assert bucket y URL pública
        assertEquals(props.getFilesBucket(), resp.getBucket());
        assertEquals(props.getStorageUrl() + "/object/public/" + props.getFilesBucket() + "/" + fileName,
            resp.getFileUrl());
    }

    @Test
    void deleteFile_returnsTrue_on2xx() {
        // Arrange
        String fileName = "to-delete.txt";
        String expectedUrl = props.getStorageUrl() + "/object/" + props.getDefaultStorageBucket() + "/" + fileName;
        when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)))
            .thenReturn(new ResponseEntity<>(HttpStatus.NO_CONTENT));

        // Act
        boolean result = service.deleteFile(fileName, null); // bucket null -> usa default

        // Assert
        assertTrue(result);
    }

    @Test
    void deleteFile_returnsFalse_onNon2xx() {
        // Arrange
        String fileName = "missing.txt";
        String expectedUrl = props.getStorageUrl() + "/object/" + props.getDefaultStorageBucket() + "/" + fileName;
        when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)))
            .thenReturn(new ResponseEntity<>(HttpStatus.NOT_FOUND));

        // Act
        boolean result = service.deleteFile(fileName, null);

        // Assert
        assertFalse(result);
    }

    @Test
    void createBucket_returnsTrue_onSuccess() {
        // Arrange
        String bucketName = "avatars";
        String expectedUrl = props.getStorageUrl() + "/bucket";
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST),
        org.mockito.ArgumentMatchers.<HttpEntity<Map<String, Object>>>any(),
        org.mockito.ArgumentMatchers.<ParameterizedTypeReference<Map<String, Object>>>any()))
            .thenReturn(new ResponseEntity<>(Map.of("name", bucketName), HttpStatus.CREATED));

        // Act
        boolean created = service.createBucket(bucketName, true);

        // Assert
        assertTrue(created);
    }

    @Test
    void getPublicUrl_buildsCorrectUrl() {
        String url = service.getPublicUrl("images", "logo.png");
        assertEquals(props.getStorageUrl() + "/object/public/images/logo.png", url);
    }
}
