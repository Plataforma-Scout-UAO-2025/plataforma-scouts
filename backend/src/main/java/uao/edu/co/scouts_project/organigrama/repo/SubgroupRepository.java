package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SubgroupRepository extends JpaRepository<Subgroup, Long> {
  @Query("select g from Subgroup g where g.tenantId = ?1 and g.section.id = ?2 order by g.id desc")
  List<Subgroup> findByTenantAndSection(Integer tenantId, Long sectionId);
}
