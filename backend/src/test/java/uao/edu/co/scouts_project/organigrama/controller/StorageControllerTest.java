package uao.edu.co.scouts_project.organigrama.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;
import uao.edu.co.scouts_project.storage.controller.StorageController;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// AJUSTA el paquete/clase del controller real:
@WebMvcTest(controllers = StorageController.class)
@AutoConfigureMockMvc(addFilters = false)
class StorageControllerTest {

    private static final String BASE = "/api/v1/storage";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean SupabaseStorageService storageService;
    @MockitoBean TenantFilter tenantFilter;

    @Test
    @DisplayName("POST /storage/images/upload (multipart) → 201 Created")
    void upload_ok() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "file", "logo.png", "image/png", "pngdata".getBytes()
    );

    UUID objectId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    when(storageService.uploadFileAndGetObjectId(any(MultipartFile.class), eq("images")))
        .thenReturn(objectId);

    mvc.perform(multipart(BASE + "/upload")
        .file(file)
        .contentType(MediaType.MULTIPART_FORM_DATA))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.objectId").value(objectId.toString()));

    verify(storageService).uploadFileAndGetObjectId(any(MultipartFile.class), eq("images"));
    }

    @Test
    @DisplayName("POST /storage/images/upload con archivo vacío → 400 Bad Request")
    void upload_emptyFile() throws Exception {
        MockMultipartFile empty = new MockMultipartFile("file", "logo.png", "image/png", new byte[0]);

        mvc.perform(multipart(BASE + "/upload")
                .file(empty)
                .contentType(MediaType.MULTIPART_FORM_DATA))
           .andExpect(status().isBadRequest());

        verifyNoInteractions(storageService);
    }

    @Test
    @DisplayName("POST /storage/images/upload cuando el service falla → 500 Internal Server Error")
    void upload_serviceFailure() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "pngdata".getBytes()
        );

        when(storageService.uploadFileAndGetObjectId(any(MultipartFile.class), eq("images")))
                .thenThrow(new RuntimeException("supabase down"));

        mvc.perform(multipart(BASE + "/upload")
                .file(file)
                .contentType(MediaType.MULTIPART_FORM_DATA))
           .andExpect(status().isInternalServerError());

        verify(storageService).uploadFileAndGetObjectId(any(MultipartFile.class), eq("images"));
    }
}
