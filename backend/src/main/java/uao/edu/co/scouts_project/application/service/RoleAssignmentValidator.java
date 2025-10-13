package uao.edu.co.scouts_project.application.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio que valida si el usuario autenticado tiene permiso para asignar un rol específico.
 * 
 * Reglas de Negocio:
 * - ACUDIENTE: Solo puede asignar rol SCOUT a usuarios SIN roles previos
 * - ADMIN_GRUPO: Puede asignar cualquier rol excepto ADMIN_GLOBAL y DEV_SUPPORT
 * - DEV_SUPPORT: Puede asignar cualquier rol excepto ADMIN_GLOBAL
 * - ADMIN_GLOBAL: Puede asignar cualquier rol (incluyendo ADMIN_GLOBAL)
 */
@Component
public class RoleAssignmentValidator {

    /**
     * Valida si el usuario autenticado puede asignar el rol especificado.
     * 
     * @param roleToAssign Rol que se desea asignar
     * @param targetUserHasRoles Si el usuario objetivo ya tiene roles asignados
     * @throws UnauthorizedRoleAssignmentException si no tiene permiso
     */
    public void validateRoleAssignment(Role roleToAssign, boolean targetUserHasRoles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedRoleAssignmentException("Usuario no autenticado");
        }

        Set<String> userRoles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replace("ROLE_", "")) // Quitar prefijo ROLE_
                .collect(Collectors.toSet());

        // ADMIN_GLOBAL es el único que puede asignar CUALQUIER rol
        if (userRoles.contains(Role.ADMIN_GLOBAL.name())) {
            return;
        }

        // DEV_SUPPORT puede asignar cualquier rol EXCEPTO ADMIN_GLOBAL
        if (userRoles.contains(Role.DEV_SUPPORT.name())) {
            if (roleToAssign == Role.ADMIN_GLOBAL) {
                throw new UnauthorizedRoleAssignmentException(
                    "DEV_SUPPORT no puede asignar rol ADMIN_GLOBAL. Solo ADMIN_GLOBAL puede hacerlo."
                );
            }
            return;
        }

        // ADMIN_GRUPO puede asignar cualquier rol excepto ADMIN_GLOBAL y DEV_SUPPORT
        if (userRoles.contains(Role.ADMIN_GRUPO.name())) {
            if (roleToAssign == Role.ADMIN_GLOBAL || roleToAssign == Role.DEV_SUPPORT) {
                throw new UnauthorizedRoleAssignmentException(
                    String.format("ADMIN_GRUPO no puede asignar rol %s. Solo ADMIN_GLOBAL puede hacerlo.", 
                        roleToAssign.name())
                );
            }
            return;
        }

        // ACUDIENTE solo puede asignar rol SCOUT a usuarios sin roles previos
        if (userRoles.contains(Role.ACUDIENTE.name())) {
            if (roleToAssign != Role.SCOUT) {
                throw new UnauthorizedRoleAssignmentException(
                    String.format("ACUDIENTE solo puede asignar rol SCOUT. Intentó asignar: %s", 
                        roleToAssign.name())
                );
            }
            if (targetUserHasRoles) {
                throw new UnauthorizedRoleAssignmentException(
                    "ACUDIENTE solo puede asignar rol SCOUT a usuarios que NO tienen roles previos"
                );
            }
            return;
        }

        // Si no tiene ninguno de los roles permitidos
        throw new UnauthorizedRoleAssignmentException(
            "No tienes permisos para asignar roles. Roles requeridos: ACUDIENTE, ADMIN_GRUPO, ADMIN_GLOBAL o DEV_SUPPORT"
        );
    }
}
