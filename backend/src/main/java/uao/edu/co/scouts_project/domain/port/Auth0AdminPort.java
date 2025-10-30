package uao.edu.co.scouts_project.domain.port;

import java.util.List;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;

/**
 * Puerto de dominio / aplicación para operaciones de administración sobre  Auth0.
 * (Crear usuario, asignar rol, listar usuarios/roles/organizaciones,
 * verificación básica.)
 *
 * Implementaciones pertenecen a la capa de infraestructura como Adaptadores
 * (ej: usando ManagementAPI).
 */
public interface Auth0AdminPort {

    CreatedUserDTO createUser(CreateUserCommandDTO cmd);

    int countRoles();

    List<OrganizationSummaryDTO> listOrganizations();

    List<RoleSummaryDTO> listRoles();

    List<UserSummaryDTO> listUsers();

    UserSummaryDTO getUserById(String userId);

    UserSummaryDTO getUserInOrganization(String organizationId, String userId);

    /**
     * Agrega un usuario a una organización específica en Auth0.
     * 
     * @param organizationId ID de la organización de Auth0
     * @param userId ID del usuario en Auth0
     */
    void addUserToOrganization(String organizationId, String userId);

    /**
     * Agrega un usuario a la organización del usuario autenticado actual (obtenida del JWT).
     * Este método usa el org_id del token para determinar la organización.
     * 
     * @param userId ID del usuario en Auth0 a agregar
     */
    void addUserToOwnOrganization(String userId);

    void assignRole(String userId, String roleId);

    boolean userHasRoles(String userId);

    // --- Added: role management helpers for "single role" change ---
    /** List Auth0 role ids currently assigned to the user. */
    List<String> getUserRoleIds(String userId);

    /** Remove all/selected roles from a user. */
    void removeRoles(String userId, List<String> roleIds);
    
}
