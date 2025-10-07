package uao.edu.co.scouts_project.application.service;

import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.domain.port.PolicyQueryPort;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthorizationFacadePolicyQueryTest {

    @Test
    void requiredPermissionForReturnsEmptyWhenNoPolicyBean() {
        PermissionQueryPort permissionQueryPort = Mockito.mock(PermissionQueryPort.class);
        when(permissionQueryPort.getUserPermissions("auth0|u"))
                .thenReturn(Set.of("read:alpha"));
        @SuppressWarnings("unchecked")
        ObjectProvider<PolicyQueryPort> policyProvider = (ObjectProvider<PolicyQueryPort>) mock(ObjectProvider.class);
        when(policyProvider.getIfAvailable()).thenReturn(null);
        AuthorizationFacade facade = new AuthorizationFacade(permissionQueryPort, policyProvider); // provider sin bean

        Jwt jwt = Jwt.withTokenValue("tkn")
                .header("alg", "none")
                .subject("auth0|u")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();

        assertFalse(facade.requiredPermissionFor("/api/v1/scouts/list", "GET").isPresent());
        assertTrue(facade.resolveAuthorities(jwt).stream().anyMatch(a -> a.getAuthority().equals("SCOPE_read:alpha")));
    }
}
