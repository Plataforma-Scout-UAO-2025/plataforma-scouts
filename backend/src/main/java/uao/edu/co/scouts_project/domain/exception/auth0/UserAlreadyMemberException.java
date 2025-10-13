package uao.edu.co.scouts_project.domain.exception.auth0;

// Excepción específica cuando el usuario ya es miembro de la organización
public class UserAlreadyMemberException extends RuntimeException {
    public UserAlreadyMemberException(String userId, String organizationId) {
        super("El usuario " + userId + " ya pertenece a la organización " + organizationId);
    }

    public UserAlreadyMemberException(String message) {
        super(message);
    }
}
