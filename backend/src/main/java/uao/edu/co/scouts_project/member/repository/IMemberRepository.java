package uao.edu.co.scouts_project.member.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;

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
     * Cuenta la cantidad de miembros por grupo para un tenant específico.
     *
     * @param tenantId ID del tenant para el cual se quiere contar los miembros por grupo
     * @return Lista de objetos con el ID del grupo, nombre del grupo y cantidad de miembros
     */
    @Query("SELECT NEW uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO(" +
           "g.groupId, g.name, COUNT(m)) " +
           "FROM Member m " +
           "JOIN m.subgroup s " +
           "JOIN Group g ON g.groupId = s.groupId " +
           "WHERE g.tenantId = :tenantId " +
           "GROUP BY g.groupId, g.name")
    List<GroupMembersDTO> countMembersByGroup(@Param("tenantId") String tenantId);

    /**
     * Recupera todos los miembros de un tenant con información completa de subgrupo y sección.
     * Realiza LEFT JOIN FETCH para evitar lazy loading y obtener toda la información en una consulta.
     *
     * @param tenantId ID del tenant para filtrar los miembros
     * @return Lista de miembros con subgrupo y sección
     */
    @Query("SELECT m FROM Member m " +
           "LEFT JOIN FETCH m.subgroup sg " +
           "WHERE m.tenantId = :tenantId")
    List<Member> findMembersWithSubgroupByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT sg.groupId, COUNT(m) FROM Member m JOIN m.subgroup sg WHERE m.tenantId = :tenantId GROUP BY sg.groupId ORDER BY COUNT(m) DESC")
    List<Object[]> countMembersByGroupIdByTenant(@Param("tenantId") String tenantId);

    /**
     * Cuenta la cantidad de miembros por grupo a nivel global (sin filtrar por tenant).
     * @return Lista de objetos {groupId, count} ordenada descendentemente por count
     */
    @Query("SELECT sg.groupId, COUNT(m) FROM Member m JOIN m.subgroup sg GROUP BY sg.groupId ORDER BY COUNT(m) DESC")
    List<Object[]> countMembersByGroupIdAll();

    /**
     * Cuenta la cantidad de miembros por grupo a nivel global y devuelve DTOs con nombre del grupo.
     * @return Lista de GroupMembersDTO
     */
    @Query("""
        SELECT NEW uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO(
            g.groupId, g.name, COUNT(m)
        )
        FROM Group g
        LEFT JOIN Subgroup s ON s.groupId = g.groupId
        LEFT JOIN Member m ON m.subgroup = s
        GROUP BY g.groupId, g.name
        ORDER BY COUNT(m) DESC
    """)
    List<GroupMembersDTO> countMembersByGroupAll();



    @Query("SELECT m.memberId FROM Member m WHERE m.userId = :userId")
    Optional<Long> findMemberIdByUserId(@Param("userId") String userId);
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
