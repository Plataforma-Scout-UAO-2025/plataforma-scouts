package uao.edu.co.scouts_project.infrastructure.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import uao.edu.co.scouts_project.domain.entity.Auth0Role;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests para Auth0RoleRepository.
 */
@DataJpaTest
@ActiveProfiles("test")
class Auth0RoleRepositoryTest {

    @Autowired
    private Auth0RoleRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void testFindByRoleName_WhenExists_ReturnsRole() {
        // Given
        Auth0Role role = new Auth0Role("rol_123", "ACUDIENTE");
        repository.save(role);

        // When
        Optional<Auth0Role> result = repository.findByRoleName("ACUDIENTE");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getRoleName()).isEqualTo("ACUDIENTE");
        assertThat(result.get().getAuth0RoleId()).isEqualTo("rol_123");
    }

    @Test
    void testFindByRoleName_WhenNotExists_ReturnsEmpty() {
        // When
        Optional<Auth0Role> result = repository.findByRoleName("NO_EXISTE");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testFindByAuth0RoleId_WhenExists_ReturnsRole() {
        // Given
        Auth0Role role = new Auth0Role("rol_456", "ADMIN_GRUPO");
        repository.save(role);

        // When
        Optional<Auth0Role> result = repository.findByAuth0RoleId("rol_456");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getRoleName()).isEqualTo("ADMIN_GRUPO");
        assertThat(result.get().getAuth0RoleId()).isEqualTo("rol_456");
    }

    @Test
    void testFindByAuth0RoleId_WhenNotExists_ReturnsEmpty() {
        // When
        Optional<Auth0Role> result = repository.findByAuth0RoleId("rol_no_existe");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testSaveAndFindAll_ReturnsAllRoles() {
        // Given
        repository.save(new Auth0Role("rol_1", "ACUDIENTE"));
        repository.save(new Auth0Role("rol_2", "SCOUT"));
        repository.save(new Auth0Role("rol_3", "TESORERO"));

        // When
        var roles = repository.findAll();

        // Then
        assertThat(roles).hasSize(3);
        assertThat(roles).extracting("roleName")
                .containsExactlyInAnyOrder("ACUDIENTE", "SCOUT", "TESORERO");
    }
}
