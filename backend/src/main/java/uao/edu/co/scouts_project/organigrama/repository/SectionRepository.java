package uao.edu.co.scouts_project.organigrama.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.organigrama.model.Section;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByTenantIdAndGroupId(String tenantId, Long groupId);
    Optional<Section> findByTenantIdAndGroupIdAndSectionId(String tenantId, Long groupId, Long sectionId);
    Optional<Section> findByGroupIdAndName(Long groupId, String name);
    boolean existsByGroupIdAndName(Long groupId, String name);
}
