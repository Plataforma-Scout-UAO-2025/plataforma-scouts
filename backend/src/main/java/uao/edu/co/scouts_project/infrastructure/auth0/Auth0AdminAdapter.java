package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.RolesPage;
import com.auth0.json.mgmt.organizations.OrganizationsPage;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Adaptador concreto contra Auth0 Management API para el puerto Auth0AdminPort.
 *
 * No expone clases de la SDK al dominio; realiza la traducción a records internos.
 */
@Component
public class Auth0AdminAdapter implements Auth0AdminPort {

    private static final Logger log = LoggerFactory.getLogger(Auth0AdminAdapter.class);

    private final Auth0ManagementClientProvider provider;

    public Auth0AdminAdapter(Auth0ManagementClientProvider provider) {
        this.provider = provider;
    }

    protected ManagementAPI api() throws Auth0Exception { // protected para facilitar pruebas si se hace subclass
        return provider.getManagementAPI();
    }

    @Override
    @SuppressWarnings("deprecation") // setPassword está deprecado en SDK actual; mantener hasta migrar estrategia de creación.
    public CreatedUserDTO createUser(CreateUserCommandDTO cmd) {
        try {
            User user = new User("Username-Password-Authentication");
            user.setEmail(cmd.getEmail());
            user.setPassword(cmd.getPassword());
            user.setUsername(cmd.getUsername());
            user.setEmailVerified(false);
            User created = api().users().create(user).execute();
            return new CreatedUserDTO(created.getId(), created.getEmail(), created.getUsername(), created.isEmailVerified());
        } catch (Auth0Exception e) {
            log.error("Error creando usuario en Auth0: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo creando usuario", e);
        }
    }

    @Override
    public void assignRole(String userId, String roleId) {
        try {
            api().users().addRoles(userId, List.of(roleId)).execute();
        } catch (Auth0Exception e) {
            log.error("Error asignando rol {} a usuario {}: {}", roleId, userId, e.getMessage());
            throw new Auth0GatewayException("Fallo asignando rol", e);
        }
    }

    @Override
    public List<UserSummaryDTO> listUsers() {
        try {
            UsersPage users = api().users().list(null).execute(); // sin paginación explícita (usa defaults de Auth0)
            return users.getItems().stream()
                    .map(u -> new UserSummaryDTO(u.getId(), u.getEmail(), u.getUsername()))
                    .collect(Collectors.toList());
        } catch (Auth0Exception e) {
            log.error("Error listando usuarios: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo listando usuarios", e);
        }
    }

    @Override
    public List<RoleSummaryDTO> listRoles() {
        try {
            RolesPage roles = api().roles().list(null).execute();
            return roles.getItems().stream()
                    .map(r -> new RoleSummaryDTO(r.getId(), r.getName(), r.getDescription()))
                    .collect(Collectors.toList());
        } catch (Auth0Exception e) {
            log.error("Error listando roles: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo listando roles", e);
        }
    }

    @Override
    public List<OrganizationSummaryDTO> listOrganizations() {
        try {
            OrganizationsPage orgs = api().organizations().list(null).execute();
            return orgs.getItems().stream()
                    .map(o -> new OrganizationSummaryDTO(o.getId(), o.getName(), o.getDisplayName()))
                    .collect(Collectors.toList());
        } catch (Auth0Exception e) {
            log.error("Error listando organizaciones: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo listando organizaciones", e);
        }
    }

    @Override
    public int countRoles() {
        try {
            RolesPage roles = api().roles().list(null).execute();
            return roles.getItems() == null ? 0 : roles.getItems().size();
        } catch (Auth0Exception e) {
            log.error("Error contando roles: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo contando roles", e);
        }
    }

    // Excepción específica para separar errores de integración
    public static class Auth0GatewayException extends RuntimeException {
        public Auth0GatewayException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
