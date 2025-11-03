package uao.edu.co.scouts_project.common.error;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler({ BindException.class, IllegalArgumentException.class })
  public ResponseEntity<ApiError> badRequest(Exception ex, HttpServletRequest req) {
    return ResponseEntity.badRequest()
        .body(new ApiError(Instant.now(), 400, "Bad Request", ex.getMessage(), req.getRequestURI()));
  }

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

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest req) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach((error) -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errors.put(fieldName, errorMessage);
    });
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", 400);
    body.put("error", "Bad Request");
    body.put("message", "Error de validación en los datos enviados");
    body.put("details", errors);
    body.put("path", req.getRequestURI());
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(GuardianExceptions.MemberAlreadyAssignedException.class)
  public ResponseEntity<Map<String, Object>> handleMemberAlreadyAssigned(
      GuardianExceptions.MemberAlreadyAssignedException ex) {
    return buildErrorResponse(
        HttpStatus.CONFLICT,
        "Member Already Assigned",
        ex.getMessage());
  }

  @ExceptionHandler(GuardianExceptions.AvailableGuardiansException.class)
  public ResponseEntity<Map<String, Object>> handleAvailableGuardiansNotFound(
      GuardianExceptions.AvailableGuardiansException ex) {
    return buildErrorResponse(
        HttpStatus.NOT_FOUND,
        "Available Guardians Not Found",
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
