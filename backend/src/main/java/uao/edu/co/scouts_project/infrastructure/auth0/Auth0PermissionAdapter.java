package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.Permission;
import com.auth0.json.mgmt.Role;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.service.PermissionNormalizer;
import uao.edu.co.scouts_project.infrastructure.cache.PermissionCache;
import uao.edu.co.scouts_project.infrastructure.cache.PermissionCacheMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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
                String roleNorm = normalizer.normalizeRole(role == null ? null : role.getName());
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
}
