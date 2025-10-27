package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.common.ResponseDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserAuth0ChangeRoleDTO;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;

import java.util.List;

/**
 * Contrato del servicio de alto nivel para operaciones de administración contra
 * Auth0.
 * Sigue DIP: depende de abstracciones y delega a puertos/adaptadores en infra.
 */
public interface IAuth0Service {

    CreatedUserDTO createUser(CreateUserCommandDTO cmd);

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

    String createTenant(GroupDTO group);

}
