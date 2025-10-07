package uao.edu.co.scouts_project.exception;

import java.util.HashMap;
import java.util.Map;

import org.apache.coyote.BadRequestException;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * Handles exceptions thrown by controllers and returns appropriate HTTP responses.
 * @ControllerAdvice is a specialization of @Component for classes that declare
 * @ExceptionHandler, @InitBinder, or @ModelAttribute methods to be shared across multiple
 * @Controller classes.
 *
 * Within this class, we define a simple POJO (Plain Old Java Object) named ExceptionDTO
 * 
 * what is this ExceptionDTO for?
 * to encapsulate the error message that will be sent back to the client in case of an exception.
 * This helps in providing a consistent structure for error responses. @Nicolas use them in your service logic so you meaningful messages are sent to the client. e.g
 * 
 * throw new NotFoundException("Guardian with ID " + guardianId + " not found.");
 * 
 * it depends on the exception thrown and response status you register here
 * either BadRequestException (400), NotFoundException (404) or MethodArgumentNotValidException (400)
 */
@RestControllerAdvice
public class ControllerExceptionHandler {

@ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ExceptionDTO> badRequest(BadRequestException e) {
        ExceptionDTO exceptionDto = new ExceptionDTO(e.getMessage());
        return new ResponseEntity<>(exceptionDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ExceptionDTO> notFound(NotFoundException e) {
        ExceptionDTO exceptionDto = new ExceptionDTO(e.getMessage());
        return new ResponseEntity<>(exceptionDto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> argumentNotValid(MethodArgumentNotValidException e){
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    public static class ExceptionDTO{
        private String message;
    }

}
