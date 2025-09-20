package uao.edu.co.scouts_project.moduleOne.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.moduleOne.model.Miembro;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Miembro
 * Proporciona operaciones CRUD y consultas personalizadas para miembros
 */
@Repository
public interface MiembroRepository extends JpaRepository<Miembro, Long> {

    /**
     * Busca miembros por tenant ID
     */
    List<Miembro> findByTenantTenantId(Long tenantId);

    /**
     * Busca miembros activos por tenant ID
     */
    List<Miembro> findByTenantTenantIdAndActivoTrue(Long tenantId);

    /**
     * Busca un miembro por email
     */
    Optional<Miembro> findByEmail(String email);

    /**
     * Busca un miembro por email y tenant ID
     */
    Optional<Miembro> findByEmailAndTenantTenantId(String email, Long tenantId);

    /**
     * Busca miembros por nombre que contenga el texto (case insensitive)
     */
    List<Miembro> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);

    /**
     * Busca miembros por tipo de miembro
     */
    List<Miembro> findByTipoMiembro(String tipoMiembro);

    /**
     * Busca miembros por tipo de miembro y tenant ID
     */
    List<Miembro> findByTipoMiembroAndTenantTenantId(String tipoMiembro, Long tenantId);

    /**
     * Busca miembros activos
     */
    List<Miembro> findByActivoTrue();

    /**
     * Busca miembros por documento de identidad
     */
    Optional<Miembro> findByDocumentoIdentidad(String documentoIdentidad);

    /**
     * Busca miembros que pertenezcan a un grupo específico
     */
    @Query("SELECT m FROM Miembro m JOIN m.grupos g WHERE g.grupoId = :grupoId")
    List<Miembro> findByGrupoId(@Param("grupoId") Long grupoId);

    /**
     * Busca miembros activos que pertenezcan a un grupo específico
     */
    @Query("SELECT m FROM Miembro m JOIN m.grupos g WHERE g.grupoId = :grupoId AND m.activo = true")
    List<Miembro> findActiveByGrupoId(@Param("grupoId") Long grupoId);

    /**
     * Cuenta el número de grupos de un miembro
     */
    @Query("SELECT COUNT(g) FROM Grupo g JOIN g.miembros m WHERE m.miembroId = :miembroId")
    Long countGruposByMiembroId(@Param("miembroId") Long miembroId);

    /**
     * Obtiene miembros con sus grupos (fetch join para evitar N+1 queries)
     */
    @Query("SELECT DISTINCT m FROM Miembro m LEFT JOIN FETCH m.grupos WHERE m.tenant.tenantId = :tenantId AND m.activo = true")
    List<Miembro> findAllActiveWithGruposByTenantId(@Param("tenantId") Long tenantId);

    /**
     * Busca miembros por tenant ID y nombre/apellido que contenga el texto
     */
    @Query("SELECT m FROM Miembro m WHERE m.tenant.tenantId = :tenantId AND " +
           "(LOWER(m.nombre) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(m.apellido) LIKE LOWER(CONCAT('%', :searchText, '%')))")
    List<Miembro> findByTenantIdAndNombreOrApellidoContaining(@Param("tenantId") Long tenantId, 
                                                              @Param("searchText") String searchText);

    /**
     * Verifica si existe un miembro con el email dado
     */
    boolean existsByEmail(String email);

    /**
     * Verifica si existe un miembro con el email dado en un tenant específico
     */
    boolean existsByEmailAndTenantTenantId(String email, Long tenantId);

    /**
     * Verifica si existe un miembro con el documento de identidad dado
     */
    boolean existsByDocumentoIdentidad(String documentoIdentidad);
}