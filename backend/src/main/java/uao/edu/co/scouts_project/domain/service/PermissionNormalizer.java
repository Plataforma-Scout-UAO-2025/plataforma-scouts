package uao.edu.co.scouts_project.domain.service;

import org.springframework.stereotype.Component;

/**
 * Servicio de dominio para normalizar nombres de permisos y roles.
 * Mantiene reglas puras (sin dependencias de framework o SDK externos).
 */
@Component
public class PermissionNormalizer {

    /**
     * Normaliza un permiso crudo retornando cadena vacía si es inválido.
     */
    public String normalizePermission(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? "" : trimmed;
    }

    /**
     * Normaliza un rol: trim, reemplaza espacios por '_', mayúsculas. Si el resultado queda vacío retorna "".
     */
    public String normalizeRole(String rawRole) {
        if (rawRole == null) return "";
        String base = rawRole.trim();
        if (base.isEmpty()) return "";
        return base.replaceAll("\\s+", "_").toUpperCase();
    }
}
