package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.List;

/**
 * Contrato del servicio de alto nivel para operaciones de administración contra
 * Auth0.
 * Sigue DIP: depende de abstracciones y delega a puertos/adaptadores en infra.
 */
public interface IAuth0Service {
    CreatedUserDTO createUser(CreateUserCommandDTO cmd);

    /**
     * Asigna un rol usando el ID de Auth0 directamente.
     */
    void assignRole(String userId, String roleId);

    /**
     * Asigna un rol usando el enum Role (más conveniente para desarrolladores).
     * Internamente mapea el enum al ID de Auth0.
     */
    void assignRole(String userId, Role role);

    UserSummaryDTO getUserById(String userId);

    List<UserSummaryDTO> listUsers();

    List<RoleSummaryDTO> listRoles();

    List<OrganizationSummaryDTO> listOrganizations();

    /**
     * Agrega un usuario a una organización específica en Auth0.
     */
    void addUserToOrganization(String organizationId, String userId);

    /**
     * Agrega un usuario a la organización del usuario autenticado (del JWT).
     */
    void addUserToOwnOrganization(String userId);

    UserSummaryDTO getUserInOrganization(String organizationId, String userId);
}
