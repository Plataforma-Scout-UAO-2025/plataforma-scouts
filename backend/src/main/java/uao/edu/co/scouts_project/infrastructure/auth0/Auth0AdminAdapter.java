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
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import com.auth0.exception.APIException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Adaptador concreto contra Auth0 Management API para el puerto Auth0AdminPort.
 *
 * No expone clases de la SDK al dominio; realiza la traducción a records
 * internos.
 */
@Component
public class Auth0AdminAdapter implements Auth0AdminPort {

    private static final Logger log = LoggerFactory.getLogger(Auth0AdminAdapter.class);

    private final Auth0ManagementClientProvider provider;
    private final PermissionQueryPort permissionQueryPort;

    public Auth0AdminAdapter(Auth0ManagementClientProvider provider, PermissionQueryPort permissionQueryPort) {
        this.provider = provider;
        this.permissionQueryPort = permissionQueryPort;
    }

    protected ManagementAPI api() throws Auth0Exception { // protected para facilitar pruebas si se hace subclass
        return provider.getManagementAPI();
    }

    @SuppressWarnings("deprecation") // setPassword está deprecado en SDK actual; mantener hasta migrar estrategia de
                                     // creación.
    public CreatedUserDTO createUser(CreateUserCommandDTO cmd) {
        try {
            // Obtener la conexión del usuario autenticado actual desde el JWT
            String connection = permissionQueryPort.getCurrentUserConnection();

            if (connection == null || connection.isBlank()) {
                log.error(
                        "No se pudo obtener la conexión del usuario autenticado. Verifica que el claim 'https://scouts-platform-backend/connections' esté presente en el JWT.");
                throw new Auth0GatewayException("No se pudo determinar la conexión de Auth0 para crear el usuario");
            }

            log.debug("Creando usuario con conexión: {}", connection);

            User user = new User(connection);
            user.setEmail(cmd.getEmail());
            user.setPassword(cmd.getPassword());
            user.setUsername(cmd.getUsername());
            user.setEmailVerified(false);

            // Marcar que este usuario fue creado por API (para que el Action no le asigne
            // rol automático)
            user.setAppMetadata(java.util.Map.of("created_by_api", true));

            User created = api().users().create(user).execute();
            return new CreatedUserDTO(created.getId(), created.getEmail(), created.getUsername(),
                    created.isEmailVerified());
        } catch (Auth0GatewayException e) {
            // Re-lanzar excepciones de gateway sin envolver
            throw e;
        } catch (Auth0Exception e) {
            log.error("Error creando usuario en Auth0: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo creando usuario", e);
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public CreatedUserDTO createUserInConnection(CreateUserCommandDTO cmd, String connectionId) {
        try {
            if (connectionId == null || connectionId.isBlank()) {
                throw new Auth0GatewayException("connectionId es obligatorio para crear el usuario en una conexión específica");
            }

            // Auth0 SDK 'User(connection)' espera el NOMBRE de la conexión, no el ID.
            // Si recibimos un ID (formato típico 'con_...'), resolvemos el nombre primero.
            String connectionRef = connectionId;
            String connectionNameToUse = connectionRef;
            if (connectionRef.startsWith("con_")) {
                try {
                    var conn = api().connections().get(connectionRef, null).execute();
                    if (conn == null || conn.getName() == null || conn.getName().isBlank()) {
                        throw new Auth0GatewayException("No se pudo resolver el nombre de la conexión desde el ID: " + connectionRef);
                    }
                    connectionNameToUse = conn.getName();
                } catch (Auth0Exception e) {
                    log.error("Error resolviendo nombre de conexión para {}: {}", connectionRef, e.getMessage());
                    throw new Auth0GatewayException("Fallo resolviendo nombre de conexión", e);
                }
            }

            log.debug("Creando usuario con conexión explícita: {}", connectionNameToUse);

            User user = new User(connectionNameToUse);
            user.setEmail(cmd.getEmail());
            user.setPassword(cmd.getPassword());
            user.setUsername(cmd.getUsername());
            user.setEmailVerified(false);
            user.setAppMetadata(java.util.Map.of("created_by_api", true));

            User created = api().users().create(user).execute();
            return new CreatedUserDTO(created.getId(), created.getEmail(), created.getUsername(),
                    created.isEmailVerified());
        } catch (Auth0Exception e) {
            log.error("Error creando usuario en Auth0 con conexión explícita: {}", e.getMessage());
            throw new Auth0GatewayException("Fallo creando usuario en conexión específica", e);
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

    @Override
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

    @Override
    public boolean userHasRoles(String userId) {
        try {
            PageFilter filter = new PageFilter().withPage(0, 1); // Solo necesitamos saber si hay al menos uno
            RolesPage rolesPage = api().users().listRoles(userId, filter).execute();
            return rolesPage.getItems() != null && !rolesPage.getItems().isEmpty();
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario no encontrado al verificar roles: {}", userId);
                throw new ResourceNotFoundException("User not found: " + userId);
            }
            log.error("Error verificando roles de usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo verificando roles de usuario", e);
        } catch (Auth0Exception e) {
            log.error("Error verificando roles de usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo verificando roles de usuario", e);
        }
    }

    // --- Added: list and remove roles to enforce "single role" ---
    @Override
    public List<String> getUserRoleIds(String userId) {
        try {
            RolesPage page = api().users().listRoles(userId, new PageFilter().withPage(0, 50)).execute();
            return page.getItems().stream().map(r -> r.getId()).collect(Collectors.toList());
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario no encontrado en listRoles: {}", userId);
                throw new ResourceNotFoundException("User not found: " + userId);
            }
            log.error("Error listando roles del usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo listando roles de usuario", e);
        } catch (Auth0Exception e) {
            log.error("Error listando roles del usuario {}: {}", userId, e.getMessage());
            throw new Auth0GatewayException("Fallo listando roles de usuario", e);
        }
    }

    @Override
    public void removeRoles(String userId, List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty())
            return;
        try {
            api().users().removeRoles(userId, roleIds).execute();
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario {} o roles {} no encontrados al remover", userId, roleIds);
                throw new ResourceNotFoundException("User or roles not found while removing roles");
            }
            log.error("Error removiendo roles {} del usuario {}: {}", roleIds, userId, e.getMessage());
            throw new Auth0GatewayException("Fallo removiendo roles", e);
        } catch (Auth0Exception e) {
            log.error("Error removiendo roles {} del usuario {}: {}", roleIds, userId, e.getMessage());
            throw new Auth0GatewayException("Fallo removiendo roles", e);
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
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                // Auth0 devuelve 404 si la organización no existe
                log.warn("Organización {} no encontrada en Auth0", organizationId);
                throw new ResourceNotFoundException("Organization not found: " + organizationId);
            }
            log.error("Error agregando usuario {} a organización {}: {}", userId, organizationId, e.getMessage());
            throw new Auth0GatewayException("Error agregando miembro a la organización", e);
        } catch (UserAlreadyMemberException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error agregando usuario {} a organización {}: {}", userId, organizationId, ex.getMessage());
            throw new Auth0GatewayException("Error agregando miembro a la organización", ex);
        }
    }

    public void addUserToOwnOrganization(String userId) {
        // Obtener el org_id del usuario autenticado desde el JWT
        String organizationId = permissionQueryPort.getCurrentUserOrgId();

        if (organizationId == null || organizationId.isBlank()) {
            log.error(
                    "No se pudo obtener el org_id del usuario autenticado. Verifica que el claim 'org_id' esté presente en el JWT.");
            throw new Auth0GatewayException("No se pudo determinar la organización del usuario autenticado");
        }

        log.debug("Agregando usuario {} a la organización propia: {}", userId, organizationId);

        addUserToOrganization(organizationId, userId);
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
                throw new IllegalArgumentException("El usuario no es miembro de la organización");
            }
            User user = api().users().get(userId, (UserFilter) null).execute();
            return new UserSummaryDTO(user.getId(), user.getEmail(), user.getUsername());
        } catch (APIException e) {
            if (e.getStatusCode() == 404) {
                log.warn("Usuario {} u organización {} no encontrados en Auth0", userId, organizationId);
                throw new ResourceNotFoundException(
                        "User or organization not found: userId=" + userId + ", orgId=" + organizationId);
            }
            log.error("Error obteniendo usuario {} dentro de organización {}: {}", userId, organizationId,
                    e.getMessage());
            throw new Auth0GatewayException("Fallo obteniendo usuario en organización", e);
        } catch (Auth0Exception e) {
            log.error("Error obteniendo usuario {} dentro de organización {}: {}", userId, organizationId,
                    e.getMessage());
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
