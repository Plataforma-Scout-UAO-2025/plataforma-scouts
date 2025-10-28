package uao.edu.co.scouts_project.domain.port;

public interface OrganizationQueryPort {
    /**
     * Crea una organización en Auth0 con los campos requeridos.
     * - displayName: obligatorio (1..255, tras trim)
     * - logoUrl: opcional; si se provee debe ser una URL estricta https
     * Retorna el id de la organización creada.
     */
    String createOrganization(String displayName, String logoUrl);
}

