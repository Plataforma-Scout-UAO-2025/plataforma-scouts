package uao.edu.co.scouts_project.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;

import java.util.List;

/**
 * Servicio de aplicación (fachada) que orquesta reglas simples + delega al puerto Auth0AdminPort.
 *
 * Ejemplo de uso (sin controlador):
 * <pre>{@code
 * @Component
 * public class BootstrapRunner implements CommandLineRunner {
 *     private final Auth0AdminService auth0Service;
 *     public BootstrapRunner(Auth0AdminService auth0Service) { this.auth0Service = auth0Service; }
 *     public void run(String... args) {
 *         var created = auth0Service.createUser("demo@example.com", "Secr3t!", "demo-user");
 *         System.out.println("Usuario creado: " + created.id());
 *         auth0Service.assignRole(created.id(), "rol_123");
 *         var roles = auth0Service.listRoles();
 *         System.out.println("Roles disponibles: " + roles.size());
 *     }
 * }
 * }</pre>
 */
@Service
public class Auth0AdminService {

    private static final Logger log = LoggerFactory.getLogger(Auth0AdminService.class);

    private final Auth0AdminPort port;

    public Auth0AdminService(Auth0AdminPort port) {
        this.port = port;
    }

    public CreatedUserDTO createUser(String email, String password, String username) {
        // Las validaciones de @Email, @Size, @NotBlank se aplican automáticamente en el DTO
        CreatedUserDTO created = port.createUser(new CreateUserCommandDTO(email.trim(), password, username.trim()));
        log.debug("Usuario Auth0 creado id={} email={}", created.getId(), created.getEmail());
        return created;
    }

    public void assignRole(String userId, String roleId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId vacío");
        }
        if (!StringUtils.hasText(roleId)) {
            throw new IllegalArgumentException("roleId vacío");
        }
        port.assignRole(userId.trim(), roleId.trim());
        log.debug("Rol {} asignado a usuario {}", roleId, userId);
    }

    public List<UserSummaryDTO> listUsers() {
        return port.listUsers();
    }

    public List<RoleSummaryDTO> listRoles() {
        return port.listRoles();
    }

    public List<OrganizationSummaryDTO> listOrganizations() {
        return port.listOrganizations();
    }

    public boolean verifyConnectivity() {
        try {
            int count = port.countRoles();
            return count >= 0; // si no lanza excepción asumimos OK
        } catch (RuntimeException ex) {
            return false;
        }
    }
}
