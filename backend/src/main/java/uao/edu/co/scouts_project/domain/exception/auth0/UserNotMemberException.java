package uao.edu.co.scouts_project.domain.exception.auth0;
// Excepción cuando el usuario NO es miembro de la organización
public  class UserNotMemberException extends RuntimeException {
    public UserNotMemberException(String userId, String organizationId) {
        super("El usuario " + userId + " no pertenece a la organización " + organizationId);
    }
}
