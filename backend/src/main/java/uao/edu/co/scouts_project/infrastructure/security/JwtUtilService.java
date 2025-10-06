package uao.edu.co.scouts_project.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class JwtUtilService {

    private static final String NAMESPACE = "https://scouts.uao.edu.co/";

    /**
     * Obtiene el JWT del contexto de seguridad actual
     */
    public Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Usuario no autenticado");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }

        throw new SecurityException("Token JWT no encontrado en el contexto de seguridad");
    }

    /**
     * Obtiene el user_id del usuario autenticado
     */
    public String getCurrentUserId() {
        Jwt jwt = getCurrentJwt();
        String userId = jwt.getClaimAsString(NAMESPACE + "user_id");

        if (userId == null) {
            log.warn("user_id no encontrado en el token JWT");
            throw new SecurityException("user_id no encontrado en el token");
        }

        return userId;
    }

    /**
     * Obtiene el rol del usuario autenticado
     */
    public String getCurrentUserRole() {
        Jwt jwt = getCurrentJwt();
        String role = jwt.getClaimAsString(NAMESPACE + "role");

        if (role == null) {
            log.warn("role no encontrado en el token JWT");
            return "MEMBER"; // rol por defecto
        }

        return role;
    }

    /**
     * Obtiene el tenant_id del usuario autenticado
     */
    public String getCurrentTenantId() {
        Jwt jwt = getCurrentJwt();
        return jwt.getClaimAsString(NAMESPACE + "tenant_id");
    }

    /**
     * Obtiene el email del usuario autenticado
     */
    public String getCurrentUserEmail() {
        Jwt jwt = getCurrentJwt();
        return jwt.getClaimAsString("email");
    }

    /**
     * Verifica si el usuario actual tiene un rol específico
     */
    public boolean hasRole(String role) {
        return getCurrentUserRole().equalsIgnoreCase(role);
    }

    /**
     * Obtiene el subject (sub) del JWT - generalmente el ID de Auth0
     */
    public String getCurrentSubject() {
        Jwt jwt = getCurrentJwt();
        return jwt.getSubject();
    }
}