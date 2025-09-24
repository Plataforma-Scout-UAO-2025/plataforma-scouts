package uao.edu.co.scouts_project.finanzas.cuotas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CuotaNotFoundException extends RuntimeException {
    public CuotaNotFoundException(UUID id) {
        super("Cuota no encontrada: " + id);
    }
}
