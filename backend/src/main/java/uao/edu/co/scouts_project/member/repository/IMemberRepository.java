package uao.edu.co.scouts_project.member.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad {@link Member}.
 * <p>
 * Proporciona métodos para realizar operaciones CRUD y consultas personalizadas
 * sobre los miembros registrados en el sistema.
 */
public interface IMemberRepository extends JpaRepository<Member, Long> {

    /**
     * Busca un miembro por su número de identificación.
     *
     * @param identification Número de identificación único del miembro.
     * @return {@link Optional} que contiene el miembro si existe, o vacío si no se encuentra.
     */
    Optional<Member> findByIdentification(@NotNull String identification);

    /**
     * Obtiene una lista de miembros filtrados por su estado.
     *
     * @param status Estado del miembro (por ejemplo, ACTIVE, INACTIVE, SUSPENDED).
     * @return Lista de miembros que coinciden con el estado proporcionado.
     */
    List<Member> findByStatus(Status status);

    /**
     * Recupera todos los miembros que pertenecen a un subGrupo dado
     * en una sola consulta para evitar problemas de lazy loading (N+1 queries).
     *
     * @return Lista de miembros
     */
    @Query("SELECT m FROM Member m WHERE m.subgroup.subgroupId = :subGroupId")
    List<Member> findBySubGroupId(@Param("subGroupId") Long subGroupId);

    /**
     * Recupera todos los miembros de un tenant con información completa de subgrupo y sección.
     * Realiza JOIN FETCH para evitar lazy loading y obtener toda la información en una consulta.
     *
     * @param tenantId ID del tenant para filtrar los miembros
     * @return Lista de miembros con subgrupo y sección
     */
    @Query("SELECT m FROM Member m " + 
            "JOIN FETCH m.subgroup sg " + 
            "WHERE m.tenantId = :tenantId") 
    List<Member> findMembersWithSubgroupByTenantId(@Param("tenantId") String tenantId);


    /**
     * Actualiza la sección (section_id) del subgrupo asociado a un miembro.
     * @param memberId ID del miembro cuyo subgrupo se usará para la actualización.
     * @param newSectionId Nuevo ID de la sección a asignar.
     */
    @Modifying
    @Transactional
    @Query("""
    UPDATE Subgroup s
    SET s.sectionId = :newSectionId
    WHERE s.subgroupId = (
        SELECT m.subgroup.subgroupId
        FROM Member m
        WHERE m.memberId = :memberId
    )
""")
    void updateSectionByMember(
            @Param("memberId") Long memberId,
            @Param("newSectionId") Long newSectionId
    );




}