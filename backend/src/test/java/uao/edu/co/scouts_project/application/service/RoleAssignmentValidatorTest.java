package uao.edu.co.scouts_project.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests para RoleAssignmentValidator que valida las reglas de autorización
 * para asignación de roles basadas en el rol del usuario autenticado.
 */
@ExtendWith(MockitoExtension.class)
class RoleAssignmentValidatorTest {

    @InjectMocks
    private RoleAssignmentValidator validator;

    private void authenticateAs(Role... roles) {
        List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
        TestingAuthenticationToken auth = new TestingAuthenticationToken("testUser", "password", authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ========== Tests para ACUDIENTE ==========

    @Test
    void acudiente_canAssignScoutRole_toUserWithoutRoles() {
        // Arrange
        authenticateAs(Role.ACUDIENTE);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .doesNotThrowAnyException();
    }

    @Test
    void acudiente_cannotAssignScoutRole_toUserWithExistingRoles() {
        // Arrange
        authenticateAs(Role.ACUDIENTE);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.SCOUT, true))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("solo puede asignar rol SCOUT a usuarios que NO tienen roles previos");
    }

    @Test
    void acudiente_cannotAssignAdminGlobalRole() {
        // Arrange
        authenticateAs(Role.ACUDIENTE);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.ADMIN_GLOBAL, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("ACUDIENTE solo puede asignar rol SCOUT");
    }

    @Test
    void acudiente_cannotAssignAdminGrupoRole() {
        // Arrange
        authenticateAs(Role.ACUDIENTE);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.ADMIN_GRUPO, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("ACUDIENTE solo puede asignar rol SCOUT");
    }

    @Test
    void acudiente_cannotAssignTesoreroRole() {
        // Arrange
        authenticateAs(Role.ACUDIENTE);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.TESORERO, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("ACUDIENTE solo puede asignar rol SCOUT");
    }

    // ========== Tests para ADMIN_GRUPO ==========

    @Test
    void adminGrupo_canAssignScoutRole() {
        // Arrange
        authenticateAs(Role.ADMIN_GRUPO);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .doesNotThrowAnyException();
    }

    @Test
    void adminGrupo_canAssignTesoreroRole() {
        // Arrange
        authenticateAs(Role.ADMIN_GRUPO);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.TESORERO, false))
                .doesNotThrowAnyException();
    }

    @Test
    void adminGrupo_canAssignScouterRole() {
        // Arrange
        authenticateAs(Role.ADMIN_GRUPO);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.SCOUTER, false))
                .doesNotThrowAnyException();
    }

    @Test
    void adminGrupo_cannotAssignAdminGlobalRole() {
        // Arrange
        authenticateAs(Role.ADMIN_GRUPO);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.ADMIN_GLOBAL, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("ADMIN_GRUPO no puede asignar rol ADMIN_GLOBAL");
    }

    @Test
    void adminGrupo_cannotAssignDevSupportRole() {
        // Arrange
        authenticateAs(Role.ADMIN_GRUPO);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.DEV_SUPPORT, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("ADMIN_GRUPO no puede asignar rol DEV_SUPPORT");
    }

    // ========== Tests para ADMIN_GLOBAL ==========

    @Test
    void adminGlobal_canAssignAnyRole_includingAdminGlobal() {
        // Arrange
        authenticateAs(Role.ADMIN_GLOBAL);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.ADMIN_GLOBAL, false))
                .doesNotThrowAnyException();
    }

    @Test
    void adminGlobal_canAssignAnyRole_includingDevSupport() {
        // Arrange
        authenticateAs(Role.ADMIN_GLOBAL);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.DEV_SUPPORT, false))
                .doesNotThrowAnyException();
    }

    @Test
    void adminGlobal_canAssignAnyRole_includingScout() {
        // Arrange
        authenticateAs(Role.ADMIN_GLOBAL);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.SCOUT, true))
                .doesNotThrowAnyException();
    }

    // ========== Tests para DEV_SUPPORT ==========

    @Test
    void devSupport_canAssignScoutRole() {
        // Arrange
        authenticateAs(Role.DEV_SUPPORT);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .doesNotThrowAnyException();
    }

    @Test
    void devSupport_canAssignDevSupportRole() {
        // Arrange
        authenticateAs(Role.DEV_SUPPORT);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.DEV_SUPPORT, false))
                .doesNotThrowAnyException();
    }

    @Test
    void devSupport_canAssignTesoreroRole() {
        // Arrange
        authenticateAs(Role.DEV_SUPPORT);

        // Act & Assert
        assertThatCode(() -> validator.validateRoleAssignment(Role.TESORERO, true))
                .doesNotThrowAnyException();
    }

    @Test
    void devSupport_cannotAssignAdminGlobalRole() {
        // Arrange
        authenticateAs(Role.DEV_SUPPORT);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.ADMIN_GLOBAL, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("DEV_SUPPORT no puede asignar rol ADMIN_GLOBAL");
    }

    // ========== Tests para usuarios sin roles permitidos ==========

    @Test
    void scout_cannotAssignAnyRole() {
        // Arrange
        authenticateAs(Role.SCOUT);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("No tienes permisos para asignar roles");
    }

    @Test
    void scouter_cannotAssignAnyRole() {
        // Arrange
        authenticateAs(Role.SCOUTER);

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("No tienes permisos para asignar roles");
    }

    @Test
    void unauthenticatedUser_cannotAssignRole() {
        // Arrange
        SecurityContextHolder.clearContext();

        // Act & Assert
        assertThatThrownBy(() -> validator.validateRoleAssignment(Role.SCOUT, false))
                .isInstanceOf(UnauthorizedRoleAssignmentException.class)
                .hasMessageContaining("Usuario no autenticado");
    }
}
