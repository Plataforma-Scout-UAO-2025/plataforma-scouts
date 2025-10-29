package uao.edu.co.scouts_project.organigrama.controller;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.service.TenantService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

// ⬇️ IMPORTA LAS NUEVAS ANOTACIONES (Spring Framework 6.2+)
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TenantController.class)
@AutoConfigureMockMvc(addFilters = false) // desactiva filtros de seguridad
@ActiveProfiles("test")
class TenantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ⬇️ reemplaza @MockBean por @MockitoBean
    @MockitoBean
    private TenantService tenantService;

    // ⬇️ mockeamos el filtro que depende de JdbcTemplate para que el slice no falle
        @MockitoBean
        private uao.edu.co.scouts_project.common.tenant.TenantFilter tenantFilter;

        @MockitoBean
        private AuthoritiesMappingPort authoritiesMappingPort;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/tenants -> 200 y lista JSON")
    void listTenants_ok() throws Exception {
        TenantDTO t1 = new TenantDTO("t-1", "slug-1", "active",
                Instant.parse("2025-01-01T00:00:00Z"), Instant.parse("2025-01-02T00:00:00Z"));
        TenantDTO t2 = new TenantDTO("t-2", "slug-2", "inactive",
                Instant.parse("2025-02-01T00:00:00Z"), Instant.parse("2025-02-02T00:00:00Z"));

        when(tenantService.getAllTenants()).thenReturn(List.of(t1, t2));

        mockMvc.perform(get("/api/v1/tenants").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].slug", is("slug-1")))
            .andExpect(jsonPath("$[1].slug", is("slug-2")));
    }

    @Test
        @DisplayName("GET /api/v1/tenants/{tenantId} -> 200 y objeto JSON")
    void getTenant_ok() throws Exception {
                TenantDTO dto = new TenantDTO("tenant-001", "region-valle", "active",
                Instant.parse("2025-01-01T00:00:00Z"), Instant.parse("2025-01-02T00:00:00Z"));

                when(tenantService.getTenantById("tenant-001")).thenReturn(dto);

                mockMvc.perform(get("/api/v1/tenants/{tenantId}", "tenant-001")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.slug", is("region-valle")))
            .andExpect(jsonPath("$.status", is("active")));
    }

    @Test
    @DisplayName("POST /api/v1/tenants -> 400 si slug en blanco (validación @NotBlank)")
    void createTenant_validationError() throws Exception {
        var body = new TenantDTO(null, "  ", "active", null, null);

        mockMvc.perform(post("/api/v1/tenants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/tenants -> 201, Location header y JSON")
    void createTenant_created() throws Exception {
        var incoming = new TenantDTO(null, "nuevo-slug", "active", null, null);
        var created  = new TenantDTO("t-nuevo-slug", "nuevo-slug", "active",
                Instant.parse("2025-03-01T00:00:00Z"), Instant.parse("2025-03-01T00:00:00Z"));

        when(tenantService.createTenant(any(TenantDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/tenants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(incoming)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("/api/v1/tenants/t-nuevo-slug")))
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.slug", is("nuevo-slug")))
            .andExpect(jsonPath("$.tenantId", is("t-nuevo-slug")));
    }

    // @Test
    //     @DisplayName("PUT /api/v1/tenants/{tenantId} -> 200 y objeto JSON actualizado")
    // void updateTenant_ok() throws Exception {
    //             var patch   = new TenantDTO(null, "region-valle", "inactive", null, null);
    //             var updated = new TenantDTO("tenant-123", "region-valle", "inactive",
    //             Instant.parse("2025-01-01T00:00:00Z"), Instant.parse("2025-04-01T00:00:00Z"));

    //             when(tenantService.updateTenant(eq("tenant-123"), any(TenantDTO.class))).thenReturn(updated);

    //             mockMvc.perform(put("/api/v1/tenants/{tenantId}", "tenant-123")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(patch)))
    //         .andExpect(status().isOk())
    //         .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
    //         .andExpect(jsonPath("$.status", is("inactive")));
    // }

    @Test
        @DisplayName("DELETE /api/v1/tenants/{tenantId} -> 204")
    void deleteTenant_noContent() throws Exception {
                doNothing().when(tenantService).deleteTenant("tenant-xyz");

                mockMvc.perform(delete("/api/v1/tenants/{tenantId}", "tenant-xyz"))
            .andExpect(status().isNoContent());
    }
}
