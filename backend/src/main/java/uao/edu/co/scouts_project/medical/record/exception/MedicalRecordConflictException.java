package uao.edu.co.scouts_project.medical.record.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class MedicalRecordConflictException extends RuntimeException {
    public MedicalRecordConflictException(String m) { super(m); }
}
