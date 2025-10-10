package uao.edu.co.scouts_project.web.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import uao.edu.co.scouts_project.domain.dto.auth0.*;
import uao.edu.co.scouts_project.domain.exception.auth0.*;
import uao.edu.co.scouts_project.service.auth0.IAuth0Service;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = Auth0Controller.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, OAuth2ClientAutoConfiguration.class, OAuth2ResourceServerAutoConfiguration.class})
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class Auth0ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IAuth0Service auth0Service;

    private UserSummaryDTO mockUser;
    private RoleSummaryDTO mockRole;
    private OrganizationSummaryDTO mockOrg;

    @BeforeEach
    void setup() {
        mockUser = new UserSummaryDTO("user123", "test@uao.edu.co", "tester");
        mockRole = new RoleSummaryDTO("role123", "Admin", "Administrador global");
        mockOrg = new OrganizationSummaryDTO("org1", "Scouts", "Scouts UAO");
    }

    // ✅ Listar usuarios correctamente
    @Test
    void listUsers_ok() throws Exception {
        when(auth0Service.listUsers()).thenReturn(List.of(mockUser));

        mockMvc.perform(get("/api/v1/auth0/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value("user123"))
                .andExpect(jsonPath("$[0].email").value("test@uao.edu.co"));
    }

    // ❌ Error al listar usuarios
    @Test
    void listUsers_gatewayError() throws Exception {
        when(auth0Service.listUsers()).thenThrow(new Auth0GatewayException("Error externo"));

        mockMvc.perform(get("/api/v1/auth0/users"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.message").value("Fallo listando usuarios"))
                .andExpect(jsonPath("$.detail").value("Error externo"));
    }

    // ✅ Obtener usuario por ID
    @Test
    void getUserById_ok() throws Exception {
        when(auth0Service.getUserById("user123")).thenReturn(mockUser);

        mockMvc.perform(get("/api/v1/auth0/users/user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("tester"));
    }

    // ✅ Listar roles
    @Test
    void listRoles_ok() throws Exception {
        when(auth0Service.listRoles()).thenReturn(List.of(mockRole));

        mockMvc.perform(get("/api/v1/auth0/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("role123"))
                .andExpect(jsonPath("$[0].name").value("Admin"));
    }

    // ✅ Listar organizaciones
    @Test
    void listOrganizations_ok() throws Exception {
        when(auth0Service.listOrganizations()).thenReturn(List.of(mockOrg));

        mockMvc.perform(get("/api/v1/auth0/organizations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Scouts"));
    }

    // ✅ Asignar rol a usuario
    @Test
    void assignRole_ok() throws Exception {
        doNothing().when(auth0Service).assignRole("user123", "role123");

        mockMvc.perform(post("/api/v1/auth0/users/user123/roles")
                .param("roleId", "role123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Rol asignado correctamente"));
    }

    // ❌ Faltó roleId → 400
    @Test
    void assignRole_badRequest() throws Exception {
        mockMvc.perform(post("/api/v1/auth0/users/user123/roles"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("roleId es obligatorio"));
    }

    // ✅ Agregar usuario a organización
    @Test
    void addUserToOrganization_ok() throws Exception {
        doNothing().when(auth0Service).addUserToOrganization("org1", "user123");

        mockMvc.perform(post("/api/v1/auth0/organizations/org1/members")
                .param("userId", "user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario agregado a la organización"));
    }

    // ❌ Usuario ya pertenece a la organización
    @Test
    void addUserToOrganization_conflict() throws Exception {
        doThrow(new UserAlreadyMemberException("user123", "org1"))
                .when(auth0Service).addUserToOrganization("org1", "user123");

        mockMvc.perform(post("/api/v1/auth0/organizations/org1/members")
                .param("userId", "user123"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El usuario ya pertenece a la organización"));
    }

    // ✅ Crear usuario correctamente
    @Test
    void createUser_ok() throws Exception {
        CreateUserCommandDTO req = new CreateUserCommandDTO("test@uao.edu.co", "Password123!", "tester");
        CreatedUserDTO created = new CreatedUserDTO("user123", "test@uao.edu.co", "tester", false);

        when(auth0Service.createUser(any(CreateUserCommandDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/auth0/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                                "email":"test@uao.edu.co",
                                "password":"Password123!",
                                "username":"tester"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@uao.edu.co"));
    }

    // ❌ Error desde Auth0 al crear usuario
    @Test
    void createUser_gatewayError() throws Exception {
        when(auth0Service.createUser(any())).thenThrow(new Auth0GatewayException("Error de Auth0"));

        mockMvc.perform(post("/api/v1/auth0/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                                "email":"test@uao.edu.co",
                                "password":"Password123!",
                                "username":"tester"
                            }
                        """))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.message").value("Fallo creando usuario"));
    }
}
