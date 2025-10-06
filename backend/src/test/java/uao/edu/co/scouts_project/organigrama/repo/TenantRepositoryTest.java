package uao.edu.co.scouts_project.organigrama.repo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test") // fuerza a usar src/test/resources/application-test.properties si lo tienes, o application.properties de test
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // respeta tu H2 de tests ya configurado
class TenantRepositoryTest {

    @Autowired
    private TenantRepository repository;

    private Tenant newTenant(String id, String slug, String status) {
        Tenant t = new Tenant(slug);
        t.setTenantId(id);
        t.setStatus(status);
        t.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        t.setUpdatedAt(Instant.parse("2025-01-02T00:00:00Z"));
        return t;
    }

    @Test
    @DisplayName("existsBySlug: true si el slug existe")
    void existsBySlug_true() {
        repository.save(newTenant("t-1", "region-valle", "active"));

        boolean exists = repository.existsBySlug("region-valle");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsBySlug: false si el slug NO existe")
    void existsBySlug_false() {
        boolean exists = repository.existsBySlug("not-present");
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("findBySlug: retorna Optional con la entidad si existe")
    void findBySlug_ok() {
        repository.save(newTenant("t-2", "region-cauca", "inactive"));

        Optional<Tenant> found = repository.findBySlug("region-cauca");

        assertThat(found).isPresent();
        assertThat(found.get().getSlug()).isEqualTo("region-cauca");
        assertThat(found.get().getStatus()).isEqualTo("inactive");
    }

    @Test
    @DisplayName("findBySlug: Optional.empty si no existe")
    void findBySlug_empty() {
        assertThat(repository.findBySlug("nope")).isEmpty();
    }
}