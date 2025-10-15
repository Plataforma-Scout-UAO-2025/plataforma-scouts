package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.Permission;
import com.auth0.json.mgmt.Role;
import org.springframework.security.core.context.SecurityContextHolder;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.service.PermissionNormalizer;
import uao.edu.co.scouts_project.infrastructure.cache.PermissionCache;
import uao.edu.co.scouts_project.infrastructure.cache.PermissionCacheMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Adaptador Auth0 que implementa el puerto PermissionQueryPort usando un caché externo (PermissionCache).
 */
@Component
public class Auth0PermissionAdapter implements PermissionQueryPort {

    private static final Logger log = LoggerFactory.getLogger(Auth0PermissionAdapter.class);

    private final Auth0ManagementClientProvider managementProvider;
    private final PermissionCacheMetrics metrics;
    private final PermissionNormalizer normalizer;
    private final PermissionCache cache;

    public Auth0PermissionAdapter(Auth0ManagementClientProvider managementProvider,
                                  PermissionCacheMetrics metrics,
                                  PermissionNormalizer normalizer,
                                  PermissionCache cache) {
        this.managementProvider = managementProvider;
        this.metrics = metrics;
        this.normalizer = normalizer;
        this.cache = cache;
    }

    @Override
    public Set<String> getUserPermissions(String userId) {
        return cache.getIfValid(userId)
                .map(perms -> {
                    metrics.incrementHits();
                    return perms;
                })
                .orElseGet(() -> {
                    metrics.incrementMisses();
                    Set<String> fetched = fetchFromRemote(userId);
                    cache.put(userId, fetched);
                    metrics.incrementRefreshes();
                    return fetched;
                });
    }

    /**
     * Método protegido para facilitar pruebas (se puede sobreescribir en tests unitarios para simular llamadas remotas).
     */
    protected Set<String> fetchFromRemote(String userId) {
        Set<String> aggregate = new HashSet<>();
        try {
            ManagementAPI api = managementProvider.getManagementAPI();
            // Permisos directos
            List<Permission> direct = api.users().listPermissions(userId, null).execute().getItems();
            aggregate.addAll(direct.stream()
                    .map(this::safePermissionName)
                    .map(normalizer::normalizePermission)
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.toSet()));

            // Roles y permisos por rol
            List<Role> roles = api.users().listRoles(userId, null).execute().getItems();
            for (Role role : roles) {
                List<Permission> rolePerms = api.roles().listPermissions(role.getId(), null).execute().getItems();
                aggregate.addAll(rolePerms.stream()
                        .map(this::safePermissionName)
                        .map(normalizer::normalizePermission)
                        .filter(s -> !s.isBlank())
                        .collect(Collectors.toSet()));
                String roleNorm = normalizer.normalizeRole(role.getName());
                if (!roleNorm.isBlank()) {
                    aggregate.add("ROLE_" + roleNorm);
                }
            }
            log.debug("Permisos agregados para {} => {}", userId, aggregate);
        } catch (Auth0Exception e) {
            log.error("Error consultando Auth0 para {}: {}", userId, e.getMessage());
        } catch (Exception e) {
            log.error("Fallo inesperado consultando Auth0 para {}: {}", userId, e.getMessage());
        }
        return aggregate;
    }

    private String safePermissionName(Permission p) {
        if (p == null) return "";
        String n = p.getName();
        return n == null ? "" : n.trim();
    }

    public List<String> getCurrentUserRoles() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            ManagementAPI api = managementProvider.getManagementAPI();
            List<Role> roles = api.users().listRoles(userId, null).execute().getItems();
            if (roles == null || roles.isEmpty()) {
                return List.of();
            }
            return roles.stream()
                    .map(r -> r == null ? "" : r.getName())
                    .filter(n -> n != null && !n.isBlank())
                    .map(String::trim)
                    .collect(Collectors.toList());
        } catch (Auth0Exception e) {
            log.error("Error consultando Auth0 para {}: {}", userId, e.getMessage());
        } catch (Exception e) {
            log.error("Fallo inesperado consultando Auth0 para {}: {}", userId, e.getMessage());
        }
        return List.of();
    }

    @Override
    public String getCurrentUserOrgId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return "";
            }
            // Intento 1
            Object principal = auth.getPrincipal();
            if (principal instanceof Jwt jwt) {
                String val = jwt.getClaimAsString("org_id");
                return val == null ? "" : val.trim();
            }

            // Intento 2
            if (auth instanceof JwtAuthenticationToken jat) {
                Jwt jwt = jat.getToken();
                if (jwt != null) {
                    String val = jwt.getClaimAsString("org_id");
                    return val == null ? "" : val.trim();
                }
            }

            // Intento 3
            if (principal instanceof java.util.Map<?,?> map) {
                Object val = map.get("org_id");
                return val == null ? "" : String.valueOf(val).trim();
            }
        } catch (Exception e) {
            log.error("No fue posible extraer org_id del JWT actual: {}", e.getMessage());
        }
        return "";
    }

}
