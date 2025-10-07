package uao.edu.co.scouts_project.infrastructure.security;

import uao.edu.co.scouts_project.application.service.AuthorizationFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Collection;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class JwtAuthoritiesMapperAdapterTest {

    private AuthorizationFacade facade;
    private JwtAuthoritiesMapperAdapter adapter;

    @BeforeEach
    void setup() {
        facade = mock(AuthorizationFacade.class);
        adapter = new JwtAuthoritiesMapperAdapter(facade);
    }

    private Jwt buildJwt(String sub) {
        return Jwt.withTokenValue("tkn")
                .header("alg", "none")
                .subject(sub)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
    }

    @Test
    @DisplayName("Delegación: el mapper llama al facade y retorna sus authorities")
    void delegatesToFacade() {
        Jwt jwt = buildJwt("auth0|user123");
        when(facade.resolveAuthorities(jwt)).thenReturn(Set.of((GrantedAuthority) () -> "SCOPE_read:alpha"));

        Collection<GrantedAuthority> result = adapter.mapFromJwt(jwt);

        assertEquals(1, result.size());
        assertTrue(result.stream().anyMatch(a -> a.getAuthority().equals("SCOPE_read:alpha")));
        ArgumentCaptor<Jwt> captor = ArgumentCaptor.forClass(Jwt.class);
        verify(facade, times(1)).resolveAuthorities(captor.capture());
        assertEquals("auth0|user123", captor.getValue().getSubject());
    }
}
