package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
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

    /**
     * Crea un usuario completo con un rol específico:
     * 1. Crea el usuario en Auth0
     * 2. Lo asocia a la organización del usuario autenticado (obtiene org_id del JWT)
     * 3. Le asigna el rol especificado
     * 
     * Solo permite roles no administrativos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN
     * NO permite: ADMIN_GLOBAL, ADMIN_GRUPO, DEV_SUPPORT
     * 
     * @param request Datos del usuario a crear incluyendo el rol
     * @return CreatedUserDTO con la información del usuario creado
     * @throws uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException si el usuario ya pertenece a la organización
     * @throws uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException si intenta asignar un rol no permitido
     * @throws uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException si no se encuentra el usuario o rol
     * @throws IllegalArgumentException si los parámetros son inválidos
     * @throws uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException si hay un error de comunicación con Auth0
     */
    CreatedUserDTO createUserWithRole(CreateUserWithRoleCommandDTO request);
}
