package uao.edu.co.scouts_project.infrastructure.security;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Constantes relacionadas con roles y permisos.
 * Centraliza las listas de roles permitidos/prohibidos para evitar duplicación.
 */
public final class RoleConstants {

    private RoleConstants() {
        // Clase de utilidad - no instanciable
    }

    /**
     * Roles administrativos que NO pueden ser asignados por usuarios.
     */
    public static final List<Role> FORBIDDEN_ROLES = Arrays.asList(
            Role.ADMIN_GLOBAL,
            Role.ADMIN_GRUPO,
            Role.DEV_SUPPORT
    );

    /**
     * Roles que pueden ser asignados por administradores.
     */
    public static final List<Role> ASSIGNABLE_ROLES = Arrays.asList(
            Role.SCOUT,
            Role.ACUDIENTE,
            Role.TESORERO,
            Role.SCOUTER,
            Role.COMITE_ADMIN
    );

    /**
     * Nombres de roles asignables como String (para validación de DTO).
     */
    public static final String ASSIGNABLE_ROLES_PATTERN = "^(SCOUT|ACUDIENTE|TESORERO|SCOUTER|COMITE_ADMIN)$";

    /**
     * Lista de nombres de roles asignables separados por coma (para mensajes de error).
     */
    public static final String ASSIGNABLE_ROLES_STRING = "SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN";

    /**
     * Set de nombres de roles prohibidos como String (para validación rápida).
     */
    private static final Set<String> FORBIDDEN_ROLE_NAMES = FORBIDDEN_ROLES.stream()
            .map(Enum::name)
            .collect(Collectors.toSet());

    /**
     * Verifica si un rol es asignable.
     *
     * @param role El rol a verificar
     * @return true si el rol es asignable, false en caso contrario
     */
    public static boolean isAssignable(Role role) {
        return ASSIGNABLE_ROLES.contains(role);
    }

    /**
     * Verifica si un rol es prohibido.
     *
     * @param role El rol a verificar
     * @return true si el rol es prohibido, false en caso contrario
     */
    public static boolean isForbidden(Role role) {
        return FORBIDDEN_ROLES.contains(role);
    }

    /**
     * Verifica si un nombre de rol es prohibido.
     *
     * @param roleName El nombre del rol a verificar
     * @return true si el rol es prohibido, false en caso contrario
     */
    public static boolean isForbiddenRoleName(String roleName) {
        return FORBIDDEN_ROLE_NAMES.contains(roleName.toUpperCase());
    }
}
