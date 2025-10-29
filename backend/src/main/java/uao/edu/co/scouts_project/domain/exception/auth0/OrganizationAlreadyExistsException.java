package uao.edu.co.scouts_project.domain.exception.auth0;

public class OrganizationAlreadyExistsException extends RuntimeException {
    private final String name;

    public OrganizationAlreadyExistsException(String name) {
        super("La organización ya existe con name='" + name + "'");
        this.name = name;
    }

    public OrganizationAlreadyExistsException(String name, String message) {
        super(message);
        this.name = name;
    }

    public OrganizationAlreadyExistsException(String name, Throwable cause) {
        super("La organización ya existe con name='" + name + "'", cause);
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

