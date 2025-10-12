package uao.edu.co.scouts_project.application.service;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
// no checked exceptions in service; adapter throws runtime Auth0GatewayException

import java.util.List;

/**
 * Implementación de {@link IAuth0Service} siguiendo SOLID:
 * - SRP: orquesta llamadas al puerto de infraestructura sin exponer detalles.
 * - DIP: depende de la abstracción {@link Auth0AdminPort}.
 */
@Service
public class Auth0ServiceImpl implements IAuth0Service {
    // Logger can be added if needed

    private final Auth0AdminPort adminPort;

    public Auth0ServiceImpl(Auth0AdminPort adminPort) {
        this.adminPort = adminPort;
    }

    @Override
    public CreatedUserDTO createUser(CreateUserCommandDTO cmd) {
        return adminPort.createUser(cmd);
    }

    @Override
    public void assignRole(String userId, String roleId) {
        adminPort.assignRole(userId, roleId);
    }

    @Override
    public UserSummaryDTO getUserById(String userId) {
        return adminPort.getUserById(userId);
    }

    @Override
    public List<UserSummaryDTO> listUsers() {
        return adminPort.listUsers();
    }

    @Override
    public List<RoleSummaryDTO> listRoles() {
        return adminPort.listRoles();
    }

    @Override
    public List<OrganizationSummaryDTO> listOrganizations() {
        return adminPort.listOrganizations();
    }

    @Override
    public void addUserToOrganization(String organizationId, String userId) {
        adminPort.addUserToOrganization(organizationId, userId);
    }

    @Override
    public UserSummaryDTO getUserInOrganization(String organizationId, String userId) {
        return adminPort.getUserInOrganization(organizationId, userId);
    }

}
