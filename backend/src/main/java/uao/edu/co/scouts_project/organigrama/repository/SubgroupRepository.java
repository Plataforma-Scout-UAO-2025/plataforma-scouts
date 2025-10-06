package uao.edu.co.scouts_project.organigrama.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.organigrama.model.Subgroup;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubgroupRepository extends JpaRepository<Subgroup, Long> {
    List<Subgroup> findByTenantIdAndGroupIdAndSectionId(String tenantId, Long groupId, Long sectionId);
    Optional<Subgroup> findByTenantIdAndGroupIdAndSectionIdAndSubgroupId(String tenantId, Long groupId, Long sectionId, Long subgroupId);
    Optional<Subgroup> findBySectionIdAndName(Long sectionId, String name);
    boolean existsBySectionIdAndName(Long sectionId, String name);
    List<Subgroup> findByTenantIdAndGroupIdAndSectionIdAndIsActive(String tenantId, Long groupId, Long sectionId, Boolean isActive);
}
