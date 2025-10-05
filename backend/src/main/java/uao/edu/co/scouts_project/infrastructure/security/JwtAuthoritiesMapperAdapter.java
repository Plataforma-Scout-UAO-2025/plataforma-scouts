package uao.edu.co.scouts_project.infrastructure.security;

import uao.edu.co.scouts_project.application.service.AuthorizationFacade;
import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * Adaptador que encapsula la lógica de conversión de un JWT a GrantedAuthorities.
 * Replica el comportamiento previo incrustado en SecurityConfig (Etapa 1) para mantener compatibilidad.
 */
@Component
public class JwtAuthoritiesMapperAdapter implements AuthoritiesMappingPort {

    private final AuthorizationFacade authorizationFacade;

    public JwtAuthoritiesMapperAdapter(AuthorizationFacade authorizationFacade) {
        this.authorizationFacade = authorizationFacade;
    }

    @Override
    public Collection<GrantedAuthority> mapFromJwt(Jwt jwt) {
        return authorizationFacade.resolveAuthorities(jwt);
    }
}
