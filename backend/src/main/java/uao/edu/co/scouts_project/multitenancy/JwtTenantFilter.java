package uao.edu.co.scouts_project.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtTenantFilter extends OncePerRequestFilter {

    // Nombre del claim en token Auth0
    private static final String TENANT_CLAIM = "org_id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null) {
                logger.warn("Authentication is null");
                throw new ServletException("No authentication in security context");
            }
            else if (auth.getPrincipal() instanceof Jwt jwt) {
                var claimKeys = String.join(", ", jwt.getClaims().keySet());
                logger.info("JWT org_id: " + jwt.getClaimAsString("org_id"));
            }

            if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
                String tenantId = jwt.getClaimAsString(TENANT_CLAIM);
                if (tenantId != null && !tenantId.isBlank()) {
                    TenantContext.set(tenantId);
                }
            }

            filterChain.doFilter(request, response);

        } finally {
            // Siempre limpiar al final del request para no “contaminar” el pool de hilos
            TenantContext.clear();
        }
    }
}
