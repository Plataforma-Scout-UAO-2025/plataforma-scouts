package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.port.PolicyQueryPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Facade de aplicación que orquesta la resolución de GrantedAuthorities a partir de un JWT.
 * Centraliza la lógica previa que residía en el mapper JWT.
 */
@Service
public class AuthorizationFacade {

    private static final Logger log = LoggerFactory.getLogger(AuthorizationFacade.class);

    private final PermissionQueryPort permissionQueryPort;
    private final PolicyQueryPort policyQueryPort; // puede ser null si no hay bean

    public AuthorizationFacade(PermissionQueryPort permissionQueryPort,
                               ObjectProvider<PolicyQueryPort> policyQueryPortProvider) {
        this.permissionQueryPort = permissionQueryPort;
        this.policyQueryPort = policyQueryPortProvider.getIfAvailable();
    }

    /**
     * Resuelve las authorities resultantes de un JWT considerando:
     * 1. Claim "permissions" directo si viene poblado (se mapea a SCOPE_<perm>).\n
     * 2. Fallback: consulta remota de permisos/roles vía PermissionQueryPort usando sub o user_id.
     */
    public Collection<GrantedAuthority> resolveAuthorities(Jwt jwt) {
        List<String> permissionsClaim = safeList(jwt.getClaimAsStringList("permissions"));
        if (!permissionsClaim.isEmpty()) {
            return permissionsClaim.stream()
                    .filter(p -> p != null && !p.isBlank())
                    .map(p -> (GrantedAuthority) () -> "SCOPE_" + p.trim())
                    .collect(Collectors.toList());
        }
        String userId = resolveUserId(jwt);
        if (userId == null) {
            log.debug("JWT sin subject/user_id -> authorities vacías");
            return Collections.emptyList();
        }
        Set<String> fetched = permissionQueryPort.getUserPermissions(userId);
        if (fetched == null || fetched.isEmpty()) {
            return Collections.emptyList();
        }
        return fetched.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(this::ensurePrefixedAuthority)
                .distinct()
                .map(a -> (GrantedAuthority) () -> a)
                .collect(Collectors.toList());
    }

    /**
     * Future-proof: obtiene (si existe) el permiso dinámico requerido para un endpoint.
     * Actualmente retorna Optional.empty() si no hay PolicyQueryPort o si este no define política.
     */
    public Optional<String> requiredPermissionFor(String path, String httpMethod) {
        if (policyQueryPort == null) return Optional.empty();
        try {
            return policyQueryPort.requiredPermissionForEndpoint(path, httpMethod);
        } catch (Exception e) {
            log.warn("Fallo consultando PolicyQueryPort para {} {}: {}", httpMethod, path, e.getMessage());
            return Optional.empty();
        }
    }

    private String resolveUserId(Jwt jwt) {
        String sub = jwt.getSubject();
        if (sub != null && !sub.isBlank()) return sub;
        String alt = jwt.getClaimAsString("user_id");
        return (alt == null || alt.isBlank()) ? null : alt;
    }

    private String ensurePrefixedAuthority(String raw) {
        if (raw.startsWith("ROLE_") || raw.startsWith("SCOPE_")) return raw;
        return "SCOPE_" + raw;
    }

    private List<String> safeList(List<String> list) {
        return list == null ? Collections.emptyList() : list;
    }
}
