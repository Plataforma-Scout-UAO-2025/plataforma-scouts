package uao.edu.co.scouts_project.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uao.edu.co.scouts_project.application.service.IAuth0Service;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas unitarias completas para Auth0Controller usando standalone setup.
 * Cubre casos exitosos, validaciones y manejo de errores.
 * 
 * Nota: Usa MockMvcBuilders.standaloneSetup() en lugar de @WebMvcTest
 * debido a problemas de configuración del contexto de Spring que causaban
 * que los response bodies estuvieran vacíos.
 */
class Auth0ControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IAuth0Service auth0Service;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Auth0Controller controller = new Auth0Controller(auth0Service);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // ========== 1. Crear usuario (exitoso) ==========
    @Test
    void createUser_shouldReturn200_whenUserIsCreatedSuccessfully() throws Exception {
        // Arrange
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "test@example.com",
            "Password123!",
            "testuser"
        );
        CreatedUserDTO mockResponse = new CreatedUserDTO("auth0|123456", "test@example.com", "testuser", false);
        when(auth0Service.createUser(any(CreateUserCommandDTO.class))).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("auth0|123456"));
    }

    // ========== 2. Crear usuario con correo malo ==========
    @Test
    void createUser_shouldReturn400_whenEmailIsInvalid() throws Exception {
        // Arrange: Correo inválido
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "correo-invalido",  // No es un email válido
            "Password123!",
            "testuser"
        );

        // Act & Assert: Spring validation rechaza la petición
        mockMvc.perform(post("/api/v1/auth0/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    // ========== 3. Crear usuario con username malo ==========
    @Test
    void createUser_shouldReturn400_whenUsernameIsInvalid() throws Exception {
        // Arrange: Username vacío
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "test@example.com",
            "Password123!",
            ""  // Username vacío, no cumple con @NotBlank
        );

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    // ========== 4. Asignar usuario con rol inexistente ==========
    @Test
    void assignRoleToUser_shouldReturn404_whenRoleDoesNotExist() throws Exception {
        // Arrange: El servicio lanza excepción porque el rol no existe
        org.mockito.Mockito.doThrow(new ResourceNotFoundException("Role not found: rol_inexistente"))
            .when(auth0Service).assignRole(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles")
                .param("roleId", "rol_inexistente"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Role not found: rol_inexistente"));
    }

    // ========== 5. Asignar usuario a rol exitosamente ==========
    @Test
    void assignRoleToUser_shouldReturn200_whenRoleIsAssignedSuccessfully() throws Exception {
        // Arrange: El servicio no lanza excepciones (éxito)
        org.mockito.Mockito.doNothing().when(auth0Service).assignRole(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles")
                .param("roleId", "rol_valido123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Rol asignado correctamente"));
    }

    // ========== 6. Asignar usuario con rol nulo ==========
    @Test
    void assignRoleToUser_shouldReturn400_whenRoleIdIsNull() throws Exception {
        // Act & Assert: No se envía el parámetro roleId
        // Note: Standalone setup doesn't include @ControllerAdvice, so we only verify status
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles"))
            .andExpect(status().isBadRequest());
    }

    // ========== 7. Asignar a un usuario a una organización inexistente ==========
    @Test
    void addUserToOrganization_shouldReturn404_whenOrganizationDoesNotExist() throws Exception {
        // Arrange: El servicio lanza excepción porque la organización no existe
        org.mockito.Mockito.doThrow(new ResourceNotFoundException("Organization not found: org_inexistente"))
            .when(auth0Service).addUserToOrganization(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/organizations/org_inexistente/members")
                .param("userId", "auth0|123"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Organization not found: org_inexistente"));
    }

    // ========== 8. Asignar a un usuario que ya es miembro ==========
    @Test
    void addUserToOrganization_shouldReturn409_whenUserIsAlreadyMember() throws Exception {
        // Arrange: El servicio lanza excepción porque el usuario ya es miembro
        org.mockito.Mockito.doThrow(new UserAlreadyMemberException("User is already a member of this organization"))
            .when(auth0Service).addUserToOrganization(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/organizations/org_123/members")
                .param("userId", "auth0|123"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("El usuario ya pertenece a la organización"));
    }

    // ========== 9. Listar roles ==========
    @Test
    void listRoles_shouldReturn200_whenRolesExist() throws Exception {
        // Arrange
        List<RoleSummaryDTO> mockRoles = List.of(
            new RoleSummaryDTO("rol_admin", "Administrator", "Full access to the system"),
            new RoleSummaryDTO("rol_user", "User", "Limited access")
        );
        when(auth0Service.listRoles()).thenReturn(mockRoles);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth0/roles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].id").value("rol_admin"))
            .andExpect(jsonPath("$[1].id").value("rol_user"));
    }

    // ========== 10. Error de gateway real (Auth0 caído o timeout) ==========
    @Test
    void assignRoleToUser_shouldReturn502_whenAuth0GatewayFails() throws Exception {
        // Arrange: El servicio lanza excepción porque Auth0 está caído o hay timeout
        org.mockito.Mockito.doThrow(new Auth0GatewayException("Connection timeout", new RuntimeException("Timeout after 30s")))
            .when(auth0Service).assignRole(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles")
                .param("roleId", "rol_admin"))
            .andExpect(status().isBadGateway())
            .andExpect(jsonPath("$.message").value("Fallo asignando rol"))
            .andExpect(jsonPath("$.detail").value("Connection timeout"));
    }

    // ========== 11. GET /users - Listar usuarios ==========
    @Test
    void listUsers_shouldReturn200_whenUsersExist() throws Exception {
        // Arrange
        List<UserSummaryDTO> mockUsers = List.of(
            new UserSummaryDTO("auth0|user1", "user1@example.com", "user1"),
            new UserSummaryDTO("auth0|user2", "user2@example.com", "user2")
        );
        when(auth0Service.listUsers()).thenReturn(mockUsers);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth0/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].id").value("auth0|user1"))
            .andExpect(jsonPath("$[1].id").value("auth0|user2"));
    }

    // ========== 12. GET /organizations - Listar organizaciones ==========
    @Test
    void listOrganizations_shouldReturn200_whenOrganizationsExist() throws Exception {
        // Arrange
        List<OrganizationSummaryDTO> mockOrgs = List.of(
            new OrganizationSummaryDTO("org_123", "Organización Test 1", "Display Name 1"),
            new OrganizationSummaryDTO("org_456", "Organización Test 2", "Display Name 2")
        );
        when(auth0Service.listOrganizations()).thenReturn(mockOrgs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth0/organizations"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].id").value("org_123"))
            .andExpect(jsonPath("$[1].name").value("Organización Test 2"));
    }

    // ========== 13. GET /users/{userId} - Obtener usuario por ID exitoso ==========
    @Test
    void getUserById_shouldReturn200_whenUserExists() throws Exception {
        // Arrange
        UserSummaryDTO mockUser = new UserSummaryDTO("auth0|123", "test@example.com", "testuser");
        when(auth0Service.getUserById(anyString())).thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth0/users/auth0|123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("auth0|123"))
            .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    // ========== 14. GET /users/{userId} - Usuario no encontrado ==========
    @Test
    void getUserById_shouldReturn404_whenUserDoesNotExist() throws Exception {
        // Arrange
        when(auth0Service.getUserById(anyString()))
            .thenThrow(new ResourceNotFoundException("User not found: auth0|999"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/auth0/users/auth0|999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("User not found: auth0|999"));
    }

    // ========== 15. POST /users/{userId}/roles/by-name - Asignar rol por nombre exitoso ==========
    @Test
    void assignRoleByName_shouldReturn200_whenRoleIsAssignedSuccessfully() throws Exception {
        // Arrange
        org.mockito.Mockito.doNothing().when(auth0Service).assignRole(anyString(), any(Role.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles/by-name")
                .param("roleName", Role.ADMIN_GLOBAL.name()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Rol asignado correctamente"))
            .andExpect(jsonPath("$.roleName").value(Role.ADMIN_GLOBAL.name()));
    }

    // ========== 16. POST /users/{userId}/roles/by-name - Rol inválido ==========
    @Test
    void assignRoleByName_shouldReturn400_whenRoleNameIsInvalid() throws Exception {
        // Arrange
        org.mockito.Mockito.doThrow(new IllegalArgumentException("No enum constant Role.INVALID_ROLE"))
            .when(auth0Service).assignRole(anyString(), any(Role.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles/by-name")
                .param("roleName", "INVALID_ROLE"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    // ========== 17. POST /users/{userId}/roles/by-name - Rol no mapeado ==========
    @Test
    void assignRoleByName_shouldReturn404_whenRoleNotMapped() throws Exception {
        // Arrange
        org.mockito.Mockito.doThrow(new ResourceNotFoundException("Role not mapped: " + Role.SCOUT.name()))
            .when(auth0Service).assignRole(anyString(), any(Role.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/users/auth0|123/roles/by-name")
                .param("roleName", Role.SCOUT.name()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Role not mapped: " + Role.SCOUT.name()));
    }

    // ========== 18. POST /organizations/own/members - Agregar usuario a propia org exitoso ==========
    @Test
    void addUserToOwnOrganization_shouldReturn200_whenUserIsAddedSuccessfully() throws Exception {
        // Arrange
        org.mockito.Mockito.doNothing().when(auth0Service).addUserToOwnOrganization(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/organizations/own/members")
                .param("userId", "auth0|123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Usuario agregado a tu organización exitosamente"));
    }

    // ========== 19. POST /organizations/own/members - Organización no configurada ==========
    @Test
    void addUserToOwnOrganization_shouldReturn400_whenOrgIdNotConfigured() throws Exception {
        // Arrange: El servicio lanza IllegalArgumentException (no IllegalStateException)
        org.mockito.Mockito.doThrow(new IllegalArgumentException("Organization ID not configured in security context"))
            .when(auth0Service).addUserToOwnOrganization(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/organizations/own/members")
                .param("userId", "auth0|123"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Organization ID not configured in security context"));
    }

    // ========== 20. POST /organizations/own/members - Usuario ya es miembro ==========
    @Test
    void addUserToOwnOrganization_shouldReturn409_whenUserAlreadyMember() throws Exception {
        // Arrange
        org.mockito.Mockito.doThrow(new UserAlreadyMemberException("User is already a member"))
            .when(auth0Service).addUserToOwnOrganization(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/organizations/own/members")
                .param("userId", "auth0|123"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("El usuario ya pertenece a la organización"));
    }

    // ========== 21. POST /scouts - Crear Scout completo exitosamente ==========
    @Test
    void createScoutOnAuth0_shouldReturn200_whenScoutIsCreatedSuccessfully() throws Exception {
        // Arrange
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "scout@example.com",
            "ScoutPassword123!",
            "nuevo_scout"
        );
        CreatedUserDTO mockUser = new CreatedUserDTO("auth0|scout123", "scout@example.com", "nuevo_scout", false);
        
        when(auth0Service.createUser(any(CreateUserCommandDTO.class))).thenReturn(mockUser);
        org.mockito.Mockito.doNothing().when(auth0Service).addUserToOwnOrganization(anyString());
        org.mockito.Mockito.doNothing().when(auth0Service).assignRole(anyString(), any(Role.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/scouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Scout creado exitosamente"))
            .andExpect(jsonPath("$.userId").value("auth0|scout123"))
            .andExpect(jsonPath("$.email").value("scout@example.com"))
            .andExpect(jsonPath("$.username").value("nuevo_scout"))
            .andExpect(jsonPath("$.role").value("SCOUT"));
    }

    // ========== 22. POST /scouts - Validación de email inválido ==========
    @Test
    void createScoutOnAuth0_shouldReturn400_whenEmailIsInvalid() throws Exception {
        // Arrange: Email inválido
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "email-invalido",  // No es un email válido
            "Password123!",
            "scout_test"
        );

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/scouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").exists());
    }

    // ========== 23. POST /scouts - Usuario ya es miembro de la organización ==========
    @Test
    void createScoutOnAuth0_shouldReturn409_whenUserAlreadyMemberOfOrganization() throws Exception {
        // Arrange
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "existing@example.com",
            "Password123!",
            "existing_scout"
        );
        CreatedUserDTO mockUser = new CreatedUserDTO("auth0|existing", "existing@example.com", "existing_scout", false);
        
        when(auth0Service.createUser(any(CreateUserCommandDTO.class))).thenReturn(mockUser);
        org.mockito.Mockito.doThrow(new UserAlreadyMemberException("User already member"))
            .when(auth0Service).addUserToOwnOrganization(anyString());

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/scouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("El usuario ya pertenece a la organización"));
    }

    // ========== 24. POST /scouts - No autorizado para asignar rol SCOUT ==========
    @Test
    void createScoutOnAuth0_shouldReturn403_whenUnauthorizedToAssignScoutRole() throws Exception {
        // Arrange
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "scout@example.com",
            "Password123!",
            "scout_test"
        );
        CreatedUserDTO mockUser = new CreatedUserDTO("auth0|scout456", "scout@example.com", "scout_test", false);
        
        when(auth0Service.createUser(any(CreateUserCommandDTO.class))).thenReturn(mockUser);
        org.mockito.Mockito.doNothing().when(auth0Service).addUserToOwnOrganization(anyString());
        org.mockito.Mockito.doThrow(new uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException(
            "No tienes permiso para asignar el rol SCOUT"))
            .when(auth0Service).assignRole(anyString(), any(Role.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/scouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("No tienes permiso para asignar el rol SCOUT"));
    }

    // ========== 25. POST /scouts - Error de gateway al crear usuario ==========
    @Test
    void createScoutOnAuth0_shouldReturn502_whenAuth0GatewayExceptionOccurs() throws Exception {
        // Arrange
        CreateUserCommandDTO command = new CreateUserCommandDTO(
            "scout@example.com",
            "Password123!",
            "scout_test"
        );
        
        when(auth0Service.createUser(any(CreateUserCommandDTO.class)))
            .thenThrow(new Auth0GatewayException("Auth0 API error"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth0/scouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(command)))
            .andExpect(status().isBadGateway())
            .andExpect(jsonPath("$.message").value("Fallo creando Scout"));
    }
}
