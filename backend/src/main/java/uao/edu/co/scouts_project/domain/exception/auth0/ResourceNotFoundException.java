package uao.edu.co.scouts_project.domain.exception.auth0;

/**
 * Excepción lanzada cuando un recurso específico no se encuentra en Auth0.
 * 
 * Ejemplos:
 * - Usuario no existe
 * - Rol no existe
 * - Organización no existe
 * 
 * Esta excepción debe resultar en un HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
