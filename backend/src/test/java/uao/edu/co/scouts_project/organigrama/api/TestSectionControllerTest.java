package uao.edu.co.scouts_project.organigrama.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;

@ActiveProfiles("test")
@WebMvcTest(controllers = SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TestSectionControllerTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private TenantFilter tenantFilter;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private JdbcTemplate jdbcTemplate;

    private static final String TENANT = "region-valle";
    private static final String GROUP = "grupo-803";
    private static final long SECTION_ID = 7L;
    private static final String BASE = "/api/v1/tenants/{tenantSlug}/groups/{groupSlug}/sections";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SectionService sectionService;

    // ---------- Helpers ----------
    private SectionResponseDTO sectionResponse(long id, String name) {
        return new SectionResponseDTO(
                id,          // sectionId
                10L,         // tenantId
                20L,         // groupId
                name,        // name
                "Descripción de la sección",
                "https://cdn/icon.png",
                "https://cdn/cover.png",
                List.of("https://cdn/gallery/1.png"),
                Instant.now(),
                Instant.now()
        );
    }

    private SectionDTO sectionDTO(String name) {
        return new SectionDTO(
                null,   // sectionId
                null,   // tenantId
                null,   // groupId
                name,   // name (required)
                "Descripción",
                null,   // iconObjectId
                null,   // photoPrincipal
                new UUID[0], // galleryObjectIds
                null,   // createdAt
                null    // updatedAt
        );
    }

    // ---------- GET: list ----------
    @Test
    @DisplayName("GET /sections — 200 con la lista de secciones del grupo")
    void shouldListSectionsByGroup() throws Exception {
        when(sectionService.getSectionsByGroup(TENANT, GROUP))
                .thenReturn(List.of(sectionResponse(SECTION_ID, "Manada")));

        mockMvc.perform(get(BASE, TENANT, GROUP))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].sectionId").value(SECTION_ID))
                .andExpect(jsonPath("$[0].name").value("Manada"));

        verify(sectionService).getSectionsByGroup(TENANT, GROUP);
    }

    @Test
    @DisplayName("GET /sections — 200 con lista vacía cuando no hay secciones")
    void shouldReturnEmptyListWhenNoSections() throws Exception {
        when(sectionService.getSectionsByGroup(TENANT, GROUP)).thenReturn(List.of());

        mockMvc.perform(get(BASE, TENANT, GROUP))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(sectionService).getSectionsByGroup(TENANT, GROUP);
    }

    // ---------- GET: by id ----------
    @Test
    @DisplayName("GET /sections/{id} — 200 con la sección")
    void shouldGetSectionById() throws Exception {
        when(sectionService.getSectionById(TENANT, GROUP, SECTION_ID))
                .thenReturn(sectionResponse(SECTION_ID, "Manada"));

        mockMvc.perform(get(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sectionId").value(SECTION_ID))
                .andExpect(jsonPath("$.name").value("Manada"));

        verify(sectionService).getSectionById(TENANT, GROUP, SECTION_ID);
    }

    @Test
    @DisplayName("GET /sections/{id} — 404 cuando no existe")
    void shouldReturn404WhenSectionNotFound() throws Exception {
        when(sectionService.getSectionById(TENANT, GROUP, SECTION_ID))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Sección no encontrada"));

        mockMvc.perform(get(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isNotFound());

        verify(sectionService).getSectionById(TENANT, GROUP, SECTION_ID);
    }

    // ---------- GET: with subgroups ----------
    @Test
    @DisplayName("GET /sections/{id}/with-subgroups — 200 con sección y subgrupos")
    void shouldGetSectionWithSubgroups() throws Exception {
        SectionResponseDTO section = sectionResponse(SECTION_ID, "Manada");
        List<Map<String, Object>> subgroups = List.of(Map.of("subgroupId", 1L, "name", "Seisena Amarilla"));

        when(sectionService.getSectionWithSubgroups(TENANT, GROUP, SECTION_ID))
                .thenReturn(Map.of("section", section, "subgroups", subgroups));

        mockMvc.perform(get(BASE + "/{sectionId}/with-subgroups", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.section.sectionId").value(SECTION_ID))
                .andExpect(jsonPath("$.subgroups").isArray());

        verify(sectionService).getSectionWithSubgroups(TENANT, GROUP, SECTION_ID);
    }

    // ---------- POST: create ----------
    @Test
    @DisplayName("POST /sections — 201 Created con Location y cuerpo")
    void shouldCreateSection() throws Exception {
        SectionDTO payload = sectionDTO("Manada");
        SectionResponseDTO created = sectionResponse(SECTION_ID, "Manada");

        when(sectionService.createSection(eq(TENANT), eq(GROUP), any(SectionDTO.class)))
                .thenReturn(created);

        mockMvc.perform(
                        post(BASE, TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/v1/tenants/" + TENANT + "/groups/" + GROUP + "/sections/" + SECTION_ID))
                .andExpect(jsonPath("$.sectionId").value(SECTION_ID))
                .andExpect(jsonPath("$.name").value("Manada"));

        verify(sectionService).createSection(eq(TENANT), eq(GROUP), any(SectionDTO.class));
    }

    @Test
    @DisplayName("POST /sections — 409 Conflict si hay duplicados/violaciones de negocio")
    void shouldReturn409OnCreateConflict() throws Exception {
        when(sectionService.createSection(eq(TENANT), eq(GROUP), any(SectionDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Duplicado"));

        mockMvc.perform(
                        post(BASE, TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(sectionDTO("Manada")))
                )
                .andExpect(status().isConflict());

        verify(sectionService).createSection(eq(TENANT), eq(GROUP), any(SectionDTO.class));
    }

    @Test
    @DisplayName("POST /sections — 400 Bad Request si el payload es inválido (name en blanco)")
    void shouldReturn400OnCreateValidationError() throws Exception {
        String invalidJson = "{ \"name\": \"  \" }";

        mockMvc.perform(
                        post(BASE, TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson)
                )
                .andExpect(status().isBadRequest());

        verify(sectionService, never()).createSection(anyString(), anyString(), any(SectionDTO.class));
    }

    // ---------- PUT: update ----------
    @Test
    @DisplayName("PUT /sections/{id} — 200 con la sección actualizada")
    void shouldUpdateSection() throws Exception {
        SectionDTO payload = sectionDTO("Manada (editada)");
        SectionResponseDTO updated = sectionResponse(SECTION_ID, "Manada (editada)");

        when(sectionService.updateSection(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SectionDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(
                        put(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Manada (editada)"));

        verify(sectionService).updateSection(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SectionDTO.class));
    }

    @Test
    @DisplayName("PUT /sections/{id} — 404 si no existe")
    void shouldReturn404OnUpdateNotFound() throws Exception {
        when(sectionService.updateSection(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SectionDTO.class)))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe"));

        mockMvc.perform(
                        put(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(sectionDTO("Manada")))
                )
                .andExpect(status().isNotFound());

        verify(sectionService).updateSection(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SectionDTO.class));
    }

    // ---------- DELETE: section ----------
    @Test
    @DisplayName("DELETE /sections/{id} — 204 No Content")
    void shouldDeleteSection() throws Exception {
        doNothing().when(sectionService).deleteSection(TENANT, GROUP, SECTION_ID);

        mockMvc.perform(delete(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isNoContent());

        verify(sectionService).deleteSection(TENANT, GROUP, SECTION_ID);
    }

    @Test
    @DisplayName("DELETE /sections/{id} — 404 si no existe")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
                .when(sectionService).deleteSection(TENANT, GROUP, SECTION_ID);

        mockMvc.perform(delete(BASE + "/{sectionId}", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isNotFound());

        verify(sectionService).deleteSection(TENANT, GROUP, SECTION_ID);
    }

    // ---------- DELETE: icon ----------
    @Test
    @DisplayName("DELETE /sections/{id}/icon — 204 No Content")
    void shouldDeleteIcon() throws Exception {
        doNothing().when(sectionService).deleteIconImage(TENANT, GROUP, SECTION_ID);

        mockMvc.perform(delete(BASE + "/{sectionId}/icon", TENANT, GROUP, SECTION_ID))
                .andExpect(status().isNoContent());

        verify(sectionService).deleteIconImage(TENANT, GROUP, SECTION_ID);
    }

    // ---------- DELETE: gallery/{objectId} ----------
    @Test
    @DisplayName("DELETE /sections/{id}/gallery/{objectId} — 204 No Content")
    void shouldDeleteGalleryObject() throws Exception {
        UUID objectId = UUID.randomUUID();
        doNothing().when(sectionService).deleteGalleryImageById(TENANT, GROUP, SECTION_ID, objectId);

        mockMvc.perform(delete(BASE + "/{sectionId}/gallery/{objectId}", TENANT, GROUP, SECTION_ID, objectId))
                .andExpect(status().isNoContent());

        verify(sectionService).deleteGalleryImageById(TENANT, GROUP, SECTION_ID, objectId);
    }

    @Test
    @DisplayName("DELETE /sections/{id}/gallery/{objectId} — 400 si el UUID es inválido (binding error)")
    void shouldReturn400OnDeleteGalleryInvalidUuid() throws Exception {
        mockMvc.perform(delete(BASE + "/{sectionId}/gallery/{objectId}", TENANT, GROUP, SECTION_ID, "not-a-uuid"))
                .andExpect(status().isBadRequest());

        verify(sectionService, never()).deleteGalleryImageById(anyString(), anyString(), anyLong(), any(UUID.class));
    }

    // ---------- PATCH: icon ----------
    @Test
    @DisplayName("PATCH /sections/{id}/icon — 204 con UUID válido")
    void shouldPatchIcon() throws Exception {
        UUID iconId = UUID.randomUUID();
        doNothing().when(sectionService).updateIcon(TENANT, GROUP, SECTION_ID, iconId);

        String body = "{ \"objectId\": \"" + iconId + "\" }";

        mockMvc.perform(
                        patch(BASE + "/{sectionId}/icon", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(sectionService).updateIcon(TENANT, GROUP, SECTION_ID, iconId);
    }

    @Test
    @DisplayName("PATCH /sections/{id}/icon — 400 si el UUID es inválido")
    void shouldReturn400OnPatchIconInvalidUuid() throws Exception {
        String invalidBody = "{ \"objectId\": \"bad-uuid\" }";

        mockMvc.perform(
                        patch(BASE + "/{sectionId}/icon", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidBody)
                )
                .andExpect(status().isBadRequest());

        verify(sectionService, never()).updateIcon(anyString(), anyString(), anyLong(), any(UUID.class));
    }

    // ---------- PATCH: photo-principal ----------
    @Test
    @DisplayName("PATCH /sections/{id}/photo-principal — 204 con UUID válido")
    void shouldPatchPhotoPrincipal() throws Exception {
        UUID photoId = UUID.randomUUID();
        doNothing().when(sectionService).updatePhotoPrincipal(TENANT, GROUP, SECTION_ID, photoId);

        String body = "{ \"objectId\": \"" + photoId + "\" }";

        mockMvc.perform(
                        patch(BASE + "/{sectionId}/photo-principal", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(sectionService).updatePhotoPrincipal(TENANT, GROUP, SECTION_ID, photoId);
    }

    // ---------- PATCH: gallery (JSON Patch-like operations) ----------
    @Test
    @DisplayName("PATCH /sections/{id}/gallery — 204 aplicando operaciones a la galería")
    void shouldPatchGallery() throws Exception {
        String body = """
            {
              "operations": [
                { "op": "add", "objectId": "%s" },
                { "op": "remove", "objectId": "%s" }
              ]
            }
            """.formatted(UUID.randomUUID(), UUID.randomUUID());

        doNothing().when(sectionService).patchGallery(eq(TENANT), eq(GROUP), eq(SECTION_ID), anyList());

        mockMvc.perform(
                        patch(BASE + "/{sectionId}/gallery", TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(sectionService).patchGallery(eq(TENANT), eq(GROUP), eq(SECTION_ID), anyList());
    }
}
