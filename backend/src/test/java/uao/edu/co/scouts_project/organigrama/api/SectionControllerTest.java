package uao.edu.co.scouts_project.organigrama.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import static org.mockito.ArgumentMatchers.any;

// 👉 En Spring Boot 3.4+, usar MockitoBean (Spring Framework 6.2)
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SectionControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // Reemplaza @MockBean (deprecado) por @MockitoBean
    @MockitoBean private SectionService sectionService;

    // Evita que el slice intente construir un filtro real que depende de DB/JdbcTemplate
    @MockitoBean private uao.edu.co.scouts_project.common.tenant.TenantFilter tenantFilter;

    private static final String BASE = "/api/v1/tenants/{tenantSlug}/groups/{groupSlug}/sections";

    private SectionResponseDTO sampleResponse() {
        return new SectionResponseDTO(
            10L, "t-123", 803L, "Tropa", "Sección Tropa",
            "https://cdn/img/icon.png",
            "https://cdn/img/photo.png",
            List.of("https://cdn/img/g1.png","https://cdn/img/g2.png"),
            Instant.parse("2025-01-01T00:00:00Z"),
            Instant.parse("2025-02-01T00:00:00Z")
        );
    }

    @Test
    @DisplayName("GET /{id} -> 200 y SectionResponseDTO JSON")
    void getSection_ok() throws Exception {
        when(sectionService.getSectionById("region-valle", "grupo-803", 10L))
            .thenReturn(sampleResponse());

        mockMvc.perform(get(BASE + "/{id}", "region-valle", "grupo-803", 10L)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sectionId", is(10)))
            .andExpect(jsonPath("$.name", is("Tropa")))
            .andExpect(jsonPath("$.iconObjectUrl", containsString("icon.png")));
    }

    @Test
    @DisplayName("GET /{id}/with-subgroups -> 200 y { section, subgroups }")
    void getSectionWithSubgroups_ok() throws Exception {
        Map<String,Object> payload = Map.of("section", sampleResponse(), "subgroups", List.of());
        when(sectionService.getSectionWithSubgroups("region-valle", "grupo-803", 10L))
            .thenReturn(payload);

        mockMvc.perform(get(BASE + "/{id}/with-subgroups", "region-valle", "grupo-803", 10L)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.section.name", is("Tropa")))
            .andExpect(jsonPath("$.subgroups", hasSize(0)));
    }

    @Test
    @DisplayName("PUT /{id} -> 400 si name en blanco (validación @NotBlank)")
    void updateSection_validationError() throws Exception {
        SectionDTO patch = new SectionDTO(
            null, null, null, "  ", "desc", null, null, null, null, null
        );
        mockMvc.perform(put(BASE + "/{id}", "region-valle", "grupo-803", 10L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patch)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /{id} -> 200 y objeto actualizado")
    void updateSection_ok() throws Exception {
        SectionDTO patch = new SectionDTO(
            null, null, null, "Tropa Renovada", "desc", null, null, null, null, null
        );
        when(sectionService.updateSection(eq("region-valle"), eq("grupo-803"), eq(10L), any(SectionDTO.class)))
            .thenReturn(new SectionResponseDTO(
                10L, "t-123", 803L, "Tropa Renovada", "desc",
                "https://cdn/img/icon.png", "https://cdn/img/photo.png",
                List.of(), Instant.parse("2025-01-01T00:00:00Z"), Instant.parse("2025-02-02T00:00:00Z")
            ));

        mockMvc.perform(put(BASE + "/{id}", "region-valle", "grupo-803", 10L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patch)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Tropa Renovada")));
    }

    @Test
    @DisplayName("PATCH /{id}/icon -> 204, invoca service.updateIcon(UUID)")
    void patchIcon_ok() throws Exception {
        UUID newIcon = UUID.randomUUID();
        doNothing().when(sectionService).updateIcon("region-valle", "grupo-803", 10L, newIcon);

        // Body compatible con UpdateImageRequest { "objectId": "<uuid>" }
        String body = "{\"objectId\":\"" + newIcon + "\"}";
        mockMvc.perform(patch(BASE + "/{id}/icon", "region-valle", "grupo-803", 10L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /{id}/photo-principal -> 204")
    void patchPhoto_ok() throws Exception {
        UUID newPhoto = UUID.randomUUID();
        doNothing().when(sectionService).updatePhotoPrincipal("region-valle", "grupo-803", 10L, newPhoto);

        String body = "{\"objectId\":\"" + newPhoto + "\"}";
        mockMvc.perform(patch(BASE + "/{id}/photo-principal", "region-valle", "grupo-803", 10L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /{id}/gallery -> 204")
    void patchGallery_ok() throws Exception {
        // GalleryPatchRequest { "operations": [ { "op":"add","objectId":"..." }, ... ] }
        String body = """
            {"operations":[{"op":"add","objectId":"%s"},{"op":"remove","objectId":"%s"}]}
            """.formatted(UUID.randomUUID(), UUID.randomUUID());
        doNothing().when(sectionService).patchGallery(eq("region-valle"), eq("grupo-803"), eq(10L), anyList());

        mockMvc.perform(patch(BASE + "/{id}/gallery", "region-valle", "grupo-803", 10L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /{id} -> 204")
    void deleteSection_ok() throws Exception {
        doNothing().when(sectionService).deleteSection("region-valle", "grupo-803", 10L);

        mockMvc.perform(delete(BASE + "/{id}", "region-valle", "grupo-803", 10L))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /{id}/icon -> 204")
    void deleteIcon_ok() throws Exception {
        doNothing().when(sectionService).deleteIconImage("region-valle", "grupo-803", 10L);

        mockMvc.perform(delete(BASE + "/{id}/icon", "region-valle", "grupo-803", 10L))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /{id}/gallery/{objectId} -> 204")
    void deleteGalleryImage_ok() throws Exception {
        UUID obj = UUID.randomUUID();
        doNothing().when(sectionService).deleteGalleryImageById("region-valle", "grupo-803", 10L, obj);

        mockMvc.perform(delete(BASE + "/{id}/gallery/{oid}", "region-valle", "grupo-803", 10L, obj))
            .andExpect(status().isNoContent());
    }
}
