package uao.edu.co.scouts_project.organigrama.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;
import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.service.TenantService;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@WebMvcTest(controllers = TenantController.class)
@AutoConfigureMockMvc(addFilters = false)
class TenantControllerTest {

    // --- Infra que tu app espera en el contexto (mockeada para el slice MVC) ---
    @MockitoBean
    private TenantFilter tenantFilter;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private TenantService tenantService;

    // --- MVC / JSON helpers ---
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static final String BASE = "/api/v1/tenants";

    // --- Proveedor de Bean Validation para evitar 500 en @WebMvcTest (slice) ---
    @TestConfiguration
    static class ValidationConfig {
        @Bean @Primary
        LocalValidatorFactoryBean validator() {
            return new LocalValidatorFactoryBean();
        }
    }

    // ----------------- Helpers -----------------
    private TenantDTO dto(String id, String slug, String status) {
        // Ajusta al constructor real de tu TenantDTO: (id, slug, status, createdAt, updatedAt)
        return new TenantDTO(id, slug, status, Instant.now(), Instant.now());
    }

    private String jsonCreate(String slug, String status) throws Exception {
        return objectMapper.writeValueAsString(new TenantDTO(null, slug, status, null, null));
    }

    private String jsonUpdate(String status) throws Exception {
        // según tu API, puedes permitir cambiar status (y/o slug). Aquí solo status.
        return objectMapper.writeValueAsString(new TenantDTO(null, null, status, null, null));
    }

    // ----------------- GET /tenants -----------------
    @Test
    @DisplayName("GET /tenants — 200 con lista de tenants")
    void shouldListTenants() throws Exception {
        when(tenantService.getAllTenants())
            .thenReturn(java.util.List.of(dto("1", "region-valle", "active")));

        mockMvc.perform(get(BASE))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$[0].tenantId").value("1"))
            .andExpect(jsonPath("$[0].slug").value("region-valle"))
            .andExpect(jsonPath("$[0].status").value("active"));

        verify(tenantService).getAllTenants();
    }

    // ----------------- GET /tenants/{slug} -----------------
    @Test
    @DisplayName("GET /tenants/{slug} — 200 cuando existe")
    void shouldGetTenantBySlug() throws Exception {
        when(tenantService.getTenantBySlug("region-valle"))
            .thenReturn(dto("1", "region-valle", "active"));

        mockMvc.perform(get(BASE + "/{tenantSlug}", "region-valle"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tenantId").value("1"))
            .andExpect(jsonPath("$.slug").value("region-valle"))
            .andExpect(jsonPath("$.status").value("active"));

        verify(tenantService).getTenantBySlug("region-valle");
    }

    @Test
    @DisplayName("GET /tenants/{slug} — 404 cuando no existe")
    void shouldReturn404WhenTenantNotFound() throws Exception {
        when(tenantService.getTenantBySlug("no-existe"))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        mockMvc.perform(get(BASE + "/{tenantSlug}", "no-existe"))
            .andExpect(status().isNotFound());

        verify(tenantService).getTenantBySlug("no-existe");
    }

    // ----------------- POST /tenants -----------------
    @Test
    @DisplayName("POST /tenants — 201 Created con Location y cuerpo")
    void shouldCreateTenant() throws Exception {
        TenantDTO created = dto("10", "region-cauca", "active");
        when(tenantService.createTenant(any(TenantDTO.class))).thenReturn(created);

        mockMvc.perform(post(BASE)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonCreate("region-cauca", "active")))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", BASE + "/region-cauca"))
            .andExpect(jsonPath("$.tenantId").value(10L))
            .andExpect(jsonPath("$.slug").value("region-cauca"))
            .andExpect(jsonPath("$.status").value("active"));

        verify(tenantService).createTenant(any(TenantDTO.class));
    }

    @Test
    @DisplayName("POST /tenants — 409 Conflict si el slug ya existe")
    void shouldReturn409WhenSlugAlreadyExists() throws Exception {
        when(tenantService.createTenant(any(TenantDTO.class)))
            .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Slug duplicado"));

        mockMvc.perform(post(BASE)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonCreate("region-valle", "active")))
            .andExpect(status().isConflict());

        verify(tenantService).createTenant(any(TenantDTO.class));
    }

    @Test
    @DisplayName("POST /tenants — 400 Bad Request si el payload es inválido (slug en blanco)")
    void shouldReturn400OnCreateValidationError() throws Exception {
        // provoca error de validación de @NotBlank en slug
        String body = jsonCreate("   ", "active");

        mockMvc.perform(post(BASE)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest());

        verify(tenantService, never()).createTenant(any(TenantDTO.class));
    }

    // ----------------- PUT /tenants/{slug} -----------------
    @Test
    @DisplayName("PUT /tenants/{slug} — 200 con el tenant actualizado")
    void shouldUpdateTenant() throws Exception {
        when(tenantService.updateTenant(eq("region-valle"), any(TenantDTO.class)))
            .thenReturn(dto("1", "region-valle", "inactive"));

        mockMvc.perform(put(BASE + "/{tenantSlug}", "region-valle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonUpdate("inactive")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("region-valle"))
            .andExpect(jsonPath("$.status").value("inactive"));

        verify(tenantService).updateTenant(eq("region-valle"), any(TenantDTO.class));
    }

    @Test
    @DisplayName("PUT /tenants/{slug} — 404 si no existe")
    void shouldReturn404OnUpdateNotFound() throws Exception {
        when(tenantService.updateTenant(eq("no-existe"), any(TenantDTO.class)))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe"));

        mockMvc.perform(put(BASE + "/{tenantSlug}", "no-existe")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonUpdate("inactive")))
            .andExpect(status().isNotFound());

        verify(tenantService).updateTenant(eq("no-existe"), any(TenantDTO.class));
    }

    // ----------------- DELETE /tenants/{slug} -----------------
    @Test
    @DisplayName("DELETE /tenants/{slug} — 204 No Content")
    void shouldDeleteTenant() throws Exception {
        doNothing().when(tenantService).deleteTenant("region-valle");

        mockMvc.perform(delete(BASE + "/{tenantSlug}", "region-valle"))
            .andExpect(status().isNoContent());

        verify(tenantService).deleteTenant("region-valle");
    }

    @Test
    @DisplayName("DELETE /tenants/{slug} — 404 si no existe")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(tenantService).deleteTenant("no-existe");

        mockMvc.perform(delete(BASE + "/{tenantSlug}", "no-existe"))
            .andExpect(status().isNotFound());

        verify(tenantService).deleteTenant("no-existe");
    }
}
