package uao.edu.co.scouts_project.organigrama.repository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import uao.edu.co.scouts_project.storage.domain.StorageObject;
import uao.edu.co.scouts_project.storage.repository.StorageObjectRepository;

import java.util.*;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=none")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class StorageObjectRepositoryTest {

    @Configuration
    @EnableJpaRepositories(basePackageClasses = uao.edu.co.scouts_project.storage.repository.StorageObjectRepository.class)
    @EntityScan(basePackageClasses = uao.edu.co.scouts_project.storage.domain.StorageObject.class)
    static class JpaSliceConfig { }

    @Autowired private StorageObjectRepository repository;
    @Autowired private JdbcTemplate jdbc;

    @BeforeAll
    void schema() {
        jdbc.execute("CREATE SCHEMA IF NOT EXISTS storage");
                jdbc.execute("DROP TABLE IF EXISTS storage.objects");
        jdbc.execute("""
           CREATE TABLE storage.objects (
             id UUID PRIMARY KEY,
             name VARCHAR(2048) NOT NULL,
             bucket_id VARCHAR(128) NOT NULL
           )
        """);
    }

    @BeforeEach
    void clean() { jdbc.execute("DELETE FROM storage.objects"); }

    private UUID insertObject(String bucket, String name) {
        UUID id = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO storage.objects (id, name, bucket_id) VALUES (?, ?, ?)",
            ps -> {
                ps.setObject(1, id);
                ps.setString(2, name);
                ps.setString(3, bucket);
            }
        );
        return id;
    }

    @Test
    @DisplayName("findByNameAndBucketId → encuentra por nombre y bucket")
    void findByNameAndBucketId_ok() {
        insertObject("images", "a.png");
        Optional<StorageObject> out = repository.findByNameAndBucketId("a.png", "images");
        assertThat(out).isPresent();
        assertThat(out.get().getName()).isEqualTo("a.png");
    }

    @Test
    @DisplayName("findByIdIn → lista por conjunto de UUIDs")
    void findByIdIn_ok() {
        UUID a = insertObject("images", "a.png");
        UUID b = insertObject("images", "b.png");

        List<StorageObject> out = repository.findByIdIn(Set.of(a, b));
        assertThat(out).extracting(StorageObject::getName)
                       .containsExactlyInAnyOrder("a.png", "b.png");
    }

    @Test
    @DisplayName("deleteById → elimina por UUID")
    void deleteById_ok() {
        UUID id = insertObject("images", "a.png");
        repository.deleteById(id);
        assertThat(repository.findById(id)).isEmpty();
    }
}
