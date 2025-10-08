package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.http.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import uao.edu.co.scouts_project.config.SupabaseConfig;
import uao.edu.co.scouts_project.storage.domain.StorageObject;
import uao.edu.co.scouts_project.storage.repository.StorageObjectRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.*;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class SupabaseStorageServiceTest {

    private StorageObjectRepository repository;
    private RestTemplate restTemplate;
    private MockRestServiceServer server;

    // SUT
    private SupabaseStorageService service;

    // Config simulada
    private final String storageUrl    = "https://project.supabase.co/storage/v1";
    private final String serviceRoleKey = "sb-service-role-key";

    @BeforeEach
    void setup() {
        repository   = mock(StorageObjectRepository.class);
        restTemplate = new RestTemplate();
        server       = MockRestServiceServer.createServer(restTemplate);

        // Mock de SupabaseConfig.SupabaseProperties
        SupabaseConfig.SupabaseProperties props = mock(SupabaseConfig.SupabaseProperties.class);
        when(props.getStorageUrl()).thenReturn(storageUrl);
        when(props.getServiceRoleKey()).thenReturn(serviceRoleKey);

        // ctor real del service
        service = new SupabaseStorageService(restTemplate, props, repository);
    }

    private StorageObject storageObject(UUID id, String bucket, String name) {
        try {
            StorageObject so = new StorageObject();
            java.lang.reflect.Field idField = StorageObject.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(so, id);
            java.lang.reflect.Field bucketIdField = StorageObject.class.getDeclaredField("bucketId");
            bucketIdField.setAccessible(true);
            bucketIdField.set(so, bucket);
            java.lang.reflect.Field nameField = StorageObject.class.getDeclaredField("name");
            nameField.setAccessible(true);
            nameField.set(so, name);
            return so;
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("uploadFileAndGetObjectId → POST a /object/{bucket}/{organigrama/uuid.ext} y obtiene el UUID desde el repo")
    void upload_ok() {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "png".getBytes());
        String bucket = "images";

        // Esperamos POST al patrón /object/{bucket}/organigrama/<uuid>.png
        server.expect(once(), requestTo(containsString(storageUrl + "/object/" + bucket + "/organigrama/")))
              .andExpect(method(HttpMethod.POST))
              .andExpect(header("Authorization", "Bearer " + serviceRoleKey))
              .andExpect(header(HttpHeaders.CONTENT_TYPE, "image/png"))
              .andRespond(withStatus(HttpStatus.OK)
                      .contentType(MediaType.APPLICATION_JSON)
                      .body("{\"Key\":\"ok\"}"));

        // El service generará un objectPath dinámico (organigrama/<uuid>.png).
        UUID returnedId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

        when(repository.findByNameAndBucketId(
                argThat(p -> p != null && p.startsWith("organigrama/") && p.endsWith(".png")),
                eq(bucket)
        )).thenAnswer(inv -> {
            String name = inv.getArgument(0);
            return Optional.of(storageObject(returnedId, bucket, name));
        });

        UUID out = service.uploadFileAndGetObjectId(file, bucket);

        server.verify();
        assertThat(out).isEqualTo(returnedId);
        verify(repository).findByNameAndBucketId(
                argThat(p -> p != null && p.startsWith("organigrama/") && p.endsWith(".png")),
                eq(bucket)
        );
    }

    @Test
    @DisplayName("replaceFileByObjectId → PUT con x-upsert:true a la misma ruta")
    void replace_ok() {
        UUID objectId = UUID.fromString("123e4567-e89b-12d3-a456-426614174111");
        String bucket = "images";
        String name   = "organigrama/abc.png";

        when(repository.findById(objectId)).thenReturn(Optional.of(storageObject(objectId, bucket, name)));

        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "png".getBytes());

        server.expect(once(), requestTo(storageUrl + "/object/" + bucket + "/" + name))
              .andExpect(method(HttpMethod.PUT))
              .andExpect(header("Authorization", "Bearer " + serviceRoleKey))
              .andExpect(header("x-upsert", "true"))
              .andRespond(withStatus(HttpStatus.OK));

        UUID out = service.replaceFileByObjectId(objectId, file);

        server.verify();
        assertThat(out).isEqualTo(objectId);
        verify(repository).findById(objectId);
    }

    @Test
    @DisplayName("deleteFileByObjectId → DELETE /object/{bucket}/{name} (no elimina la fila del repo)")
    void delete_ok() {
        UUID objectId = UUID.fromString("123e4567-e89b-12d3-a456-426614174222");

        StorageObject so = storageObject(objectId, "images", "groups/centinelas/logo.png");
        when(repository.findById(objectId)).thenReturn(Optional.of(so));

        server.expect(once(), requestTo(storageUrl + "/object/" + so.getBucketId() + "/" + so.getName()))
              .andExpect(method(HttpMethod.DELETE))
              .andExpect(header("Authorization", "Bearer " + serviceRoleKey))
              .andExpect(header("apikey", serviceRoleKey))
              .andRespond(withSuccess());

        service.deleteFileByObjectId(objectId);

        server.verify();
        verify(repository).findById(objectId);
        // OJO: el service NO hace repository.delete(...). Validamos que no se llama:
        verify(repository, never()).delete(any());
    }

    @Test
    @DisplayName("getPublicUrlsFromObjectIds → usa findByIdIn y arma /object/public/{bucket}/{name}")
    void publicUrls_ok() {
        UUID a = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID b = UUID.fromString("123e4567-e89b-12d3-a456-426614174111");

        when(repository.findByIdIn(anySet())).thenReturn(List.of(
                storageObject(a, "images", "groups/a.png"),
                storageObject(b, "images", "groups/b.png")
        ));

        Map<UUID, String> out = service.getPublicUrlsFromObjectIds(Set.of(a, b));

        assertThat(out.get(a)).isEqualTo(storageUrl + "/object/public/images/groups/a.png");
        assertThat(out.get(b)).isEqualTo(storageUrl + "/object/public/images/groups/b.png");

        verify(repository).findByIdIn(argThat(s -> s.containsAll(Set.of(a, b))));
    }
}
