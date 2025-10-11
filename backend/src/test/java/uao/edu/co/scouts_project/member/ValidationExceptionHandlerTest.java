package uao.edu.co.scouts_project.member;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ValidationExceptionHandlerTest {

    @Test
    void testHandleValidationErrors_shouldReturnBadRequestAndErrorMessages() throws Exception {
        // Arrange
        ValidationExceptionHandler handler = new ValidationExceptionHandler();

        // Mock BindingResult y FieldError
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError error1 = new FieldError("object", "firstName", "El nombre es obligatorio");
        FieldError error2 = new FieldError("object", "email", "El email es inválido");

        when(bindingResult.getFieldErrors()).thenReturn(List.of(error1, error2));

        // Mock de MethodArgumentNotValidException
        Method method = this.getClass().getDeclaredMethod("testHandleValidationErrors_shouldReturnBadRequestAndErrorMessages");
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<Map<String, String>> response = handler.handleValidationErrors(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().containsKey("firstName"));
        assertTrue(response.getBody().containsKey("email"));
        assertEquals("El nombre es obligatorio", response.getBody().get("firstName"));
        assertEquals("El email es inválido", response.getBody().get("email"));

        verify(bindingResult, times(1)).getFieldErrors();
    }

    @Test
    void testHandleValidationErrors_whenNoFieldErrors_shouldReturnEmptyMap() {
        // Arrange
        ValidationExceptionHandler handler = new ValidationExceptionHandler();
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<Map<String, String>> response = handler.handleValidationErrors(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }
}
