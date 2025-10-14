package uao.edu.co.scouts_project.medical.record.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class MedicalRecordNotFoundException extends RuntimeException {
    public MedicalRecordNotFoundException(String m) { super(m); }
}
