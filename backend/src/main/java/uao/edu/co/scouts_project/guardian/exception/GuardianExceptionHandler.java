package uao.edu.co.scouts_project.guardian.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GuardianExceptionHandler {

    @ExceptionHandler(GuardianExceptions.GuardianNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleGuardianNotFound(
            GuardianExceptions.GuardianNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "Guardian Not Found",
                ex.getMessage());
    }

    @ExceptionHandler(GuardianExceptions.MemberNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleMemberNotFound(
            GuardianExceptions.MemberNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "Member Not Found",
                ex.getMessage());
    }

    @ExceptionHandler(GuardianExceptions.InvalidGuardianException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidGuardian(
            GuardianExceptions.InvalidGuardianException ex) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid Guardian",
                ex.getMessage());
    }

    @ExceptionHandler(GuardianExceptions.MemberAlreadyAssignedException.class)
    public ResponseEntity<Map<String, Object>> handleMemberAlreadyAssigned(
            GuardianExceptions.MemberAlreadyAssignedException ex) {
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                "Member Already Assigned",
                ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String error,
            String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
