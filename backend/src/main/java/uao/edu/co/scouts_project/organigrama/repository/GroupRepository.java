package uao.edu.co.scouts_project.organigrama.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.organigrama.model.Group;

import java.util.List;
import java.util.Optional;

    @Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByTenantIdAndSlug(String tenantId, String slug);

    List<Group> findByTenantIdAndIsActive(String tenantId, Boolean isActive);

    List<Group> findByTenantId(String tenantId);

    List<Group> findBySlug(String slug);

    boolean existsByTenantIdAndSlug(String tenantId, String slug);

    // Para unicidad 1:1 tenant-grupo
    boolean existsByTenantId(String tenantId);

    boolean existsByTenantIdAndIdentifierNumber(String tenantId, String identifierNumber);

    boolean existsBySlug(String slug);

    Long countByIsActiveTrue();
    Long countByTenantIdAndIsActiveTrue(String tenantId);
    Long countByTenantIdAndIsActiveFalse(String tenantId);
}