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
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.service.GroupService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GroupController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class GroupControllerTest {

    private static final String TENANT = "tenant-demo";
    private static final String GROUP = "centinelas-113";
    private static final String BASE = "/api/v1/tenants/{tenantSlug}/groups";

    @Autowired
    MockMvc mvc;
    @Autowired
    ObjectMapper om;

    @MockitoBean
    TenantFilter tenantFilter;
    @MockitoBean
    GroupService groupService;
    @MockitoBean
    AuthoritiesMappingPort authoritiesMappingPort;

    private GroupResponseDTO sampleResponse() {
        return new GroupResponseDTO(
                1L, // groupId
                TENANT, // tenantId
                GROUP, // slug
                "Grupo Scout Centinelas 113", // name
                "Distrito Valle", // district
                "ID-803", // identifierNumber
                "Calle 123", // address
                "3001234567", // phone
                "grupo@example.com", // email
                LocalDate.of(1998, 1, 1), // foundedIn
                "Siempre Listos", // motto
                "Formar mejores ciudadanos", // mission
                "Ser ejemplo", // vision
                "Historia...", // history
                "https://cdn.url/logo.png", // logoObjectUrl
                "https://cdn.url/scarf.png", // scarfObjectUrl
                Map.<String, Object>of(), // socialLinks
                Map.<String, Object>of(), // config
                true, // isActive
                "ACTIVE", // status
                LocalDateTime.now(), // createdAt
                LocalDateTime.now() // updatedAt
        );
    }

    @Test
    @DisplayName("GET /groups → 200 y lista")
    void list_ok() throws Exception {
        when(groupService.getGroupsByTenant(eq(TENANT)))
                .thenReturn(List.of(sampleResponse()));

        mvc.perform(get(BASE, TENANT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value(GROUP))
                .andExpect(jsonPath("$[0].name").value("Grupo Scout Centinelas 113"));
    }

    @Test
    @DisplayName("GET /groups/{slug} → 200 y detalle")
    void get_ok() throws Exception {
        when(groupService.getGroupBySlug(eq(TENANT), eq(GROUP)))
                .thenReturn(sampleResponse());

        mvc.perform(get(BASE + "/{groupSlug}", TENANT, GROUP))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(GROUP))
                .andExpect(jsonPath("$.groupId").value(1L));
    }

    @Test
    @DisplayName("POST /groups → 201 Created + Location")
    void create_ok() throws Exception {
        // Constructor CANÓNICO del record GroupDTO (orden exacto)
        GroupDTO req = new GroupDTO(
                null, // groupId
                TENANT, // tenantId
                GROUP, // slug
                "Centinelas 113", // name
                null, // district
                null, // identifierNumber
                null, // address
                null, // phone
                null, // email
                null, // foundedIn
                null, // motto
                null, // mission
                null, // vision
                null, // history
                null, // logoObjectId (UUID)
                null, // scarfObjectId (UUID)
                Map.of(), // socialLinks
                Map.of(), // config
                Boolean.TRUE, // isActive
                "ACTIVE", // status
                null, // createdAt
                null // updatedAt
        );

        when(groupService.createGroupFull(any(GroupDTO.class), isNull()))
                .thenReturn(sampleResponse());

        mvc.perform(post(BASE, TENANT)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(req)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.slug").value(GROUP));
    }

    @Test
    @DisplayName("PUT /groups/{slug} → 200 OK")
    void update_ok() throws Exception {
        GroupDTO req = new GroupDTO(
                1L, // groupId
                TENANT,
                GROUP,
                "Grupo Scout Centinelas 113 (Actualizado)",
                null, // district
                null, // identifierNumber
                null, // address
                null, // phone
                null, // email
                null, // foundedIn
                null, // motto
                null, // mission
                null, // vision
                null, // history
                null, // logoObjectId (UUID)
                null, // scarfObjectId (UUID)
                Map.of(), // socialLinks
                Map.of(), // config
                Boolean.TRUE, // isActive
                "ACTIVE", // status
                null, // createdAt
                null // updatedAt
        );

        GroupResponseDTO updated = new GroupResponseDTO(
                1L, TENANT, GROUP, "Grupo Scout Centinelas 113 (Actualizado)",
                "Distrito Valle", "ID-803", "Calle 123", "3001234567", "grupo@example.com",
                LocalDate.of(1998, 1, 1),
                "Siempre Listos", "Formar mejores ciudadanos", "Ser ejemplo", "Historia...",
                "https://cdn.url/logo.png", "https://cdn.url/scarf.png",
                Map.<String, Object>of(), Map.<String, Object>of(), true, "ACTIVE",
                LocalDateTime.now(), LocalDateTime.now());

        when(groupService.updateGroup(eq(TENANT), eq(GROUP), any(GroupDTO.class)))
                .thenReturn(updated);

        mvc.perform(put(BASE + "/{groupSlug}", TENANT, GROUP)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Grupo Scout Centinelas 113 (Actualizado)"));
    }

    @Test
    @DisplayName("PATCH /groups/{slug}/logo → 204 No Content")
    void update_logo_ok() throws Exception {
        String body = "{\"objectId\":\"123e4567-e89b-12d3-a456-426614174000\"}";
        doNothing().when(groupService).updateLogo(eq(TENANT), eq(GROUP), any(UUID.class));

        mvc.perform(patch(BASE + "/{groupSlug}/logo", TENANT, GROUP)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /groups/{slug}/scarf → 204 No Content")
    void update_scarf_ok() throws Exception {
        String body = "{\"objectId\":\"123e4567-e89b-12d3-a456-426614174111\"}";
        doNothing().when(groupService).updateScarf(eq(TENANT), eq(GROUP), any(UUID.class));

        mvc.perform(patch(BASE + "/{groupSlug}/scarf", TENANT, GROUP)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /groups/{slug}/logo → 204 No Content")
    void delete_logo_ok() throws Exception {
        doNothing().when(groupService).deleteLogoImage(eq(TENANT), eq(GROUP));

        mvc.perform(delete(BASE + "/{groupSlug}/logo", TENANT, GROUP))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /groups/{slug}/scarf → 204 No Content")
    void delete_scarf_ok() throws Exception {
        doNothing().when(groupService).deleteScarfImage(eq(TENANT), eq(GROUP));

        mvc.perform(delete(BASE + "/{groupSlug}/scarf", TENANT, GROUP))
                .andExpect(status().isNoContent());
    }
}
