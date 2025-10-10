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

    void addUserToOrganization(String organizationId, String userId);

    void assignRole(String userId, String roleId);
}
