package uao.edu.co.scouts_project.web.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.application.service.IAuth0Service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = Auth0Controller.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = uao.edu.co.scouts_project.common.tenant.TenantFilter.class)
)
@AutoConfigureMockMvc // security filters enabled by default
@Disabled("Disabled: this WebMvc slice doesn't load the application's SecurityFilterChain; prefer integration tests instead.")
class Auth0ControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IAuth0Service auth0Service;

    @TestConfiguration
    static class MockConfig {
        @Bean
        IAuth0Service auth0Service() {
            return org.mockito.Mockito.mock(IAuth0Service.class);
        }
    }

    private static String changeRoleBody(String userId, String role) {
        return "{\n" +
                "  \"user_id\": \"" + userId + "\",\n" +
                "  \"newRole\": \"" + role + "\"\n" +
                "}";
    }

    @Test
    @DisplayName("Security: ADMIN_GRUPO puede cambiar rol en /change-role -> 200")
    void adminGrupo_can_changeRole() throws Exception {
        doNothing().when(auth0Service).changeUserRole(any());

        mockMvc.perform(put("/api/v1/auth0/change-role")
                .with(user("admin-grupo").roles("ADMIN_GRUPO"))
        .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(changeRoleBody("auth0|u1", "SCOUTER")))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Security: Usuario sin rol requerido no puede cambiar rol -> 403")
    void nonAdminGrupo_forbidden_on_changeRole() throws Exception {
        mockMvc.perform(put("/api/v1/auth0/change-role")
                .with(user("scouter").roles("SCOUTER"))
        .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(changeRoleBody("auth0|u1", "SCOUTER")))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: ADMIN_GLOBAL no puede usar /change-role (solo ADMIN_GRUPO) -> 403")
    void adminGlobal_forbidden_on_group_endpoint() throws Exception {
        mockMvc.perform(put("/api/v1/auth0/change-role")
                .with(user("admin-global").roles("ADMIN_GLOBAL"))
        .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(changeRoleBody("auth0|u1", "SCOUTER")))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: ADMIN_GLOBAL puede usar /change-role-global -> 200")
    void adminGlobal_can_changeRoleGlobal() throws Exception {
        doNothing().when(auth0Service).changeUserRoleGlobal(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|u1\",\n" +
                "  \"newRole\": \"SCOUTER\",\n" +
                "  \"organizationId\": \"org_X\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role-global")
                .with(user("admin-global").roles("ADMIN_GLOBAL"))
        .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Security: petición sin autenticación -> 401 en /change-role")
    void unauthenticated_401() throws Exception {
        mockMvc.perform(put("/api/v1/auth0/change-role")
        .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(changeRoleBody("auth0|u1", "SCOUTER")))
            .andExpect(status().isUnauthorized());
    }
}
