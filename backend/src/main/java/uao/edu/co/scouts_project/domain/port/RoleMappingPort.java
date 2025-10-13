package uao.edu.co.scouts_project.domain.port;

import uao.edu.co.scouts_project.infrastructure.security.Role;

/**
 * Puerto para mapear entre roles internos (enum Role) y roles de Auth0.
 * Sigue el principio de Inversión de Dependencias (DIP).
 */
public interface RoleMappingPort {

    /**
     * Obtiene el ID de Auth0 correspondiente a un rol interno.
     * 
     * @param role Rol interno (enum)
     * @return ID de Auth0 (ej: "rol_913piBxHkGe0MxC3")
     * @throws IllegalArgumentException si el rol no existe en la BD
     */
    String getAuth0RoleId(Role role);

    /**
     * Obtiene el rol interno correspondiente a un ID de Auth0.
     * 
     * @param auth0RoleId ID de Auth0
     * @return Rol interno (enum)
     * @throws IllegalArgumentException si el ID no existe en la BD
     */
    Role getRoleFromAuth0Id(String auth0RoleId);
}
