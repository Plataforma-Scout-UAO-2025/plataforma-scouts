package uao.edu.co.scouts_project.member;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ValidationExceptionHandlerTest {

    private ValidationExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ValidationExceptionHandler();
    }

    @Test
    void testHandleValidationExceptions_shouldReturnBadRequestAndErrorMessages() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        
        FieldError error1 = new FieldError("memberDto", "firstName", "El nombre es obligatorio");
        FieldError error2 = new FieldError("memberDto", "email", "El email es inválido");

        when(bindingResult.getAllErrors()).thenReturn(List.of(error1, error2));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleValidationExceptions(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ValidationExceptionHandler.ErrorResponse errorResponse = response.getBody();
        assertEquals(HttpStatus.BAD_REQUEST.value(), errorResponse.getStatus());
        assertEquals("Validation Error", errorResponse.getError());
        assertEquals("Error en la validación de los datos", errorResponse.getMessage());
        
        Map<String, String> details = errorResponse.getDetails();
        assertNotNull(details);
        assertTrue(details.containsKey("firstName"));
        assertTrue(details.containsKey("email"));
        assertEquals("El nombre es obligatorio", details.get("firstName"));
        assertEquals("El email es inválido", details.get("email"));

        verify(bindingResult, times(1)).getAllErrors();
    }

    @Test
    void testHandleValidationExceptions_whenNoFieldErrors_shouldReturnEmptyDetails() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(List.of());

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleValidationExceptions(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ValidationExceptionHandler.ErrorResponse errorResponse = response.getBody();
        assertEquals(HttpStatus.BAD_REQUEST.value(), errorResponse.getStatus());
        assertNotNull(errorResponse.getDetails());
        assertTrue(errorResponse.getDetails().isEmpty());
    }

    @Test
    void testHandleValidationExceptions_shouldContainTimestamp() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError error = new FieldError("object", "field", "error message");
        when(bindingResult.getAllErrors()).thenReturn(List.of(error));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleValidationExceptions(ex);

        // Assert
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void testHandleIllegalArgumentException_shouldReturnBadRequest() {
        // Arrange
        String errorMessage = "Estado inválido: 'pendiente'. Valores permitidos: ACTIVE, INACTIVE";
        IllegalArgumentException ex = new IllegalArgumentException(errorMessage);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleIllegalArgumentException(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ValidationExceptionHandler.ErrorResponse errorResponse = response.getBody();
        assertEquals(HttpStatus.BAD_REQUEST.value(), errorResponse.getStatus());
        assertEquals("Invalid Argument", errorResponse.getError());
        assertEquals(errorMessage, errorResponse.getMessage());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleSecurityException_shouldReturnUnauthorized() {
        // Arrange
        String errorMessage = "Acceso no autorizado";
        SecurityException ex = new SecurityException(errorMessage);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleSecurityException(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ValidationExceptionHandler.ErrorResponse errorResponse = response.getBody();
        assertEquals(HttpStatus.UNAUTHORIZED.value(), errorResponse.getStatus());
        assertEquals("Unauthorized", errorResponse.getError());
        assertEquals(errorMessage, errorResponse.getMessage());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleGenericException_shouldReturnInternalServerError() {
        // Arrange
        Exception ex = new Exception("Error inesperado");

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleGenericException(ex);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        
        ValidationExceptionHandler.ErrorResponse errorResponse = response.getBody();
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), errorResponse.getStatus());
        assertEquals("Internal Server Error", errorResponse.getError());
        assertEquals("Ha ocurrido un error interno en el servidor", errorResponse.getMessage());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleGenericException_shouldNotExposeInternalDetails() {
        // Arrange
        Exception ex = new Exception("Detalle interno sensible");

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleGenericException(ex);

        // Assert
        assertNotNull(response.getBody());
        // Verificar que NO se exponen detalles internos en producción
        if (response.getBody().getDetails() != null) {
            assertFalse(response.getBody().getDetails().containsValue("Detalle interno sensible"));
        }
    }

    @Test
    void testErrorResponse_builderPattern() {
        // Arrange & Act
        ValidationExceptionHandler.ErrorResponse errorResponse = 
                ValidationExceptionHandler.ErrorResponse.builder()
                        .status(400)
                        .error("Test Error")
                        .message("Test Message")
                        .details(Map.of("field", "error"))
                        .build();

        // Assert
        assertEquals(400, errorResponse.getStatus());
        assertEquals("Test Error", errorResponse.getError());
        assertEquals("Test Message", errorResponse.getMessage());
        assertNotNull(errorResponse.getDetails());
        assertEquals("error", errorResponse.getDetails().get("field"));
    }

    @Test
    void testHandleValidationExceptions_withMultipleErrorsOnSameField() {
        // Arrange
        BindingResult bindingResult = mock(BindingResult.class);
        
        // Simulación: mismo campo con múltiples errores
        // En Spring, normalmente solo se reporta el primer error por campo
        FieldError error1 = new FieldError("object", "email", "El email es obligatorio");
        FieldError error2 = new FieldError("object", "email", "El email tiene formato inválido");
        FieldError error3 = new FieldError("object", "phone", "El teléfono es obligatorio");

        when(bindingResult.getAllErrors()).thenReturn(List.of(error1, error2, error3));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<ValidationExceptionHandler.ErrorResponse> response = 
                handler.handleValidationExceptions(ex);

        // Assert
        assertNotNull(response.getBody());
        Map<String, String> details = response.getBody().getDetails();
        
        // El último error sobrescribe el anterior para el mismo campo
        assertTrue(details.containsKey("email"));
        assertTrue(details.containsKey("phone"));
        assertEquals("El teléfono es obligatorio", details.get("phone"));
    }
}