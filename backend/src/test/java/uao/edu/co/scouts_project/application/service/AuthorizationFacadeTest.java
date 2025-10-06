package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.port.PolicyQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class AuthorizationFacadeTest {

    private PermissionQueryPort permissionQueryPort;
    private AuthorizationFacade facade;

    @BeforeEach
    void setup() {
        permissionQueryPort = Mockito.mock(PermissionQueryPort.class);
        @SuppressWarnings("unchecked")
        ObjectProvider<PolicyQueryPort> policyProvider = (ObjectProvider<PolicyQueryPort>) Mockito.mock(ObjectProvider.class);
        when(policyProvider.getIfAvailable()).thenReturn(null);
        facade = new AuthorizationFacade(permissionQueryPort, policyProvider);
    }

    private Jwt jwt(String sub, List<String> permissionsClaim, String userId) {
        Jwt.Builder b = Jwt.withTokenValue("tkn")
                .header("alg", "none")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300));
        if (sub != null) b.subject(sub);
        if (permissionsClaim != null) b.claim("permissions", permissionsClaim);
        if (userId != null) b.claim("user_id", userId);
        return b.build();
    }

    @Test
    @DisplayName("Claim permissions poblado -> no consulta puerto remoto")
    void claimPermissionsPresent() {
        Jwt jwt = jwt("auth0|123", List.of("read:alpha", "write:beta"), null);
        Collection<GrantedAuthority> auths = facade.resolveAuthorities(jwt);
        assertEquals(2, auths.size());
        assertTrue(auths.stream().anyMatch(a -> a.getAuthority().equals("SCOPE_read:alpha")));
        verify(permissionQueryPort, never()).getUserPermissions(any());
    }

    @Test
    @DisplayName("Fallback remoto cuando claim vacío")
    void fallbackRemote() {
        Jwt jwt = jwt("auth0|456", null, null);
        when(permissionQueryPort.getUserPermissions("auth0|456"))
                .thenReturn(Set.of("read:gamma", "ROLE_ADMIN", "SCOPE_custom", "  "));
        Collection<GrantedAuthority> auths = facade.resolveAuthorities(jwt);
        assertEquals(3, auths.size());
        assertTrue(auths.stream().anyMatch(a -> a.getAuthority().equals("SCOPE_read:gamma")));
        assertTrue(auths.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(auths.stream().anyMatch(a -> a.getAuthority().equals("SCOPE_custom")));
        verify(permissionQueryPort, times(1)).getUserPermissions("auth0|456");
    }

    @Test
    @DisplayName("Sin sub y sin user_id -> vacío")
    void noSubjectNoUserId() {
        Jwt jwt = jwt(null, null, null);
        Collection<GrantedAuthority> auths = facade.resolveAuthorities(jwt);
        assertTrue(auths.isEmpty());
        verify(permissionQueryPort, never()).getUserPermissions(any());
    }

    @Test
    @DisplayName("Normaliza permisos sin prefijo a SCOPE_")
    void normalizeScopePrefix() {
        Jwt jwt = jwt("auth0|789", null, null);
        when(permissionQueryPort.getUserPermissions("auth0|789"))
                .thenReturn(Set.of("write:zeta"));
        Collection<GrantedAuthority> auths = facade.resolveAuthorities(jwt);
        assertTrue(auths.stream().anyMatch(a -> a.getAuthority().equals("SCOPE_write:zeta")));
    }
}
