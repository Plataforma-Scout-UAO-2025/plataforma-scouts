package uao.edu.co.scouts_project.infrastructure.cache;

import java.util.Optional;
import java.util.Set;

/**
 * Abstracción simple de caché para permisos de usuario con expiración.
 */
public interface PermissionCache {
    Optional<Set<String>> getIfValid(String userId);
    void put(String userId, Set<String> permissions);
    void evict(String userId);
}

