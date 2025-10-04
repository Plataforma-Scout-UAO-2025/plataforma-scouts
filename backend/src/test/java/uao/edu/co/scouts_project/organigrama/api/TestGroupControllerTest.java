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
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.GroupService;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
@WebMvcTest(controllers = GroupController.class)
@AutoConfigureMockMvc(addFilters = false)
class TestGroupControllerTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private TenantFilter tenantFilter;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private JdbcTemplate jdbcTemplate;

    private static final String TENANT = "region-valle";
    private static final String GROUP = "grupo-803";
    private static final String BASE = "/api/v1/tenants/{tenantSlug}/groups";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GroupService groupService;

    // ---------- Helpers ----------
    private GroupResponseDTO groupResponse(String slug, String name) {
        return new GroupResponseDTO(
                1L,                       // groupId
                10L,                      // tenantId
                slug,                     // slug
                name,                     // name
                "Distrito",               // district
                "ID-999",                 // identifierNumber
                "Calle 123",              // address
                "+57 300 000 0000",       // phone
                "grupo@correo.com",       // email
                LocalDate.of(2020,1,1),   // foundedIn
                "Siempre Listos",         // motto
                "Misión",                 // mission
                "Visión",                 // vision
                "Historia",               // history
                "https://cdn/logo.png",   // logoObjectUrl
                "https://cdn/scarf.png",  // scarfObjectUrl
                Map.of(),                 // socialLinks
                Map.of(),                 // config
                true,                     // isActive
                "active",                 // status
                LocalDateTime.now(),      // createdAt
                LocalDateTime.now()       // updatedAt
        );
    }

    private GroupDTO groupDTO(String slug, String name) {
        return new GroupDTO(
                null,                     // groupId
                null,                     // tenantId
                slug,                     // slug (required)
                name,                     // name (required)
                "Distrito",               // district
                "ID-999",                 // identifierNumber
                "Calle 123",              // address
                "+57 300 000 0000",       // phone
                "grupo@correo.com",       // email
                LocalDate.of(2020,1,1),   // foundedIn
                "Siempre Listos",         // motto
                "Misión",                 // mission
                "Visión",                 // vision
                "Historia",               // history
                null,                     // logoObjectId
                null,                     // scarfObjectId
                Map.of(),                 // socialLinks
                Map.of(),                 // config
                true,                     // isActive
                "active",                 // status
                null,                     // createdAt
                null                      // updatedAt
        );
    }

    // ---------- GET /tenants/{tenantSlug}/groups ----------
    @Test
    @DisplayName("GET /groups — debe devolver 200 con la lista de grupos")
    void shouldListGroupsByTenant() throws Exception {
        when(groupService.getGroupsByTenant(TENANT))
                .thenReturn(List.of(groupResponse(GROUP, "Grupo 803")));

        mockMvc.perform(get(BASE, TENANT))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].slug").value(GROUP))
                .andExpect(jsonPath("$[0].name").value("Grupo 803"));

        verify(groupService, times(1)).getGroupsByTenant(TENANT);
    }

    @Test
    @DisplayName("GET /groups — debe devolver 200 con lista vacía cuando no hay grupos")
    void shouldReturnEmptyListWhenNoGroups() throws Exception {
        when(groupService.getGroupsByTenant(TENANT)).thenReturn(List.of());

        mockMvc.perform(get(BASE, TENANT))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(groupService).getGroupsByTenant(TENANT);
    }

    // ---------- GET /tenants/{tenantSlug}/groups/{groupSlug} ----------
    @Test
    @DisplayName("GET /groups/{slug} — debe devolver 200 con el grupo")
    void shouldGetGroupBySlug() throws Exception {
        when(groupService.getGroupBySlug(TENANT, GROUP))
                .thenReturn(groupResponse(GROUP, "Grupo 803"));

        mockMvc.perform(get(BASE + "/{groupSlug}", TENANT, GROUP))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(GROUP))
                .andExpect(jsonPath("$.name").value("Grupo 803"));

        verify(groupService).getGroupBySlug(TENANT, GROUP);
    }

    @Test
    @DisplayName("GET /groups/{slug} — debe devolver 404 cuando no existe")
    void shouldReturn404WhenGroupNotFound() throws Exception {
        when(groupService.getGroupBySlug(TENANT, GROUP))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo no encontrado"));

        mockMvc.perform(get(BASE + "/{groupSlug}", TENANT, GROUP))
                .andExpect(status().isNotFound());

        verify(groupService).getGroupBySlug(TENANT, GROUP);
    }

    // ---------- POST /tenants/{tenantSlug}/groups ----------
    @Test
    @DisplayName("POST /groups — debe crear y devolver 201 con Location")
    void shouldCreateGroup() throws Exception {
        GroupDTO payload = groupDTO(GROUP, "Grupo 803");
        GroupResponseDTO created = groupResponse(GROUP, "Grupo 803");

        when(groupService.createGroup(eq(TENANT), any(GroupDTO.class)))
                .thenReturn(created);

        mockMvc.perform(
                        post(BASE, TENANT)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/v1/tenants/" + TENANT + "/groups/" + GROUP))
                .andExpect(jsonPath("$.slug").value(GROUP));

        verify(groupService, times(1)).createGroup(eq(TENANT), any(GroupDTO.class));
    }

    @Test
    @DisplayName("POST /groups — debe devolver 409 si hay conflicto (slug o identificador duplicado)")
    void shouldReturn409OnConflict() throws Exception {
        when(groupService.createGroup(eq(TENANT), any(GroupDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Duplicado"));

        mockMvc.perform(
                        post(BASE, TENANT)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(groupDTO(GROUP, "G")))
                )
                .andExpect(status().isConflict());

        verify(groupService).createGroup(eq(TENANT), any(GroupDTO.class));
    }

    @Test
    @DisplayName("POST /groups — debe devolver 400 si el payload es inválido")
    void shouldReturn400OnValidationErrors() throws Exception {
        // slug y name son @NotBlank
        String invalidJson = """
            { "slug": "  ", "name": "" }
        """;

        mockMvc.perform(
                        post(BASE, TENANT)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson)
                )
                .andExpect(status().isBadRequest());
        // No llega a invocar el servicio cuando falla la validación
        verify(groupService, times(0)).createGroup(anyString(), any(GroupDTO.class));
    }

    // ---------- PUT /tenants/{tenantSlug}/groups/{groupSlug} ----------
    @Test
    @DisplayName("PUT /groups/{slug} — debe actualizar y devolver 200 con el grupo")
    void shouldUpdateGroup() throws Exception {
        GroupDTO payload = groupDTO(GROUP, "Grupo 803 (editado)");
        GroupResponseDTO updated = groupResponse(GROUP, "Grupo 803 (editado)");

        when(groupService.updateGroup(eq(TENANT), eq(GROUP), any(GroupDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(
                        put(BASE + "/{groupSlug}", TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Grupo 803 (editado)"));

        verify(groupService).updateGroup(eq(TENANT), eq(GROUP), any(GroupDTO.class));
    }

    @Test
    @DisplayName("PUT /groups/{slug} — debe devolver 404 si el grupo no existe")
    void shouldReturn404OnUpdateWhenNotFound() throws Exception {
        when(groupService.updateGroup(eq(TENANT), eq(GROUP), any(GroupDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(
                        put(BASE + "/{groupSlug}", TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(groupDTO(GROUP, "X")))
                )
                .andExpect(status().isNotFound());

        verify(groupService).updateGroup(eq(TENANT), eq(GROUP), any(GroupDTO.class));
    }

    // ---------- DELETE /tenants/{tenantSlug}/groups/{groupSlug} ----------
    @Test
    @DisplayName("DELETE /groups/{slug} — debe devolver 204")
    void shouldDeleteGroup() throws Exception {
        doNothing().when(groupService).deleteGroup(TENANT, GROUP);

        mockMvc.perform(delete(BASE + "/{groupSlug}", TENANT, GROUP))
                .andExpect(status().isNoContent());

        verify(groupService).deleteGroup(TENANT, GROUP);
    }

    @Test
    @DisplayName("DELETE /groups/{slug} — debe devolver 404 si no existe")
    void shouldReturn404OnDeleteWhenNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
                .when(groupService).deleteGroup(TENANT, GROUP);

        mockMvc.perform(delete(BASE + "/{groupSlug}", TENANT, GROUP))
                .andExpect(status().isNotFound());

        verify(groupService).deleteGroup(TENANT, GROUP);
    }

    // ---------- DELETE logo / scarf ----------
    @Test
    @DisplayName("DELETE /groups/{slug}/logo — debe devolver 204")
    void shouldDeleteLogo() throws Exception {
        doNothing().when(groupService).deleteLogoImage(TENANT, GROUP);

        mockMvc.perform(delete(BASE + "/{groupSlug}/logo", TENANT, GROUP))
                .andExpect(status().isNoContent());

        verify(groupService).deleteLogoImage(TENANT, GROUP);
    }

    @Test
    @DisplayName("DELETE /groups/{slug}/scarf — debe devolver 204")
    void shouldDeleteScarf() throws Exception {
        doNothing().when(groupService).deleteScarfImage(TENANT, GROUP);

        mockMvc.perform(delete(BASE + "/{groupSlug}/scarf", TENANT, GROUP))
                .andExpect(status().isNoContent());

        verify(groupService).deleteScarfImage(TENANT, GROUP);
    }

    // ---------- PATCH logo / scarf ----------
    @Test
    @DisplayName("PATCH /groups/{slug}/logo — debe devolver 204 con UUID válido")
    void shouldUpdateLogo() throws Exception {
        doNothing().when(groupService).updateLogo(eq(TENANT), eq(GROUP), any(UUID.class));

        String body = """
            { "objectId": "%s" }
            """.formatted(UUID.randomUUID());

        mockMvc.perform(
                        patch(BASE + "/{groupSlug}/logo", TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(groupService).updateLogo(eq(TENANT), eq(GROUP), any(UUID.class));
    }

    @Test
    @DisplayName("PATCH /groups/{slug}/scarf — debe devolver 204 con UUID válido")
    void shouldUpdateScarf() throws Exception {
        doNothing().when(groupService).updateScarf(eq(TENANT), eq(GROUP), any(UUID.class));

        String body = """
            { "objectId": "%s" }
            """.formatted(UUID.randomUUID());

        mockMvc.perform(
                        patch(BASE + "/{groupSlug}/scarf", TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isNoContent());

        verify(groupService).updateScarf(eq(TENANT), eq(GROUP), any(UUID.class));
    }

    @Test
    @DisplayName("PATCH /groups/{slug}/logo — debe devolver 400 si el UUID es inválido")
    void shouldReturn400WhenLogoUuidInvalid() throws Exception {
        String invalid = "{ \"objectId\": \"not-a-uuid\" }";

        mockMvc.perform(
                        patch(BASE + "/{groupSlug}/logo", TENANT, GROUP)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalid)
                )
                .andExpect(status().isBadRequest());

        verify(groupService, times(0)).updateLogo(anyString(), anyString(), any());
    }
}
