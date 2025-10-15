package uao.edu.co.scouts_project.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.port.RoleMappingPort;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Tests para Auth0ServiceImpl.
 * Incluye tests para métodos de gestión de roles y mapeo de roles.
 */
@ExtendWith(MockitoExtension.class)
class Auth0ServiceImplTest {

    @Mock
    private Auth0AdminPort adminPort;

    @Mock
    private RoleMappingPort roleMappingPort;

    @Mock
    private RoleAssignmentValidator roleAssignmentValidator;

    @InjectMocks
    private Auth0ServiceImpl service;

    // ========== TESTS PARA ASIGNACIÓN DE ROLES CON ENUM ==========

    @Test
    void testAssignRole_WithRoleEnum_MapsToAuth0IdAndCallsAdminPort() {
        // Given
        String userId = "auth0|12345";
        Role role = Role.ACUDIENTE;
        String expectedAuth0RoleId = "rol_913piBxHkGe0MxC3";

        when(adminPort.userHasRoles(userId)).thenReturn(false);
        when(roleMappingPort.getAuth0RoleId(role)).thenReturn(expectedAuth0RoleId);
        // roleAssignmentValidator.validateRoleAssignment() no lanza excepción = validación OK

        // When
        service.assignRole(userId, role);

        // Then
        verify(adminPort, times(1)).userHasRoles(userId);
        verify(roleAssignmentValidator, times(1)).validateRoleAssignment(role, false);
        verify(roleMappingPort, times(1)).getAuth0RoleId(role);
        verify(adminPort, times(1)).assignRole(userId, expectedAuth0RoleId);
    }

    @Test
    void testAssignRole_WithRoleEnum_AllRoles_CallsMappingCorrectly() {
        // Given
        String userId = "auth0|67890";

        when(adminPort.userHasRoles(userId)).thenReturn(false);
        when(roleMappingPort.getAuth0RoleId(Role.ACUDIENTE)).thenReturn("rol_1");
        when(roleMappingPort.getAuth0RoleId(Role.ADMIN_GRUPO)).thenReturn("rol_2");
        when(roleMappingPort.getAuth0RoleId(Role.SCOUT)).thenReturn("rol_3");

        // When
        service.assignRole(userId, Role.ACUDIENTE);
        service.assignRole(userId, Role.ADMIN_GRUPO);
        service.assignRole(userId, Role.SCOUT);

        // Then
        verify(adminPort, times(3)).userHasRoles(userId);
        verify(roleAssignmentValidator, times(1)).validateRoleAssignment(Role.ACUDIENTE, false);
        verify(roleAssignmentValidator, times(1)).validateRoleAssignment(Role.ADMIN_GRUPO, false);
        verify(roleAssignmentValidator, times(1)).validateRoleAssignment(Role.SCOUT, false);
        
        verify(roleMappingPort, times(1)).getAuth0RoleId(Role.ACUDIENTE);
        verify(roleMappingPort, times(1)).getAuth0RoleId(Role.ADMIN_GRUPO);
        verify(roleMappingPort, times(1)).getAuth0RoleId(Role.SCOUT);

        verify(adminPort, times(1)).assignRole(userId, "rol_1");
        verify(adminPort, times(1)).assignRole(userId, "rol_2");
        verify(adminPort, times(1)).assignRole(userId, "rol_3");
    }

    @Test
    void testAssignRole_WhenRoleMappingFails_PropagatesException() {
        // Given
        String userId = "auth0|22222";
        Role role = Role.ADMIN_GLOBAL;

        when(adminPort.userHasRoles(userId)).thenReturn(false);
        when(roleMappingPort.getAuth0RoleId(role))
                .thenThrow(new IllegalArgumentException("Rol no mapeado"));

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            service.assignRole(userId, role);
        });

        verify(adminPort, times(1)).userHasRoles(userId);
        verify(roleAssignmentValidator, times(1)).validateRoleAssignment(role, false);
        verify(roleMappingPort, times(1)).getAuth0RoleId(role);
        verify(adminPort, never()).assignRole(anyString(), anyString());
    }

    // ========== TESTS PARA ASIGNACIÓN DE ROLES CON STRING (método original)
    // ==========

    @Test
    void testAssignRole_WithStringRoleId_CallsAdminPortDirectly() {
        // Given
        String userId = "auth0|11111";
        String roleId = "rol_direct_123";

        // When
        service.assignRole(userId, roleId);

        // Then
        verify(adminPort, times(1)).assignRole(userId, roleId);
        verify(roleMappingPort, never()).getAuth0RoleId(any());
    }

    @Test
    void testAssignRole_WithStringRoleId_DoesNotUseRoleMapping() {
        // Given
        String userId = "auth0|99999";
        String directRoleId = "rol_abc123";

        // When
        service.assignRole(userId, directRoleId);

        // Then
        // Verifica que NO se use el mapping port (método directo)
        verifyNoInteractions(roleMappingPort);
        verify(adminPort, times(1)).assignRole(userId, directRoleId);
    }
}
