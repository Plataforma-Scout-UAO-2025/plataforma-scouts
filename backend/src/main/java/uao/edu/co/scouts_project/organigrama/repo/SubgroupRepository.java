package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubgroupRepository extends JpaRepository<Subgroup, Long> {
    List<Subgroup> findByTenantIdAndGroupIdAndSectionId(Long tenantId, Long groupId, Long sectionId);
    Optional<Subgroup> findByTenantIdAndGroupIdAndSectionIdAndSubgroupId(Long tenantId, Long groupId, Long sectionId, Long subgroupId);
    Optional<Subgroup> findBySectionIdAndName(Long sectionId, String name);
    boolean existsBySectionIdAndName(Long sectionId, String name);
    List<Subgroup> findByTenantIdAndGroupIdAndSectionIdAndIsActive(Long tenantId, Long groupId, Long sectionId, Boolean isActive);
}
