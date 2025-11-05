package uao.edu.co.scouts_project.application.service;

import java.util.List;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserAuth0ChangeRoleDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.infrastructure.security.Role;

public interface IAuth0Service {

    CreatedUserDTO createUser(CreateUserCommandDTO cmd);

    /** Crea usuario en una conexión (con_id) específica de Auth0. */
    CreatedUserDTO createUserInConnection(CreateUserCommandDTO cmd, String connectionId);

    CreatedUserDTO createUserWithRole(CreateUserWithRoleCommandDTO request);

    List<OrganizationSummaryDTO> listOrganizations();

    List<RoleSummaryDTO> listRoles();

    List<UserSummaryDTO> listUsers();

    UserSummaryDTO getUserById(String userId);

    UserSummaryDTO getUserInOrganization(String organizationId, String userId);

    void addUserToOrganization(String organizationId, String userId);

    void addUserToOwnOrganization(String userId);

    void assignRole(String userId, Role role);

    void assignRole(String userId, String roleId);

    void changeUserRole(UserAuth0ChangeRoleDTO request); // ADMIN_GRUPO (no admin roles)

    void changeUserRoleGlobal(UserAuth0ChangeRoleDTO request); // ADMIN_GLOBAL (any role, optional org validation)

    CreatedUserDTO createUserWithRoleInOrganizationElevated(CreateUserWithRoleCommandDTO request,
            String organizationId);

    /**
     * Crea un usuario con rol en una organización usando una conexión específica.
     * Solo ADMIN_GLOBAL puede invocar este método.
     */
    CreatedUserDTO createUserWithRoleInOrganizationWithConnection(
            CreateUserWithRoleCommandDTO request,
            String organizationId,
            String connectionId);

}
