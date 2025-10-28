package uao.edu.co.scouts_project.domain.port;

public interface OrganizationQueryPort {
    /**
     * Crea una organización en Auth0 con los campos requeridos.
     * - displayName: obligatorio (1..255, tras trim)
     * - logoUrl: opcional; si se provee debe ser una URL estricta https
     * Retorna el id de la organización creada.
     */
    String createOrganization(String displayName, String logoUrl);

    /**
     * Habilita (o actualiza) una conexión existente dentro de una organización de Auth0.
     * - assign_membership_on_login = true
     * - show_as_button = true
     * - is_signup_enabled = true
     *
     * @param organizationId id de la organización destino (no nulo/ni vacío)
     * @param connectionId id de la conexión existente (no nulo/ni vacío)
     * @return el mismo connectionId como símbolo de éxito
     */
    String enableConnectionForOrganization(String organizationId, String connectionId);
}
