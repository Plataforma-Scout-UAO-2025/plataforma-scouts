package uao.edu.co.scouts_project.moduleOne.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.moduleOne.model.Grupo;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Grupo
 * Proporciona operaciones CRUD y consultas personalizadas para grupos
 */
@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    /**
     * Busca grupos por tenant ID
     */
    List<Grupo> findByTenantTenantId(Long tenantId);

    /**
     * Busca grupos activos por tenant ID
     */
    List<Grupo> findByTenantTenantIdAndActivoTrue(Long tenantId);

    /**
     * Busca un grupo por nombre y tenant ID
     */
    Optional<Grupo> findByNombreAndTenantTenantId(String nombre, Long tenantId);

    /**
     * Busca grupos por tipo de grupo
     */
    List<Grupo> findByTipoGrupo(String tipoGrupo);

    /**
     * Busca grupos por tipo de grupo y tenant ID
     */
    List<Grupo> findByTipoGrupoAndTenantTenantId(String tipoGrupo, Long tenantId);

    /**
     * Busca grupos que contengan el nombre (case insensitive)
     */
    List<Grupo> findByNombreContainingIgnoreCase(String nombre);

    /**
     * Busca grupos activos
     */
    List<Grupo> findByActivoTrue();

    /**
     * Cuenta el número de miembros de un grupo
     */
    @Query("SELECT COUNT(m) FROM Miembro m JOIN m.grupos g WHERE g.grupoId = :grupoId")
    Long countMiembrosByGrupoId(@Param("grupoId") Long grupoId);

    /**
     * Obtiene grupos con sus miembros (fetch join para evitar N+1 queries)
     */
    @Query("SELECT DISTINCT g FROM Grupo g LEFT JOIN FETCH g.miembros WHERE g.tenant.tenantId = :tenantId AND g.activo = true")
    List<Grupo> findAllActiveWithMiembrosByTenantId(@Param("tenantId") Long tenantId);

    /**
     * Busca grupos por tenant ID y nombre que contenga el texto
     */
    List<Grupo> findByTenantTenantIdAndNombreContainingIgnoreCase(Long tenantId, String nombre);

    /**
     * Verifica si existe un grupo con el nombre dado en un tenant específico
     */
    boolean existsByNombreAndTenantTenantId(String nombre, Long tenantId);
}