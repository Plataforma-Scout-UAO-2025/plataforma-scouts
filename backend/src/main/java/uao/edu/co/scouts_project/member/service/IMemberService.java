package uao.edu.co.scouts_project.member.service;

import uao.edu.co.scouts_project.member.dto.MemberWithSubgroupAndSectionDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

/**
 * Servicio que define las operaciones de negocio para la gestión de miembros.
 * <p>
 * Esta interfaz actúa como contrato para la implementación del servicio,
 * centralizando la lógica de creación, consulta y actualización de miembros.
 */
public interface IMemberService {

    /**
     * Crea un nuevo miembro en el sistema.
     *
     * @param member Objeto {@link Member} con la información del nuevo miembro.
     * @return El miembro creado con sus datos persistidos.
     */
    Member create_member(Member member);

    /**
     * Lista todos los miembros registrados en el sistema.
     *
     * @return Lista de objetos {@link Member}.
     */
    List<Member> get_members();

    /**
     * 
     * Obtiene una lista de miembros que coinciden con el rol y tenantId
     * especificados.
     * 
     * @param role     Nombre del rol por el cual filtrar los miembros.
     * @param tenantId Identificador del tenant por el cual filtrar los miembros.
     * 
     */
    
    List<Member> get_member_by_role_and_tenantId(String role, String tenantId);

    /**
     * Obtiene un miembro a partir de su ID único.
     *
     * @param member_id Identificador único del miembro.
     * @return {@link Optional} que contiene el miembro si existe.
     */
    Optional<Member> get_member_by_id(Long member_id);

    /**
     * Obtiene todos los miembros de un suBroupId dado
     *
     * @param subGroupId Identificador único del subGrupo.
     * @return {@link Optional} que contiene los miembros si existex.
     */
    Optional<List<Member>> get_members_by_subGroupId(Long subGroupId);

    /**
     * Lista los miembros según su estado actual (PENDING, APPROVED, REJECTED,
     * etc.).
     *
     * @param status Estado de los miembros a filtrar.
     * @return Lista de miembros que coinciden con el estado especificado.
     */
    List<Member> get_members_by_status(String status);

    /**
     * Actualiza el estado de un miembro.
     *
     * @param memberId   ID del miembro a actualizar.
     * @param enumStatus Nuevo estado a asignar.
     * @return {@code true} si la actualización fue exitosa, {@code false} en caso
     *         contrario.
     */
    Boolean update_status(Long memberId, Status enumStatus);

    /**
     * Actualiza la información de un miembro existente.
     *
     * @param memberId     ID del miembro a actualizar.
     * @param memberUpdate Objeto {@link Member} con los nuevos datos.
     * @return El miembro actualizado o {@code null} si no se encontró.
     */
    Member update_member_by_id(Long memberId, Member memberUpdate);

    /**
     * Actualiza el rol de un miembro solo si su rol en Auth0 ha cambiado
     *
     * @param memberId ID del miembro a actualizar.
     * @return {@code true} si la actualización fue exitosa, {@code false} en caso
     *         contrario.
     */
    Boolean update_role(Long memberId, String newRole);

    /**
     * Asigna un miembro a un subGrupo existente
     *
     * @param memberId   ID del miembro a actualizar.
     * @param subGroupId Id del sub grupo que recibirá al miembro
     * @return el estado booleano de la operación
     */
    Boolean assignSubgroupAndSection(Long memberId, Long subGroupId, Long sectionId);

    /**
     * Obtiene todos los miembros del tenant del usuario autenticado con información
     * completa de subgrupo y sección.
     * El tenantId se obtiene del JWT token del usuario autenticado (claim org_id).
     *
     * @return Lista de miembros con información completa de subgrupo y sección.
     */
    List<MemberWithSubgroupAndSectionDto> get_members_with_subgroup_and_section();

    /**
     * Obtiene los miembros que tienen un rol específico (por ejemplo: ADMIN_GRUPO).
     *
     * @param role nombre del rol a filtrar
     * @return lista de miembros que coinciden con el rol
     */
    List<Member> findMembersByRole(String role);

}