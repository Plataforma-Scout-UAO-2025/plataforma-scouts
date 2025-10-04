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
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;

@ActiveProfiles("test")
@WebMvcTest(controllers = SubgroupController.class)
@AutoConfigureMockMvc(addFilters = false)
class TestSubGroupControllerTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private TenantFilter tenantFilter;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private JdbcTemplate jdbcTemplate;

    private static final String TENANT = "region-valle";
    private static final String GROUP = "grupo-803";
    private static final Long SECTION_ID = 5L;
    private static final Long SUBGROUP_ID = 7L;

    private static final String BASE =
            "/api/v1/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SubgroupService subgroupService;

    // ----------------- Helpers -----------------
    private SubgroupResponseDTO subgroupResponse(long id, String name) {
        return new SubgroupResponseDTO(
                id,              // subgroupId
                10L,             // tenantId
                20L,             // groupId
                SECTION_ID,      // sectionId
                name,            // name
                "Descripción",   // description
                "https://cdn/photo-principal.png",         // photoPrincipalUrl
                List.of("https://cdn/gallery/1.png"),       // galleryObjectUrls
                true,             // isActive
                Instant.now(),    // createdAt
                Instant.now()     // updatedAt
        );
    }

    private SubgroupDTO subgroupDTO(String name) {
        return new SubgroupDTO(
                null,     // subgroupId
                null,     // tenantId
                null,     // groupId
                SECTION_ID,
                name,
                "Descripción",
                null,     // photoPrincipal
                new UUID[0],
                true,     // isActive
                null,
                null
        );
    }

    // ----------------- GET: list -----------------
    @Test
    @DisplayName("GET /subgroups — 200 con lista de subgrupos de la sección")
    void shouldListSubgroupsBySection() throws Exception {
        when(subgroupService.getSubgroupsBySection(TENANT, GROUP, SECTION_ID))
                .thenReturn(List.of(subgroupResponse(SUBGROUP_ID, "Seisena Amarilla")));

        mockMvc.perform(get(BASE, TENANT, GROUP, SECTION_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].subgroupId").value(SUBGROUP_ID))
                .andExpect(jsonPath("$[0].name").value("Seisena Amarilla"));

        verify(subgroupService).getSubgroupsBySection(TENANT, GROUP, SECTION_ID);
    }

    @Test
    @DisplayName("GET /subgroups — 200 con lista vacía")
    void shouldReturnEmptyListWhenNoSubgroups() throws Exception {
        when(subgroupService.getSubgroupsBySection(TENANT, GROUP, SECTION_ID))
                .thenReturn(List.of());

        mockMvc.perform(get(BASE, TENANT, GROUP, SECTION_ID))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(subgroupService).getSubgroupsBySection(TENANT, GROUP, SECTION_ID);
    }

    // ----------------- GET: by id -----------------
    @Test
    @DisplayName("GET /subgroups/{id} — 200 con el subgrupo")
    void shouldGetSubgroupById() throws Exception {
        when(subgroupService.getSubgroupById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .thenReturn(subgroupResponse(SUBGROUP_ID, "Seisena Amarilla"));

        mockMvc.perform(get(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subgroupId").value(SUBGROUP_ID))
                .andExpect(jsonPath("$.name").value("Seisena Amarilla"));

        verify(subgroupService).getSubgroupById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);
    }

    @Test
    @DisplayName("GET /subgroups/{id} — 404 cuando no existe")
    void shouldReturn404WhenSubgroupNotFound() throws Exception {
        when(subgroupService.getSubgroupById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Subgrupo no encontrado"));

        mockMvc.perform(get(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .andExpect(status().isNotFound());

        verify(subgroupService).getSubgroupById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);
    }

    // ----------------- POST: create -----------------
    @Test
    @DisplayName("POST /subgroups — 201 Created con Location y cuerpo")
    void shouldCreateSubgroup() throws Exception {
        SubgroupDTO payload = subgroupDTO("Seisena Amarilla");
        SubgroupResponseDTO created = subgroupResponse(SUBGROUP_ID, "Seisena Amarilla");

        when(subgroupService.createSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SubgroupDTO.class)))
                .thenReturn(created);

        mockMvc.perform(
                        post(BASE, TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/v1/tenants/" + TENANT + "/groups/" + GROUP + "/sections/" + SECTION_ID + "/subgroups/" + SUBGROUP_ID))
                .andExpect(jsonPath("$.subgroupId").value(SUBGROUP_ID))
                .andExpect(jsonPath("$.name").value("Seisena Amarilla"));

        verify(subgroupService).createSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SubgroupDTO.class));
    }

    @Test
    @DisplayName("POST /subgroups — 409 Conflict si hay duplicados/violación de negocio")
    void shouldReturn409OnCreateConflict() throws Exception {
        when(subgroupService.createSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SubgroupDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Duplicado"));

        mockMvc.perform(
                        post(BASE, TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(subgroupDTO("Seisena Amarilla")))
                )
                .andExpect(status().isConflict());

        verify(subgroupService).createSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), any(SubgroupDTO.class));
    }

    @Test
    @DisplayName("POST /subgroups — 400 Bad Request si el payload es inválido (name en blanco)")
    void shouldReturn400OnCreateValidationError() throws Exception {
        String invalidJson = "{ \"name\": \"  \" }";

        mockMvc.perform(
                        post(BASE, TENANT, GROUP, SECTION_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson)
                )
                .andExpect(status().isBadRequest());

        verify(subgroupService, never()).createSubgroup(anyString(), anyString(), anyLong(), any(SubgroupDTO.class));
    }

    // ----------------- PUT: update -----------------
    @Test
    @DisplayName("PUT /subgroups/{id} — 200 con el subgrupo actualizado")
    void shouldUpdateSubgroup() throws Exception {
        SubgroupDTO payload = subgroupDTO("Seisena Amarilla (editada)");
        SubgroupResponseDTO updated = subgroupResponse(SUBGROUP_ID, "Seisena Amarilla (editada)");

        when(subgroupService.updateSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), any(SubgroupDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(
                        put(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Seisena Amarilla (editada)"));

        verify(subgroupService).updateSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), any(SubgroupDTO.class));
    }

    @Test
    @DisplayName("PUT /subgroups/{id} — 404 si no existe")
    void shouldReturn404OnUpdateNotFound() throws Exception {
        when(subgroupService.updateSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), any(SubgroupDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe"));

        mockMvc.perform(
                        put(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(subgroupDTO("Seisena")))
                )
                .andExpect(status().isNotFound());

        verify(subgroupService).updateSubgroup(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), any(SubgroupDTO.class));
    }

    // ----------------- DELETE: subgroup -----------------
    @Test
    @DisplayName("DELETE /subgroups/{id} — 204 No Content")
    void shouldDeleteSubgroup() throws Exception {
        doNothing().when(subgroupService).deleteSubgroup(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);

        mockMvc.perform(delete(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .andExpect(status().isNoContent());

        verify(subgroupService).deleteSubgroup(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);
    }

    @Test
    @DisplayName("DELETE /subgroups/{id} — 404 si no existe")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
                .when(subgroupService).deleteSubgroup(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);

        mockMvc.perform(delete(BASE + "/{subgroupId}", TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .andExpect(status().isNotFound());

        verify(subgroupService).deleteSubgroup(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);
    }

    // ----------------- PATCH: photo-principal -----------------
    @Test
    @DisplayName("PATCH /subgroups/{id}/photo-principal — 204 con UUID válido")
    void shouldPatchPhotoPrincipal() throws Exception {
        UUID photoId = UUID.randomUUID();
        doNothing().when(subgroupService).updatePhotoPrincipal(TENANT, GROUP, SECTION_ID, SUBGROUP_ID, photoId);

        String body = "{ \"objectId\": \"" + photoId + "\" }";

        mockMvc.perform(
                        patch(BASE + "/{subgroupId}/photo-principal", TENANT, GROUP, SECTION_ID, SUBGROUP_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(subgroupService).updatePhotoPrincipal(TENANT, GROUP, SECTION_ID, SUBGROUP_ID, photoId);
    }

    @Test
    @DisplayName("PATCH /subgroups/{id}/photo-principal — 400 si el UUID es inválido")
    void shouldReturn400OnPatchPhotoPrincipalInvalidUuid() throws Exception {
        String invalidBody = "{ \"objectId\": \"bad-uuid\" }";

        mockMvc.perform(
                        patch(BASE + "/{subgroupId}/photo-principal", TENANT, GROUP, SECTION_ID, SUBGROUP_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidBody)
                )
                .andExpect(status().isBadRequest());

        verify(subgroupService, never()).updatePhotoPrincipal(anyString(), anyString(), anyLong(), anyLong(), any(UUID.class));
    }

    // ----------------- DELETE: photo-principal -----------------
    @Test
    @DisplayName("DELETE /subgroups/{id}/photo-principal — 204 No Content")
    void shouldDeletePhotoPrincipal() throws Exception {
        doNothing().when(subgroupService).deletePhotoPrincipal(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);

        mockMvc.perform(delete(BASE + "/{subgroupId}/photo-principal", TENANT, GROUP, SECTION_ID, SUBGROUP_ID))
                .andExpect(status().isNoContent());

        verify(subgroupService).deletePhotoPrincipal(TENANT, GROUP, SECTION_ID, SUBGROUP_ID);
    }

    // ----------------- DELETE: gallery/{objectId} -----------------
    @Test
    @DisplayName("DELETE /subgroups/{id}/gallery/{objectId} — 204 No Content")
    void shouldDeleteGalleryObject() throws Exception {
        UUID objectId = UUID.randomUUID();
        doNothing().when(subgroupService).deleteGalleryImageById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID, objectId);

        mockMvc.perform(delete(BASE + "/{subgroupId}/gallery/{objectId}",
                        TENANT, GROUP, SECTION_ID, SUBGROUP_ID, objectId))
                .andExpect(status().isNoContent());

        verify(subgroupService).deleteGalleryImageById(TENANT, GROUP, SECTION_ID, SUBGROUP_ID, objectId);
    }

    @Test
    @DisplayName("DELETE /subgroups/{id}/gallery/{objectId} — 400 si el UUID es inválido")
    void shouldReturn400OnDeleteGalleryInvalidUuid() throws Exception {
        mockMvc.perform(delete(BASE + "/{subgroupId}/gallery/{objectId}",
                        TENANT, GROUP, SECTION_ID, SUBGROUP_ID, "not-a-uuid"))
                .andExpect(status().isBadRequest());

        verify(subgroupService, never()).deleteGalleryImageById(anyString(), anyString(), anyLong(), anyLong(), any(UUID.class));
    }

    // ----------------- PATCH: gallery (operaciones) -----------------
    @Test
    @DisplayName("PATCH /subgroups/{id}/gallery — 204 aplicando operaciones a la galería")
    void shouldPatchGallery() throws Exception {
        String body = """
            {
              "operations": [
                { "op": "add", "objectId": "%s" },
                { "op": "remove", "objectId": "%s" }
              ]
            }
            """.formatted(UUID.randomUUID(), UUID.randomUUID());

        doNothing().when(subgroupService).patchGallery(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), anyList());

        mockMvc.perform(
                        patch(BASE + "/{subgroupId}/gallery", TENANT, GROUP, SECTION_ID, SUBGROUP_ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(subgroupService).patchGallery(eq(TENANT), eq(GROUP), eq(SECTION_ID), eq(SUBGROUP_ID), anyList());
    }
}
