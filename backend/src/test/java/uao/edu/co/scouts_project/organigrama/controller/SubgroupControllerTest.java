package uao.edu.co.scouts_project.organigrama.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.common.tenant.TenantFilter;
import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SubgroupController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SubgroupControllerTest {

    private static final String TENANT = "tenant-demo";
    private static final String GROUP  = "centinelas-113";
    private static final Long SECTION  = 1L;
    private static final Long SUBID    = 10L;

    private static final String BASE = "/api/v1/tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean SubgroupService subgroupService;
    @MockitoBean TenantFilter tenantFilter;
    @MockitoBean AuthoritiesMappingPort authoritiesMappingPort;

    private SubgroupResponseDTO sample() {
        return new SubgroupResponseDTO(
            SUBID, "T1", 42L, SECTION,
            "Panteras", "Patrulla Panteras",
            UUID.fromString("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "https://cdn.url/panteras.png",
            true, Instant.parse("2024-01-01T00:00:00Z"), Instant.parse("2024-01-02T00:00:00Z")
        );
    }

    @Test
    @DisplayName("GET /subgroups → 200 y lista")
    void list_ok() throws Exception {
        when(subgroupService.getSubgroupsBySection(TENANT, GROUP, SECTION)).thenReturn(List.of(sample()));

        mvc.perform(get(BASE, TENANT, GROUP, SECTION))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].name").value("Panteras"))
           .andExpect(jsonPath("$[0].photoPrincipalUrl").value("https://cdn.url/panteras.png"));
    }

    @Test
    @DisplayName("GET /subgroups/{id} → 200 y detalle")
    void get_ok() throws Exception {
        when(subgroupService.getSubgroupById(TENANT, GROUP, SECTION, SUBID)).thenReturn(sample());

        mvc.perform(get(BASE + "/{subgroupId}", TENANT, GROUP, SECTION, SUBID))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.subgroupId").value(SUBID))
           .andExpect(jsonPath("$.name").value("Panteras"));
    }

    @Test
    @DisplayName("POST /subgroups → 201 Created + Location")
    void create_ok() throws Exception {
        SubgroupDTO req = new SubgroupDTO(
            null, null, null, SECTION, "Panteras",
            "Patrulla Panteras", null, true, null, null
        );

        when(subgroupService.createSubgroup(eq(TENANT), eq(GROUP), eq(SECTION), any(SubgroupDTO.class)))
            .thenReturn(sample());

        mvc.perform(post(BASE, TENANT, GROUP, SECTION)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(req)))
           .andExpect(status().isCreated())
           .andExpect(header().exists("Location"))
           .andExpect(jsonPath("$.name").value("Panteras"));
    }

    @Test
    @DisplayName("PUT /subgroups/{id} → 200 OK")
    void update_ok() throws Exception {
        SubgroupDTO req = new SubgroupDTO(
            SUBID, null, null, SECTION, "Panteras (upd)",
            "Actualizada", null, true, null, null
        );

        SubgroupResponseDTO updated = new SubgroupResponseDTO(
            SUBID, "T1", 42L, SECTION,
            "Panteras (upd)", "Actualizada",
            UUID.fromString("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "https://cdn.url/panteras.png",
            true, Instant.parse("2024-02-01T00:00:00Z"), Instant.parse("2024-02-02T00:00:00Z")
        );

        when(subgroupService.updateSubgroup(eq(TENANT), eq(GROUP), eq(SECTION), eq(SUBID), any(SubgroupDTO.class)))
            .thenReturn(updated);

        mvc.perform(put(BASE + "/{subgroupId}", TENANT, GROUP, SECTION, SUBID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(req)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Panteras (upd)"));
    }

    @Test
    @DisplayName("DELETE /subgroups/{id} → 204 No Content")
    void delete_ok() throws Exception {
        doNothing().when(subgroupService).deleteSubgroup(TENANT, GROUP, SECTION, SUBID);

        mvc.perform(delete(BASE + "/{subgroupId}", TENANT, GROUP, SECTION, SUBID))
           .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /subgroups/{id}/photo-principal → 204 No Content")
    void patch_photo_ok() throws Exception {
        UUID newId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        doNothing().when(subgroupService).updatePhotoPrincipal(TENANT, GROUP, SECTION, SUBID, newId);

        String body = "{\"objectId\":\"" + newId + "\"}";

        mvc.perform(patch(BASE + "/{subgroupId}/photo-principal", TENANT, GROUP, SECTION, SUBID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
           .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /subgroups/{id}/photo-principal → 204 No Content")
    void delete_photo_ok() throws Exception {
        doNothing().when(subgroupService).deletePhotoPrincipal(TENANT, GROUP, SECTION, SUBID);

        mvc.perform(delete(BASE + "/{subgroupId}/photo-principal", TENANT, GROUP, SECTION, SUBID))
           .andExpect(status().isNoContent());

        verify(subgroupService).deletePhotoPrincipal(TENANT, GROUP, SECTION, SUBID);
    }
}
