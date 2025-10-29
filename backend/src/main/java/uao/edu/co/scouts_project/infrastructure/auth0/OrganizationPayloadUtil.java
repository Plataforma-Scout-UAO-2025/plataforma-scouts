package uao.edu.co.scouts_project.infrastructure.auth0;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

final class OrganizationPayloadUtil {

    private OrganizationPayloadUtil() {}

    /**
     * Construye el atributo "name" a partir de displayName según reglas:
     * - name = "api-" + normalizedDisplayName
     * - normalizedDisplayName: toLowerCase, eliminar todo lo que no sea [a-z0-9], truncar a 45 chars
     * - Debe quedar al menos 1 char tras normalización (antes del prefijo)
     */
    static String buildNameFromDisplayName(String displayName) {
        if (displayName == null) {
            throw new IllegalArgumentException("display_name no puede ser nulo");
        }
        String trimmed = displayName.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("display_name no puede ser vacío");
        }
        String normalized = trimmed.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", ""); // elimina whitespace, guiones y cualquier no alfanumérico
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("display_name no produce un nombre normalizado válido (solo [a-z0-9])");
        }
        if (normalized.length() > 45) {
            normalized = normalized.substring(0, 45);
        }
        String name = "api-" + normalized;
        if (!name.matches("^api-[a-z0-9]{1,45}$")) {
            throw new IllegalStateException("name derivado inválido: " + name);
        }
        return name;
    }

    /**
     * Valida y normaliza logoUrl; si es null o vacío tras trim retorna null.
     * Debe cumplir https estricto y no contener espacios.
     */
    static String normalizeLogoUrlOrNull(String logoUrl) {
        if (logoUrl == null) return null;
        String s = logoUrl.trim();
        if (s.isEmpty()) return null;
        if (s.length() > 2000) {
            throw new IllegalArgumentException("logoUrl supera la longitud máxima de 2000");
        }
        if (!s.matches("^https://\\S+$")) {
            throw new IllegalArgumentException("logoUrl debe ser una URL https válida sin espacios");
        }
        return s;
    }

    /**
     * Construye un mapa con el payload mínimo para crear una organización.
     * Incluye solo los campos requeridos y opcionales definidos.
     */
    static Map<String, Object> buildRequestBodyMap(String displayName, String logoUrl) {
        String name = buildNameFromDisplayName(displayName);
        String normalizedLogo = normalizeLogoUrlOrNull(logoUrl);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("display_name", displayName.trim());
        if (normalizedLogo != null) {
            Map<String, Object> branding = new LinkedHashMap<>();
            branding.put("logo_url", normalizedLogo);
            body.put("branding", branding);
        }
        return body;
    }
}

