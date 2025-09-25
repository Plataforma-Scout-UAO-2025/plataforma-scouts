package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.auth.AuthAPI;
import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.auth.TokenHolder;
import com.auth0.net.TokenRequest;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.concurrent.CompletableFuture;

/**
 * Proveedor del cliente ManagementAPI de Auth0 con renovación automática del token de management.
 */
@Component
public class Auth0ManagementClientProvider {
    private static final Logger log = LoggerFactory.getLogger(Auth0ManagementClientProvider.class);

    private static final long SKEW_MS = 60_000L; // renovar con margen

    private final String domain;
    private final String clientId;
    private final String clientSecret;
    private final String audience;

    private volatile String accessToken;
    private volatile long tokenExpiresAt;
    private volatile ManagementAPI managementAPI;

    @Value("${auth0.management.eager-init:false}")
    private boolean eagerInit;

    @Value("${auth0.management.background-refresh.enabled:false}")
    private boolean backgroundRefreshEnabled;

    public Auth0ManagementClientProvider(
            @Value("${auth0.domain}") String domain,
            @Value("${auth0.clientId}") String clientId,
            @Value("${auth0.clientSecret}") String clientSecret,
            @Value("${auth0.audience:https://placeholder.invalid/}") String audience) {
        this.domain = domain;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.audience = audience;
    }

    public ManagementAPI getManagementAPI() throws Auth0Exception {
        ensureInitialized();
        return managementAPI;
    }

    private void ensureInitialized() throws Auth0Exception {
        long now = System.currentTimeMillis();
        if (managementAPI == null || accessToken == null || now >= (tokenExpiresAt - SKEW_MS)) {
            synchronized (this) {
                now = System.currentTimeMillis();
                if (managementAPI == null || accessToken == null || now >= (tokenExpiresAt - SKEW_MS)) {
                    refreshTokenInternal();
                }
            }
        }
    }

    // Cambiado a protected para permitir pruebas con subclassing
    protected void refreshTokenInternal() throws Auth0Exception {
        String effectiveAudience = resolveAudience();
        log.info("Renovando token Management API (audience={})", effectiveAudience);
        AuthAPI authAPI = new AuthAPI(domain, clientId, clientSecret);
        TokenRequest tokenRequest = authAPI.requestToken(effectiveAudience);
        TokenHolder holder = tokenRequest.execute();
        this.accessToken = holder.getAccessToken();
        long expiresInMs = holder.getExpiresIn() * 1000L;
        this.tokenExpiresAt = System.currentTimeMillis() + expiresInMs;
        this.managementAPI = new ManagementAPI(domain, accessToken);
        log.info("Token Management API renovado. Expira en {}s", holder.getExpiresIn());
    }

    private String resolveAudience() {
        String standard = "https://" + domain + "/api/v2/";
        if (audience == null || audience.isBlank() || Objects.equals(audience, "https://placeholder.invalid/")) {
            return standard;
        }
        return audience;
    }

    @PostConstruct
    void warmUp() {
        if (!eagerInit) {
            log.debug("Eager init deshabilitado (auth0.management.eager-init=false)");
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                ensureInitialized();
                log.info("Auth0 Management API inicializado anticipadamente (eager-init)");
            } catch (Exception e) {
                log.warn("Fallo en inicialización anticipada de Auth0 Management API: {}. Se intentará bajo demanda.", e.getMessage());
            }
        });
    }

    // Tarea programada para renovar en background si se acerca la expiración
    @Scheduled(fixedDelayString = "${auth0.management.refresh-check-interval:30000}")
    void scheduledRefreshCheck() {
        if (!backgroundRefreshEnabled) {
            return;
        }
        try {
            ensureInitialized();
            log.debug("Background refresh check ejecutado");
        } catch (Exception e) {
            log.warn("Fallo en background refresh check: {}", e.getMessage());
        }
    }
}
