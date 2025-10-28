package uao.edu.co.scouts_project.web.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.domain.port.ConnectionQueryPort;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.port.OrganizationQueryPort;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sec")
public class SecurityUtils {

    private final PermissionQueryPort permissionQueryPort;
    private final ConnectionQueryPort connectionQueryPort;
    private final OrganizationQueryPort organizationQueryPort;

    @Value("${auth0.connections.admin-endpoint.enabled:false}")
    private boolean adminEndpointEnabled;

    public SecurityUtils(PermissionQueryPort permissionQueryPort, ConnectionQueryPort connectionQueryPort, OrganizationQueryPort organizationQueryPort) {
        this.permissionQueryPort = permissionQueryPort;
        this.connectionQueryPort = connectionQueryPort;
        this.organizationQueryPort = organizationQueryPort;
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
        String id = connectionQueryPort.createOrUpdateAuth0DbConnection(slug);
        return Map.of(
                "slug", slug,
                "resultId", id
        );
    }

    /**
     * ADMIN ONLY - TEST ONLY ENDPOINT
     * Endpoint para probar la habilitación (o actualización) de una conexión existente dentro de una organización existente en Auth0.
     * Protegido por flag: auth0.connections.admin-endpoint.enabled (default: false).
     */
    @PostMapping("/admin/auth0/organizations/{orgId}/connections/{connectionId}")
    public Map<String, Object> enableConnectionInOrganizationAdmin(@PathVariable("orgId") String orgId,
                                                                   @PathVariable("connectionId") String connectionId) {
        if (!adminEndpointEnabled) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        String resultId = organizationQueryPort.enableConnectionForOrganization(orgId, connectionId);
        return Map.of(
                "orgId", orgId,
                "connectionId", connectionId,
                "resultId", resultId
        );
    }
}
