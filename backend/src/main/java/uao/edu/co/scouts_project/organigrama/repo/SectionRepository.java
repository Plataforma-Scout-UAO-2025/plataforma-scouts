package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
  @Query("select s from Section s where s.tenantId = ?1 order by s.id desc")
  List<Section> findAllByTenant(Integer tenantId);
}
