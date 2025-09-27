package uao.edu.co.scouts_project.organigrama.repo;

import uao.edu.co.scouts_project.organigrama.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByTenantIdAndSlug(Long tenantId, String slug);
    List<Group> findByTenantIdAndIsActive(Long tenantId, Boolean isActive);
    List<Group> findByTenantId(Long tenantId);
    boolean existsByTenantIdAndSlug(Long tenantId, String slug);
    boolean existsByTenantIdAndIdentifierNumber(Long tenantId, String identifierNumber);
}