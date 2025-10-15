package uao.edu.co.scouts_project.domain.port;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;

/**
 * Puerto para mapear un JWT a una colección de GrantedAuthority.
 * La implementación concreta encapsulará la lógica de extracción de claims y fallback a consulta remota.
 * (Se implementará en la Etapa 2; placeholder en la Etapa 1.)
 */
public interface AuthoritiesMappingPort {
    Collection<GrantedAuthority> mapFromJwt(Jwt jwt);
}
