package uao.edu.co.scouts_project.finanzas.fees.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import uao.edu.co.scouts_project.finanzas.fees.model.Concept;

public interface IConceptRepository extends JpaRepository<Concept, Long> {
  Optional<Concept> findByNameIgnoreCase(String name);
}
