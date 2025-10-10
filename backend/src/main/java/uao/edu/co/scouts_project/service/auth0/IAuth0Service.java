package uao.edu.co.scouts_project.service.auth0;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;

import java.util.List;

/**
 * Contrato del servicio de alto nivel para operaciones de administración contra
 * Auth0.
 * Sigue DIP: depende de abstracciones y delega a puertos/adaptadores en infra.
 */
public interface IAuth0Service {
    CreatedUserDTO createUser(CreateUserCommandDTO cmd);

    void assignRole(String userId, String roleId);

    UserSummaryDTO getUserById(String userId);

    List<UserSummaryDTO> listUsers();

    List<RoleSummaryDTO> listRoles();

    List<OrganizationSummaryDTO> listOrganizations();

    void addUserToOrganization(String organizationId, String userId);

    UserSummaryDTO getUserInOrganization(String organizationId, String userId);
}
