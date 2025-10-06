package uao.edu.co.scouts_project.organigrama.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.common.tenant.TenantFilter; // <-- mockeamos este filtro
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice MVC del SectionController.
 * - Filtros desactivados en MockMvc.
 * - TenantFilter mockeado para evitar dependencia a JdbcTemplate.
 * - Omitimos asserts sobre IDs de galería (solo URLs y tamaños).
 */
@WebMvcTest(controllers = SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SectionControllerTest {

    private static final String BASE = "/api/v1/tenants/{tenant}/groups/{group}/sections";
    private static final String TENANT = "tenant-slug";
    private static final String GROUP  = "group-slug";
    private static final long SECTION_ID = 1L;

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean SectionService sectionService;
    @MockitoBean TenantFilter tenantFilter; // <-- clave para que arranque el contexto

    private SectionResponseDTO sampleResponse(long id) {
        var gallery = List.of(
            new SectionResponseDTO.GalleryItemDTO(
                UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "https://cdn.example/img-1.jpg"),
            new SectionResponseDTO.GalleryItemDTO(
                UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "https://cdn.example/img-2.jpg")
        );
        return new SectionResponseDTO(
            id, "tenant1", 11L, "Manada", "Descripción",
            "https://cdn.example/icon.png",
            "https://cdn.example/photo-principal.jpg",
            List.of("https://cdn.example/legacy-1.jpg","https://cdn.example/legacy-2.jpg"),
            gallery,
            Instant.parse("2024-01-01T00:00:00Z"),
            Instant.parse("2024-01-02T00:00:00Z")
        );
    }

    @Test
    @DisplayName("GET list → 200 OK y estructura de SectionResponseDTO")
    void listSections_returnsOkWithArray() throws Exception {
        var dto1 = sampleResponse(1L);
        var dto2 = sampleResponse(2L);
        given(sectionService.getSectionsByGroup(eq(TENANT), eq(GROUP))).willReturn(List.of(dto1, dto2));

        mvc.perform(get(BASE, TENANT, GROUP))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$", hasSize(2)))
           .andExpect(jsonPath("$[0].sectionId", is(1)))
           .andExpect(jsonPath("$[0].tenantId", is("tenant1")))
           .andExpect(jsonPath("$[0].groupId", is(11)))
           .andExpect(jsonPath("$[0].name", is("Manada")))
           .andExpect(jsonPath("$[0].description", is("Descripción")))
           .andExpect(jsonPath("$[0].iconObjectUrl", is("https://cdn.example/icon.png")))
           .andExpect(jsonPath("$[0].photoPrincipalUrl", is("https://cdn.example/photo-principal.jpg")))
           .andExpect(jsonPath("$[0].galleryObjectUrls", hasSize(2)))
           .andExpect(jsonPath("$[0].gallery", hasSize(2)))
           .andExpect(jsonPath("$[0].gallery[0].url", is("https://cdn.example/img-1.jpg")))
           .andExpect(jsonPath("$[0].createdAt", is("2024-01-01T00:00:00Z")))
           .andExpect(jsonPath("$[0].updatedAt", is("2024-01-02T00:00:00Z")));
    }

    @Test
    @DisplayName("GET by id → 200 OK con payload completo")
    void getSectionById_returnsOk() throws Exception {
        var dto = sampleResponse(SECTION_ID);
        given(sectionService.getSectionById(eq(TENANT), eq(GROUP), eq(SECTION_ID))).willReturn(dto);

        mvc.perform(get(BASE + "/{id}", TENANT, GROUP, SECTION_ID))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.sectionId", is(1)))
           .andExpect(jsonPath("$.tenantId", is("tenant1")))
           .andExpect(jsonPath("$.groupId", is(11)))
           .andExpect(jsonPath("$.name", is("Manada")))
           .andExpect(jsonPath("$.description", is("Descripción")))
           .andExpect(jsonPath("$.iconObjectUrl", is("https://cdn.example/icon.png")))
           .andExpect(jsonPath("$.photoPrincipalUrl", is("https://cdn.example/photo-principal.jpg")))
           .andExpect(jsonPath("$.galleryObjectUrls", hasSize(2)))
           .andExpect(jsonPath("$.gallery", hasSize(2)))
           .andExpect(jsonPath("$.gallery[1].url", is("https://cdn.example/img-2.jpg")))
           .andExpect(jsonPath("$.createdAt", is("2024-01-01T00:00:00Z")))
           .andExpect(jsonPath("$.updatedAt", is("2024-01-02T00:00:00Z")));
    }

    @Test
    @DisplayName("POST inválido (body vacío) → 400")
    void create_invalid_returns400() throws Exception {
        mvc.perform(post(BASE, TENANT, GROUP)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(Map.of())))
           .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT inválido (body vacío) → 400")
    void update_invalid_returns400() throws Exception {
        mvc.perform(put(BASE + "/{id}", TENANT, GROUP, SECTION_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(Map.of())))
           .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE → 204 No Content")
    void delete_returns204() throws Exception {
        doNothing().when(sectionService).deleteSection(eq(TENANT), eq(GROUP), eq(SECTION_ID));

        mvc.perform(delete(BASE + "/{id}", TENANT, GROUP, SECTION_ID))
           .andExpect(status().isNoContent());
    }
}
