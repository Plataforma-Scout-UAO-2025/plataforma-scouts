package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByTenantIdAndGroupId(Long tenantId, Long groupId);
    Optional<Section> findByTenantIdAndGroupIdAndSectionId(Long tenantId, Long groupId, Long sectionId);
    Optional<Section> findByGroupIdAndSectionName(Long groupId, String sectionName);
    boolean existsByGroupIdAndSectionName(Long groupId, String sectionName);
}
