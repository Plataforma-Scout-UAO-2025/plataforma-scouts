package uao.edu.co.scouts_project.infrastructure.adapter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uao.edu.co.scouts_project.domain.entity.Auth0Role;
import uao.edu.co.scouts_project.infrastructure.repository.Auth0RoleRepository;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Tests para RoleMappingAdapter.
 */
@ExtendWith(MockitoExtension.class)
class RoleMappingAdapterTest {

    @Mock
    private Auth0RoleRepository roleRepository;

    @InjectMocks
    private RoleMappingAdapter adapter;

    @BeforeEach
    void setUp() {
        // Simular datos en la BD
        List<Auth0Role> mockRoles = List.of(
                new Auth0Role("rol_913piBxHkGe0MxC3", "ACUDIENTE"),
                new Auth0Role("rol_eaJ0ZwrlAm1F4CTD", "ADMIN_GRUPO"),
                new Auth0Role("rol_z2doKzAug5YuDa8d", "SCOUT"),
                new Auth0Role("rol_3PtZgZcuERHUBwZc", "TESORERO"));

        when(roleRepository.findAll()).thenReturn(mockRoles);

        // Inicializar el caché
        adapter.initializeCache();
    }

    @Test
    void testGetAuth0RoleId_WhenRoleExists_ReturnsCorrectId() {
        // When
        String acudienteId = adapter.getAuth0RoleId(Role.ACUDIENTE);
        String adminGrupoId = adapter.getAuth0RoleId(Role.ADMIN_GRUPO);

        // Then
        assertThat(acudienteId).isEqualTo("rol_913piBxHkGe0MxC3");
        assertThat(adminGrupoId).isEqualTo("rol_eaJ0ZwrlAm1F4CTD");
    }

    @Test
    void testGetAuth0RoleId_WhenRoleNotMapped_ThrowsException() {
        // When/Then
        assertThatThrownBy(() -> adapter.getAuth0RoleId(Role.ADMIN_GLOBAL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Rol no mapeado en auth0_roles: ADMIN_GLOBAL");
    }

    @Test
    void testGetRoleFromAuth0Id_WhenIdExists_ReturnsCorrectRole() {
        // When
        Role acudiente = adapter.getRoleFromAuth0Id("rol_913piBxHkGe0MxC3");
        Role scout = adapter.getRoleFromAuth0Id("rol_z2doKzAug5YuDa8d");

        // Then
        assertThat(acudiente).isEqualTo(Role.ACUDIENTE);
        assertThat(scout).isEqualTo(Role.SCOUT);
    }

    @Test
    void testGetRoleFromAuth0Id_WhenIdNotMapped_ThrowsException() {
        // When/Then
        assertThatThrownBy(() -> adapter.getRoleFromAuth0Id("rol_no_existe"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Auth0 role ID no mapeado: rol_no_existe");
    }

    @Test
    void testInitializeCache_LoadsAllRolesFromRepository() {
        // Given
        verify(roleRepository, times(1)).findAll();

        // When
        String acudienteId = adapter.getAuth0RoleId(Role.ACUDIENTE);
        String scoutId = adapter.getAuth0RoleId(Role.SCOUT);

        // Then - No se debe volver a llamar al repository (caché funciona)
        verify(roleRepository, times(1)).findAll();
        assertThat(acudienteId).isNotNull();
        assertThat(scoutId).isNotNull();
    }

    @Test
    void testRefreshCache_ReloadsDataFromRepository() {
        // Given - Verificar que ya se llamó una vez en setUp
        verify(roleRepository, times(1)).findAll();

        // When
        adapter.refreshCache();

        // Then - Debe llamarse de nuevo
        verify(roleRepository, times(2)).findAll();
    }

    @Test
    void testInitializeCache_IgnoresInvalidRoleNames() {
        // Given - Agregar un rol inválido
        List<Auth0Role> rolesWithInvalid = List.of(
                new Auth0Role("rol_123", "ACUDIENTE"),
                new Auth0Role("rol_invalid", "ROL_INEXISTENTE_EN_ENUM"));

        when(roleRepository.findAll()).thenReturn(rolesWithInvalid);

        // When
        adapter.initializeCache();

        // Then - Solo ACUDIENTE debe estar mapeado
        String acudienteId = adapter.getAuth0RoleId(Role.ACUDIENTE);
        assertThat(acudienteId).isEqualTo("rol_123");

        // ROL_INEXISTENTE no debe causar error, simplemente se ignora
    }

}
