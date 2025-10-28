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
