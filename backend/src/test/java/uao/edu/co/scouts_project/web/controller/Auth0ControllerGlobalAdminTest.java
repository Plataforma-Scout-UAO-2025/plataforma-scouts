package uao.edu.co.scouts_project.web.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.application.service.IAuth0Service;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = Auth0Controller.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = uao.edu.co.scouts_project.common.tenant.TenantFilter.class)
)
@AutoConfigureMockMvc(addFilters = false) // deshabilita filtros de seguridad para centrarnos en el mapeo del controlador
class Auth0ControllerGlobalAdminTest {

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
    @DisplayName("Crear usuario con rol ADMIN_GRUPO debe dar 403 (rol administrativo no permitido)")
    void crearUsuarioConRolAdminGrupo_forbidden() throws Exception {
        doThrow(new UnauthorizedRoleAssignmentException("No está autorizado para asignar roles administrativos"))
                .when(auth0Service).createUserWithRole(any(CreateUserWithRoleCommandDTO.class));

        String body = "{\n" +
                "  \"email\": \"test@example.com\",\n" +
                "  \"password\": \"Passw0rd!\",\n" +
                "  \"username\": \"testuser\",\n" +
                "  \"role\": \"ADMIN_GRUPO\"\n" +
                "}";

        mockMvc.perform(post("/api/v1/auth0/create-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Crear usuario con rol inexistente debe dar 400 (rol inválido)")
    void crearUsuarioConRolInexistente_badRequest() throws Exception {
        doThrow(new IllegalArgumentException("Rol inválido: NOT_A_ROLE. Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"))
                .when(auth0Service).createUserWithRole(any(CreateUserWithRoleCommandDTO.class));

        String body = "{\n" +
                "  \"email\": \"test@example.com\",\n" +
                "  \"password\": \"Passw0rd!\",\n" +
                "  \"username\": \"testuser\",\n" +
                "  \"role\": \"NOT_A_ROLE\"\n" +
                "}";

        mockMvc.perform(post("/api/v1/auth0/create-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Crear usuario en organización no existente debe dar 404")
    void crearUsuarioConOrganizacionNoExiste_notFound() throws Exception {
        doThrow(new ResourceNotFoundException("Organización no encontrada"))
                .when(auth0Service).createUserWithRole(any(CreateUserWithRoleCommandDTO.class));

        String body = "{\n" +
                "  \"email\": \"test@example.com\",\n" +
                "  \"password\": \"Passw0rd!\",\n" +
                "  \"username\": \"testuser\",\n" +
                "  \"role\": \"SCOUT\"\n" +
                "}";

        mockMvc.perform(post("/api/v1/auth0/create-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Cambiar rol global con organizationId inexistente debe dar 400 (bad request)")
    void cambiarRolGlobal_organizacionNoExiste_badRequest() throws Exception {
        doThrow(new IllegalArgumentException("La organización especificada no existe o el usuario no pertenece a ella"))
                .when(auth0Service).changeUserRoleGlobal(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|68f16cb2600ee5a6d8d37c0a\",\n" +
                "  \"newRole\": \"SCOUTER\",\n" +
                "  \"organizationId\": \"org_no_existe\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role-global")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Cambiar rol global cuando el usuario no pertenece a la organización debe dar 400")
    void cambiarRolGlobal_usuarioNoPerteneceOrganizacion_badRequest() throws Exception {
        doThrow(new IllegalArgumentException("La organización especificada no existe o el usuario no pertenece a ella"))
                .when(auth0Service).changeUserRoleGlobal(any());

        String body = "{\n" +
                "  \"user_id\": \"auth0|68f16cb2600ee5a6d8d37c0a\",\n" +
                "  \"newRole\": \"SCOUTER\",\n" +
                "  \"organizationId\": \"org_existente_pero_sin_membresia\"\n" +
                "}";

        mockMvc.perform(put("/api/v1/auth0/change-role-global")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
