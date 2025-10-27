package uao.edu.co.scouts_project.web.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.infrastructure.auth0.Auth0ConnectionsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sec")
public class SecurityUtils {

    private final PermissionQueryPort permissionQueryPort;
    private final Auth0ConnectionsService auth0ConnectionsService;

    @Value("${auth0.connections.admin-endpoint.enabled:false}")
    private boolean adminEndpointEnabled;

    public SecurityUtils(PermissionQueryPort permissionQueryPort,
                         Auth0ConnectionsService auth0ConnectionsService) {
        this.permissionQueryPort = permissionQueryPort;
        this.auth0ConnectionsService = auth0ConnectionsService;
    }

    @GetMapping("/roles")
    public List<String> getAuthenticatedUserRoles() {
        return permissionQueryPort.getCurrentUserRoles();
    }

    @GetMapping("/org_id")
    public String getAuthenticatedUserOrgId() {
        return permissionQueryPort.getCurrentUserOrgId();
    }

    @GetMapping("/connection")
    public String getAuthenticatedUserConnection() {
        return permissionQueryPort.getCurrentUserConnection();
    }

    /**
     * ADMIN ONLY - TEST ONLY ENDPOINT
     * Este endpoint es exclusivamente para pruebas del upsert de conexiones Auth0.
     * NO debe usarse en flujos de negocio ni exponerse en producción.
     * Protegido por flag: auth0.connections.admin-endpoint.enabled (default: false).
     * Para ejecutar realmente la creación/actualización, desactiva el dry-run por propiedad.
     */
    @PostMapping("/admin/auth0/connections/{slug}")
    public Map<String, Object> upsertAuth0DbConnectionAdmin(@PathVariable("slug") String slug) {
        if (!adminEndpointEnabled) {
            // Fail closed: endpoint inhabilitado salvo que se active explícitamente por configuración
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        // Esta es la manera como se debe de usar el servicio en flujos de negocio reales, nunca usar este endpoint.
        // Retorna el id (tipo String) de la conexión creada o actualizada para habilitar su posterior uso.
        String id = auth0ConnectionsService.createOrUpdateAuth0DbConnection(slug);
        return Map.of(
                "slug", slug,
                "resultId", id
        );
    }
}
