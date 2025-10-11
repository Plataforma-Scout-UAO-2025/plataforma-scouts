package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.RolesPage;
import com.auth0.json.mgmt.organizations.OrganizationsPage;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import com.auth0.client.mgmt.filter.PageFilter;
import com.auth0.client.mgmt.filter.UserFilter;
import com.auth0.json.mgmt.organizations.Member;
import com.auth0.json.mgmt.organizations.Members;
import com.auth0.json.mgmt.organizations.MembersPage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserNotMemberException;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import com.auth0.exception.APIException;

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

    public UserSummaryDTO getUserById(String userId) {
        try {
            User user = api().users().get(userId, (UserFilter) null).execute();
            return new UserSummaryDTO(user.getId(), user.getEmail(), user.getUsername());
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario no encontrado en Auth0: {}", userId);
                throw new ResourceNotFoundException("User not found: " + userId);
            }
            log.error("Error obteniendo usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo obteniendo usuario", e);
        } catch (Auth0Exception e) {
            log.error("Error obteniendo usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo obteniendo usuario", e);
        }
    }

    public void assignRole(String userId, String roleId) {
        try {
            api().users().addRoles(userId, List.of(roleId)).execute();
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                // Auth0 devuelve 404 si el usuario o el rol no existen
                log.warn("Usuario {} o rol {} no encontrado en Auth0", userId, roleId);
                throw new ResourceNotFoundException("User or role not found: userId=" + userId + ", roleId=" + roleId);
            }
            log.error("Error asignando rol {} a usuario {}: {}", roleId, userId, e.getMessage());
            throw new Auth0GatewayException("Fallo asignando rol", e);
        } catch (Auth0Exception e) {
            log.error("Error asignando rol {} a usuario {}: {}", roleId, userId, e.getMessage());
            throw new Auth0GatewayException("Fallo asignando rol", e);
        }
    }

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

    public void addUserToOrganization(String organizationId, String userId) {
        try {
            // Validar si ya es miembro antes de intentar agregarlo
            if (isUserMemberOfOrganization(organizationId, userId)) {
                throw new UserAlreadyMemberException(userId, organizationId);
            }

            // Si no es miembro, lo agregamos
            api().organizations()
                .addMembers(organizationId, new Members(java.util.List.of(userId)))
                .execute();
        } catch (UserAlreadyMemberException ex) {
            throw ex;
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                // Auth0 devuelve 404 si la organización no existe
                log.warn("Organización {} no encontrada en Auth0", organizationId);
                throw new ResourceNotFoundException("Organization not found: " + organizationId);
            }
            log.error("Error agregando usuario {} a organización {}: {}", userId, organizationId, e.getMessage());
            throw new Auth0GatewayException("Error agregando miembro a la organización", e);
        } catch (Exception ex) {
            log.error("Error agregando usuario {} a organización {}: {}", userId, organizationId, ex.getMessage());
            throw new Auth0GatewayException("Error agregando miembro a la organización", ex);
        }
    }

    // Recorre paginado de miembros de la organización y busca el userId
    private boolean isUserMemberOfOrganization(String organizationId, String userId) throws Exception {
        int page = 0;
        final int perPage = 50;
        while (true) {
            MembersPage membersPage = api().organizations()
                    .getMembers(organizationId, new PageFilter().withPage(page, perPage))
                    .execute();

            if (membersPage == null || membersPage.getItems() == null || membersPage.getItems().isEmpty()) {
                return false;
            }

            for (Member m : membersPage.getItems()) {
                if (userId.equals(m.getUserId())) {
                    return true;
                }
            }

            if (membersPage.getItems().size() < perPage) {
                return false;
            }
            page++;
        }
    }

    public UserSummaryDTO getUserInOrganization(String organizationId, String userId) {
        try {
            if (!isUserMemberOfOrganization(organizationId, userId)) {
                throw new UserNotMemberException(userId, organizationId);
            }
            User user = api().users().get(userId, (UserFilter) null).execute();
            return new UserSummaryDTO(user.getId(), user.getEmail(), user.getUsername());
        } catch (UserNotMemberException ex) {
            throw ex;
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario {} u organización {} no encontrados en Auth0", userId, organizationId);
                throw new ResourceNotFoundException("User or organization not found: userId=" + userId + ", orgId=" + organizationId);
            }
            log.error("Error obteniendo usuario {} dentro de organización {}: {}", userId, organizationId, e.getMessage());
            throw new Auth0GatewayException("Fallo obteniendo usuario en organización", e);
        } catch (Auth0Exception e) {
            log.error("Error obteniendo usuario {} dentro de organización {}: {}", userId, organizationId, e.getMessage());
            throw new Auth0GatewayException("Fallo obteniendo usuario en organización", e);
        } catch (Exception e) {
            throw new Auth0GatewayException("Error consultando membresía de organización", e);
        }
    }

    public int countRoles() {
        try {
            RolesPage roles = api().roles().list(null).execute();
            return roles.getItems() == null ? 0 : roles.getItems().size();
        } catch (Auth0Exception e) {
            log.error("Error contando roles: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo contando roles", e);
        }
    }

   
}
