package uao.edu.co.scouts_project.domain.port;

import java.util.Optional;

/**
 * Puerto placeholder para futuras políticas dinámicas (endpoint -> permiso/rol requerido).
 */
public interface PolicyQueryPort {
    /**
     * Devuelve de forma opcional el permiso requerido para un endpoint específico.
     * (Placeholder sin uso actual.)
     */
    Optional<String> requiredPermissionForEndpoint(String path, String httpMethod);
}

