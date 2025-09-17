package uao.edu.co.scouts_project.common.error;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.Instant;

@ControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, IllegalArgumentException.class})
  public ResponseEntity<ApiError> badRequest(Exception ex, HttpServletRequest req) {
    return ResponseEntity.badRequest()
      .body(new ApiError(Instant.now(),400,"Bad Request",ex.getMessage(),req.getRequestURI()));
  }
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> serverError(Exception ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(new ApiError(Instant.now(),500,"Internal Server Error",ex.getMessage(),req.getRequestURI()));
  }
}
