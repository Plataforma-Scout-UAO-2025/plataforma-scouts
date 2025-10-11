package uao.edu.co.scouts_project.domain.port;

import java.util.List;
import java.util.Set;

/**
 * Puerto de dominio para consultar los permisos/roles efectivos de un usuario.
 * Implementaciones pueden obtenerlos de Auth0, caché, base de datos, etc.
 */
public interface PermissionQueryPort {
    Set<String> getUserPermissions(String userId);
    List<String> getCurrentUserRoles();
    // Nuevo método: retorna el claim org_id del usuario autenticado actual (JWT)
    String getCurrentUserOrgId();
}
