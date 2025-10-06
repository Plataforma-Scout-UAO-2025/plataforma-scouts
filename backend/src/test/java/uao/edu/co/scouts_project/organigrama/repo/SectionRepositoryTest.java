package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Section;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
// ¡Esta es la línea clave! Le decimos que use la BBDD definida en application-test.properties
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
// Ya no necesitamos @TestPropertySource, @EntityScan, ni @EnableJpaRepositories
// porque la configuración principal de la prueba se encargará de escanear todo.
class SectionRepositoryTest {

    @Autowired
    private SectionRepository repository;

    // El resto de tu código de prueba está perfecto y no necesita cambios.

    private Section newSection(String tenantId, Long groupId, String name) {
        Section s = new Section();
        s.setTenantId(tenantId);
        s.setGroupId(groupId);
        s.setName(name);
        s.setDescription("desc");
        s.setIconObjectId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
        s.setPhotoPrincipal(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
        s.setGalleryObjectIds(new UUID[]{
            UUID.fromString("11111111-1111-1111-1111-111111111111")
        });
        s.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        s.setUpdatedAt(Instant.parse("2025-01-02T00:00:00Z"));
        return s;
    }

    @Test
    @DisplayName("findByTenantIdAndGroupId: lista de secciones del grupo")
    void findByTenantAndGroup_ok() {
        repository.save(newSection("t-1", 803L, "Tropa"));
        repository.save(newSection("t-1", 803L, "Comunidad"));
        repository.save(newSection("t-1", 999L, "Otra"));

        List<Section> list = repository.findByTenantIdAndGroupId("t-1", 803L);
        assertThat(list).extracting(Section::getName)
            .containsExactlyInAnyOrder("Tropa", "Comunidad");
    }

    @Test
    @DisplayName("findByTenantIdAndGroupIdAndSectionId: Optional presente si existe")
    void findByTenantAndGroupAndId_ok() {
        Section saved = repository.save(newSection("t-1", 803L, "Tropa"));

        Optional<Section> found = repository
            .findByTenantIdAndGroupIdAndSectionId("t-1", 803L, saved.getSectionId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Tropa");
    }

    @Test
    @DisplayName("findByGroupIdAndName: Optional vacío si no existe")
    void findByGroupAndName_empty() {
        assertThat(repository.findByGroupIdAndName(803L, "NoExiste")).isEmpty();
    }

    @Test
    @DisplayName("existsByGroupIdAndName: true/false según existencia")
    void existsByGroupAndName_ok() {
        repository.save(newSection("t-1", 803L, "Tropa"));

        assertThat(repository.existsByGroupIdAndName(803L, "Tropa")).isTrue();
        assertThat(repository.existsByGroupIdAndName(803L, "Clan")).isFalse();
    }
}