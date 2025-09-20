package uao.edu.co.scouts_project.moduleOne.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.moduleOne.model.Tenant;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Tenant
 * Proporciona operaciones CRUD y consultas personalizadas para tenants
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Busca un tenant por nombre (case insensitive)
     */
    Optional<Tenant> findByNombreIgnoreCase(String nombre);

    /**
     * Busca tenants activos
     */
    List<Tenant> findByActivoTrue();

    /**
     * Busca tenants por nombre que contenga el texto (case insensitive)
     */
    List<Tenant> findByNombreContainingIgnoreCase(String nombre);

    /**
     * Cuenta el número de grupos de un tenant
     */
    @Query("SELECT COUNT(g) FROM Grupo g WHERE g.tenant.tenantId = :tenantId")
    Long countGruposByTenantId(@Param("tenantId") Long tenantId);

    /**
     * Cuenta el número de miembros de un tenant
     */
    @Query("SELECT COUNT(m) FROM Miembro m WHERE m.tenant.tenantId = :tenantId")
    Long countMiembrosByTenantId(@Param("tenantId") Long tenantId);

    /**
     * Obtiene tenants con sus grupos (fetch join para evitar N+1 queries)
     */
    @Query("SELECT DISTINCT t FROM Tenant t LEFT JOIN FETCH t.grupos WHERE t.activo = true")
    List<Tenant> findAllActiveWithGrupos();

    /**
     * Verifica si existe un tenant con el nombre dado
     */
    boolean existsByNombreIgnoreCase(String nombre);
}