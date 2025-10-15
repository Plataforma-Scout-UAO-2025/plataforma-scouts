package uao.edu.co.scouts_project.domain.exception.auth0;

/**
 * Excepción lanzada cuando un usuario intenta asignar un rol para el cual no tiene autorización.
 * Por ejemplo: un ACUDIENTE intentando asignar rol ADMIN_GLOBAL.
 */
public class UnauthorizedRoleAssignmentException extends RuntimeException {
    public UnauthorizedRoleAssignmentException(String message) {
        super(message);
    }
}
