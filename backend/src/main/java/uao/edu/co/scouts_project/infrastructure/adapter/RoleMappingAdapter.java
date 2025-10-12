package uao.edu.co.scouts_project.infrastructure.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.domain.entity.Auth0Role;
import uao.edu.co.scouts_project.domain.port.RoleMappingPort;
import uao.edu.co.scouts_project.infrastructure.repository.Auth0RoleRepository;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import jakarta.annotation.PostConstruct;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Adaptador que implementa el mapeo de roles usando la tabla auth0_roles.
 * Cachea los mappings en memoria para optimizar el rendimiento.
 */
@Component
public class RoleMappingAdapter implements RoleMappingPort {

    private static final Logger log = LoggerFactory.getLogger(RoleMappingAdapter.class);

    private final Auth0RoleRepository roleRepository;

    // Caché en memoria: Role enum -> Auth0 ID
    private final EnumMap<Role, String> roleToAuth0IdCache = new EnumMap<>(Role.class);

    // Caché en memoria: Auth0 ID -> Role enum
    private final Map<String, Role> auth0IdToRoleCache = new HashMap<>();

    public RoleMappingAdapter(Auth0RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Inicializa el caché al arrancar la aplicación.
     * Se ejecuta automáticamente después de la construcción del bean.
     */
    @PostConstruct
    public void initializeCache() {
        log.info("Inicializando caché de roles Auth0...");
        List<Auth0Role> allRoles = roleRepository.findAll();

        for (Auth0Role auth0Role : allRoles) {
            try {
                Role role = Role.valueOf(auth0Role.getRoleName());
                roleToAuth0IdCache.put(role, auth0Role.getAuth0RoleId());
                auth0IdToRoleCache.put(auth0Role.getAuth0RoleId(), role);
                log.debug("Mapeado: {} -> {}", role, auth0Role.getAuth0RoleId());
            } catch (IllegalArgumentException e) {
                log.warn("Rol en BD no existe en enum Role: {}", auth0Role.getRoleName());
            }
        }

        log.info("Caché de roles inicializado con {} mappings", roleToAuth0IdCache.size());
    }

    @Override
    public String getAuth0RoleId(Role role) {
        String auth0Id = roleToAuth0IdCache.get(role);
        
        if (auth0Id == null) {
            log.error("No se encontró mapeo para el rol: {}", role);
            throw new IllegalArgumentException("Rol no mapeado en auth0_roles: " + role);
        }
        
        return auth0Id;
    }

    @Override
    public Role getRoleFromAuth0Id(String auth0RoleId) {
        Role role = auth0IdToRoleCache.get(auth0RoleId);
        
        if (role == null) {
            log.error("No se encontró mapeo para el auth0RoleId: {}", auth0RoleId);
            throw new IllegalArgumentException("Auth0 role ID no mapeado: " + auth0RoleId);
        }
        
        return role;
    }

    /**
     * Refresca el caché desde la BD (útil si se agregan roles dinámicamente).
     */
    public void refreshCache() {
        roleToAuth0IdCache.clear();
        auth0IdToRoleCache.clear();
        initializeCache();
        log.info("Caché de roles refrescado");
    }
}
