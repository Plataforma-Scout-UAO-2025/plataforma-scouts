package uao.edu.co.scouts_project.organigrama.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.service.TenantService;


import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas unitarias para TenantController usando @WebMvcTest.
 * Solo se carga la capa web (controlador) y se mockean las dependencias (servicios).
 */

import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;

@ActiveProfiles("test")
@WebMvcTest(controllers = TenantController.class)
@AutoConfigureMockMvc(addFilters = false)
class TestTenantControllerTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private TenantFilter tenantFilter;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TenantService tenantService;



    @Nested
    @DisplayName("GET /api/v1/tenants")
    class GetAllTenantsTests {

        @Test
        @DisplayName("Debe retornar lista de tenants con status 200")
        void shouldReturnTenantsList() throws Exception {
            // Given
            List<TenantDTO> tenants = List.of(
                new TenantDTO(1L, "region-valle", "active", null, null),
                new TenantDTO(2L, "region-cauca", "active", null, null)
            );
            when(tenantService.getAllTenants()).thenReturn(tenants);

            // When & Then
            mockMvc.perform(get("/api/v1/tenants"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].slug").value("region-valle"))
                .andExpect(jsonPath("$[1].slug").value("region-cauca"));

            verify(tenantService, times(1)).getAllTenants();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay tenants")
        void shouldReturnEmptyListWhenNoTenants() throws Exception {
            // Given
            when(tenantService.getAllTenants()).thenReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/v1/tenants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

            verify(tenantService, times(1)).getAllTenants();
        }
    }

    @Nested
    @DisplayName("GET /api/v1/tenants/{tenantSlug}")
    class GetTenantBySlugTests {

        @Test
        @DisplayName("Debe retornar tenant cuando existe")
        void shouldReturnTenantWhenExists() throws Exception {
            // Given
            TenantDTO tenant = new TenantDTO(1L, "region-valle", "active", null, null);
            when(tenantService.getTenantBySlug("region-valle")).thenReturn(tenant);

            // When & Then
            mockMvc.perform(get("/api/v1/tenants/region-valle"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.slug").value("region-valle"))
                .andExpect(jsonPath("$.status").value("active"));

            verify(tenantService, times(1)).getTenantBySlug("region-valle");
        }

        @Test
        @DisplayName("Debe retornar 404 cuando tenant no existe")
        void shouldReturn404WhenTenantNotFound() throws Exception {
            // Given
            when(tenantService.getTenantBySlug("no-existe"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

            // When & Then
            mockMvc.perform(get("/api/v1/tenants/no-existe"))
                .andExpect(status().isNotFound());

            verify(tenantService, times(1)).getTenantBySlug("no-existe");
        }
    }

    @Nested
    @DisplayName("POST /api/v1/tenants")
    class CreateTenantTests {

        @Test
        @DisplayName("Debe crear tenant con datos válidos y retornar 201")
        void shouldCreateTenantWithValidData() throws Exception {
            // Given
            TenantDTO inputDto = new TenantDTO(null, "region-valle", "active", null, null);
            TenantDTO createdDto = new TenantDTO(1L, "region-valle", "active", null, null);
            when(tenantService.createTenant(any(TenantDTO.class))).thenReturn(createdDto);

            // When & Then
            mockMvc.perform(post("/api/v1/tenants")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/tenants/region-valle"))
                .andExpect(jsonPath("$.slug").value("region-valle"))
                .andExpect(jsonPath("$.status").value("active"));

            verify(tenantService, times(1)).createTenant(any(TenantDTO.class));
        }

        @Test
        @DisplayName("Debe retornar 409 cuando slug ya existe")
        void shouldReturn409WhenSlugAlreadyExists() throws Exception {
            // Given
            TenantDTO inputDto = new TenantDTO(null, "region-valle", "active", null, null);
            when(tenantService.createTenant(any(TenantDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya existe"));

            // When & Then
            mockMvc.perform(post("/api/v1/tenants")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isConflict());

            verify(tenantService, times(1)).createTenant(any(TenantDTO.class));
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/tenants/{tenantSlug}")
    class UpdateTenantTests {

        @Test
        @DisplayName("Debe actualizar tenant existente y retornar 200")
        void shouldUpdateExistingTenant() throws Exception {
            // Given
            TenantDTO inputDto = new TenantDTO(1L, "region-valle", "active", null, null);
            TenantDTO updatedDto = new TenantDTO(1L, "region-valle", "active", null, null);
            when(tenantService.updateTenant(eq("region-valle"), any(TenantDTO.class))).thenReturn(updatedDto);

            // When & Then
            mockMvc.perform(put("/api/v1/tenants/region-valle")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("region-valle"))
                .andExpect(jsonPath("$.status").value("active"));

            verify(tenantService, times(1)).updateTenant(eq("region-valle"), any(TenantDTO.class));
        }

        @Test
        @DisplayName("Debe retornar 404 cuando tenant no existe")
        void shouldReturn404WhenTenantNotFound() throws Exception {
            // Given
            TenantDTO inputDto = new TenantDTO(null, "no-existe", "active", null, null);
            when(tenantService.updateTenant(eq("no-existe"), any(TenantDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

            // When & Then
            mockMvc.perform(put("/api/v1/tenants/no-existe")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isNotFound());

            verify(tenantService, times(1)).updateTenant(eq("no-existe"), any(TenantDTO.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/tenants/{tenantSlug}")
    class DeleteTenantTests {

        @Test
        @DisplayName("Debe eliminar tenant existente y retornar 204")
        void shouldDeleteExistingTenant() throws Exception {
            // Given
            doNothing().when(tenantService).deleteTenant("region-valle");

            // When & Then
            mockMvc.perform(delete("/api/v1/tenants/region-valle"))
                .andExpect(status().isNoContent());

            verify(tenantService, times(1)).deleteTenant("region-valle");
        }

        @Test
        @DisplayName("Debe retornar 404 cuando tenant no existe")
        void shouldReturn404WhenTenantNotFound() throws Exception {
            // Given
            doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"))
                .when(tenantService).deleteTenant("no-existe");

            // When & Then
            mockMvc.perform(delete("/api/v1/tenants/no-existe"))
                .andExpect(status().isNotFound());

            verify(tenantService, times(1)).deleteTenant("no-existe");
        }
    }
}
