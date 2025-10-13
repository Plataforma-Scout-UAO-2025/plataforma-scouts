package uao.edu.co.scouts_project.domain.exception.auth0;

public class Auth0GatewayException extends RuntimeException {
    public Auth0GatewayException(String message, Throwable cause) {
        super(message, cause);
    }

    public Auth0GatewayException(String message) {
        super(message);
    }
}