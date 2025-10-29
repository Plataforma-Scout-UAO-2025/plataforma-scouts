package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.APIException;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.organizations.Organization;
import com.auth0.json.mgmt.organizations.Branding;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.OrganizationAlreadyExistsException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.port.OrganizationQueryPort;

@Service
public class Auth0OrganizationAdapter implements OrganizationQueryPort {
    private static final Logger log = LoggerFactory.getLogger(Auth0OrganizationAdapter.class);

    private final Auth0ManagementClientProvider provider;

    public Auth0OrganizationAdapter(Auth0ManagementClientProvider provider) {
        this.provider = provider;
    }

    protected ManagementAPI api() throws Auth0Exception {
        return provider.getManagementAPI();
    }

    @Override
    public String createOrganization(String displayName, String logoUrl) {
        // Validación y normalización
        final String name = OrganizationPayloadUtil.buildNameFromDisplayName(displayName);
        final String normalizedLogo = OrganizationPayloadUtil.normalizeLogoUrlOrNull(logoUrl);
        final String trimmedDisplay = displayName.trim();

        // Construir payload SDK
        Organization org = new Organization();
        org.setName(name);
        org.setDisplayName(trimmedDisplay);
        if (normalizedLogo != null) {
            Branding branding = new Branding();
            branding.setLogoUrl(normalizedLogo);
            org.setBranding(branding);
        }

        boolean hasLogo = normalizedLogo != null;
        String logDisplay = trimmedDisplay.length() > 100 ? trimmedDisplay.substring(0, 100) + "…" : trimmedDisplay;
        log.info("[Auth0-Orgs] Creando organización: name={}, display_name='{}', brandingLogoPresent={}", name, logDisplay, hasLogo);
        log.debug("[Auth0-Orgs] Payload SDK (request): {}", org);

        long startedAt = System.currentTimeMillis();
        try {
            Organization created = executeWithRetry(() -> api().organizations().create(org).execute(), "create organization");
            long tookMs = System.currentTimeMillis() - startedAt;
            String id = created.getId();
            log.info("[Auth0-Orgs] Organización creada: name={}, id={}, durationMs={}", name, id, tookMs);
            log.debug("[Auth0-Orgs] Payload SDK (response): {}", created);
            return id;
        } catch (APIException e) {
            long tookMs = System.currentTimeMillis() - startedAt;
            if (e.getStatusCode() == 409) {
                log.warn("[Auth0-Orgs] already-exists: name={} (status=409, durationMs={})", name, tookMs);
                throw new OrganizationAlreadyExistsException(name);
            }
            String code = "ERR_ORG_CREATE_API_" + e.getStatusCode();
            log.error("[Auth0-Orgs] {}: name={}, status={}, message='{}', durationMs={}", code, name, e.getStatusCode(), e.getMessage(), tookMs);
            throw new Auth0GatewayException(code + ": Fallo creando organización: status=" + e.getStatusCode() + ", message=" + e.getMessage(), e);
        } catch (Auth0Exception e) {
            long tookMs = System.currentTimeMillis() - startedAt;
            String code = "ERR_ORG_CREATE_TRANSPORT";
            log.error("[Auth0-Orgs] {}: name={}, message='{}', durationMs={}", code, name, e.getMessage(), tookMs);
            throw new Auth0GatewayException(code + ": Fallo creando organización (transport)", e);
        }
    }

    @Override
    public String enableConnectionForOrganization(String organizationId, String connectionId) {
        if (organizationId == null || organizationId.trim().isEmpty()) {
            throw new IllegalArgumentException("organizationId no puede ser nulo o vacío");
        }
        if (connectionId == null || connectionId.trim().isEmpty()) {
            throw new IllegalArgumentException("connectionId no puede ser nulo o vacío");
        }

        final String orgId = organizationId.trim();
        final String connId = connectionId.trim();

        long startedAt = System.currentTimeMillis();
        log.info("[Auth0-Orgs] Habilitando conexión en organización: orgId={}, connectionId={}", orgId, connId);

        try {
            // Verificar existencia de la organización
            executeWithRetry(() -> api().organizations().get(orgId).execute(), "get organization");

            // Construir payload extendido con flags completos
            EnabledConnectionPayload payload = new EnabledConnectionPayload();
            payload.setConnectionId(connId);
            payload.setAssignMembershipOnLogin(true);
            payload.setIsSignupEnabled(true);
            payload.setShowAsButton(true);

            log.debug("[Auth0-Orgs] Payload addConnection (request): {}", payload);

            // Intentar ADD
            try {
                executeWithRetry(() -> api().organizations().addConnection(orgId, payload).execute(), "add enabled connection");
                long tookMs = System.currentTimeMillis() - startedAt;
                log.info("[Auth0-Orgs] Conexión habilitada: orgId={}, connectionId={}, durationMs={}", orgId, connId, tookMs);
                return connId;
            } catch (APIException addEx) {
                if (addEx.getStatusCode() == 409) {
                    log.warn("[Auth0-Orgs] add-enabled-connection 409 (ya habilitada), procediendo con update: orgId={}, connectionId={}", orgId, connId);
                    EnabledConnectionPayload updatePayload = new EnabledConnectionPayload();
                    updatePayload.setAssignMembershipOnLogin(true);
                    updatePayload.setIsSignupEnabled(true);
                    updatePayload.setShowAsButton(true);

                    log.debug("[Auth0-Orgs] Payload updateConnection (request): {}", updatePayload);

                    executeWithRetry(() -> api().organizations().updateConnection(orgId, connId, updatePayload).execute(), "update enabled connection");
                    long tookMs = System.currentTimeMillis() - startedAt;
                    log.info("[Auth0-Orgs] Conexión actualizada tras 409: orgId={}, connectionId={}, durationMs={}", orgId, connId, tookMs);
                    return connId;
                }
                if (addEx.getStatusCode() == 404) {
                    long tookMs = System.currentTimeMillis() - startedAt;
                    String code = "ERR_ORG_ENABLE_CONN_API_404";
                    log.error("[Auth0-Orgs] {}: orgId={}, connectionId={}, message='{}', durationMs={}", code, orgId, connId, addEx.getMessage(), tookMs);
                    throw new ResourceNotFoundException("Connection not found: " + connId, addEx);
                }
                throw addEx;
            }
        } catch (APIException e) {
            long tookMs = System.currentTimeMillis() - startedAt;
            int status = e.getStatusCode();
            if (status == 404) {
                String code = "ERR_ORG_GET_API_404";
                log.error("[Auth0-Orgs] {}: orgId={}, message='{}', durationMs={}", code, orgId, e.getMessage(), tookMs);
                throw new ResourceNotFoundException("Organization not found: " + orgId, e);
            }
            String code = "ERR_ORG_ENABLE_CONN_API_" + status;
            log.error("[Auth0-Orgs] {}: orgId={}, connectionId={}, status={}, message='{}', durationMs={}", code, orgId, connId, status, e.getMessage(), tookMs);
            throw new Auth0GatewayException(code + ": Fallo habilitando conexión: status=" + status + ", message=" + e.getMessage(), e);
        } catch (Auth0Exception e) {
            long tookMs = System.currentTimeMillis() - startedAt;
            String code = "ERR_ORG_ENABLE_CONN_TRANSPORT";
            log.error("[Auth0-Orgs] {}: orgId={}, connectionId={}, message='{}', durationMs={}", code, orgId, connId, e.getMessage(), tookMs);
            throw new Auth0GatewayException(code + ": Fallo habilitando conexión (transport)", e);
        }
    }

    // Reintentos 429/5xx con backoff exponencial (hasta 3 intentos adicionales)
    private <T> T executeWithRetry(SupplierWithAuth0<T> supplier, String opDesc) throws Auth0Exception {
        int attempts = 0;
        long backoff = 250L;
        while (true) {
            attempts++;
            try {
                return supplier.get();
            } catch (APIException e) {
                int status = e.getStatusCode();
                boolean retryable = status == 429 || (status >= 500 && status < 600);
                if (retryable && attempts <= 3) {
                    log.warn("[Auth0-Orgs] {} recibió {}. Reintentando {}/3 en {} ms", opDesc, status, attempts, backoff);
                    try { Thread.sleep(backoff); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    backoff *= 2;
                    continue;
                }
                throw e;
            }
        }
    }

    @FunctionalInterface
    private interface SupplierWithAuth0<T> {
        T get() throws Auth0Exception;
    }
}
