package uao.edu.co.scouts_project.web.controller;

import org.junit.jupiter.api.DisplayName;
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
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = Auth0Controller.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = uao.edu.co.scouts_project.common.tenant.TenantFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class Auth0ControllerGroupAdminTest {

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

    @Test
    @DisplayName("[ADMIN_GRUPO] Cambiar de SCOUT a SCOUTER -> 200 OK")
    void cambiarScoutAScouter_ok() throws Exception {
        String body = "{\n" +
                "  \"user_id\": \"auth0|user123\",\n" +
                "  \"newRole\": \"SCOUTER\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Rol cambiado exitosamente"));
    }

    @Test
    @DisplayName("[ADMIN_GRUPO] Cambiar de SCOUT a ADMIN_GRUPO -> 403 Forbidden")
    void cambiarScoutAAdminGrupo_forbidden() throws Exception {
        doThrow(new UnauthorizedRoleAssignmentException("No está autorizado para asignar roles administrativos"))
                .when(auth0Service).changeUserRole(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|user123\",\n" +
                "  \"newRole\": \"ADMIN_GRUPO\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("[ADMIN_GRUPO] Cambiar de SCOUT a SCOUTER a un usuario fuera de la organización -> 400 Bad Request")
    void cambiarScoutAScouter_usuarioFueraOrg_badRequest() throws Exception {
        doThrow(new IllegalArgumentException("La organización especificada no existe o el usuario no pertenece a ella"))
                .when(auth0Service).changeUserRole(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|noMember\",\n" +
                "  \"newRole\": \"SCOUTER\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("[ADMIN_GRUPO] Cambiar mi propio rol -> 403 Forbidden")
    void cambiarMiPropioRol_forbidden() throws Exception {
        doThrow(new UnauthorizedRoleAssignmentException("No está autorizado para cambiar su propio rol"))
                .when(auth0Service).changeUserRole(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|self\",\n" +
                "  \"newRole\": \"SCOUTER\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("[ADMIN_GRUPO] Cambiar a un rol inválido -> 400 Bad Request")
    void cambiarRolInvalido_badRequest() throws Exception {
        doThrow(new IllegalArgumentException("Rol inválido: NOT_A_ROLE. Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"))
                .when(auth0Service).changeUserRole(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|user123\",\n" +
                "  \"newRole\": \"NOT_A_ROLE\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
