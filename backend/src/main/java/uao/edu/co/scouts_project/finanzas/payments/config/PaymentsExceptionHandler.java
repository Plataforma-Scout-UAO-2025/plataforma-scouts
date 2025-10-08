package uao.edu.co.scouts_project.finanzas.payments.config;

import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.time.Instant;
import java.util.Optional;

/**
 * Manejo de errores para los endpoints de pagos.
 * Traduce errores comunes de BD (Postgres) a respuestas limpias.
 */
@RestControllerAdvice(basePackages = "uao.edu.co.scouts_project.finanzas.payments")
public class PaymentsExceptionHandler {

    // ---- Modelito de error uniforme ----
    public record ApiError(
            String timestamp,
            int status,
            String error,
            String message,
            String path,
            String sqlState
    ) { }

    // Utilidad para armar la respuesta
    private ResponseEntity<ApiError> build(HttpStatus status, String msg, String path, String sqlState) {
        var body = new ApiError(
                Instant.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                msg,
                path,
                sqlState
        );
        return ResponseEntity.status(status).body(body);
    }

    // Extrae SQLSTATE si existe en la cadena de causas
    private String sqlStateOf(Throwable ex) {
        Throwable t = ex;
        while (t != null) {
            if (t instanceof SQLException se && se.getSQLState() != null) {
                return se.getSQLState();
            }
            t = t.getCause();
        }
        return null;
    }

    // ----------------- Handlers principales -----------------

    /**
     * Violaciones de integridad: unique, FK, NOT NULL, etc.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> onDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        String state = sqlStateOf(ex);
        if (state == null && ex.getCause() instanceof ConstraintViolationException cve) {
            state = sqlStateOf(cve);
        }

        if ("23505".equals(state)) { // unique_violation
            return build(HttpStatus.CONFLICT, "Registro duplicado, violación de restricción única.", req.getRequestURI(), state);
        }
        if ("23503".equals(state)) { // foreign_key_violation
            return build(HttpStatus.UNPROCESSABLE_ENTITY, "Referencia inexistente, violación de llave foránea.", req.getRequestURI(), state);
        }
        if ("23502".equals(state)) { // not_null_violation
            return build(HttpStatus.BAD_REQUEST, "Campo obligatorio nulo, verifique los datos enviados.", req.getRequestURI(), state);
        }
        if ("22001".equals(state)) { // string_data_right_truncation
            return build(HttpStatus.BAD_REQUEST, "Texto excede la longitud permitida.", req.getRequestURI(), state);
        }
        if ("22003".equals(state)) { // numeric_value_out_of_range
            return build(HttpStatus.BAD_REQUEST, "Valor numérico fuera de rango.", req.getRequestURI(), state);
        }
        if ("22P02".equals(state)) { // invalid_text_representation (UUID, enteros, etc.)
            return build(HttpStatus.BAD_REQUEST, "Formato inválido para un valor (UUID/tipo de dato).", req.getRequestURI(), state);
        }
        if ("22007".equals(state)) { // invalid_datetime_format
            return build(HttpStatus.BAD_REQUEST, "Formato de fecha/hora inválido.", req.getRequestURI(), state);
        }

        // genérico
        String msg = Optional.ofNullable(ex.getMostSpecificCause())
                .map(Throwable::getMessage)
                .orElse("Error de integridad de datos.");
        return build(HttpStatus.CONFLICT, msg, req.getRequestURI(), state);
    }

    /**
     * Errores de sintaxis SQL o columnas inexistentes.
     */
    @ExceptionHandler({ BadSqlGrammarException.class })
    public ResponseEntity<ApiError> onBadSql(BadSqlGrammarException ex, HttpServletRequest req) {
        String state = sqlStateOf(ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error de sintaxis SQL o columna/tabla inexistente.", req.getRequestURI(), state);
    }

    /**
     * Conexión con la BD (caída de red, allow_list, etc.).
     */
    @ExceptionHandler({ CannotGetJdbcConnectionException.class })
    public ResponseEntity<ApiError> onJdbcConn(CannotGetJdbcConnectionException ex, HttpServletRequest req) {
        String state = sqlStateOf(ex);
        return build(HttpStatus.SERVICE_UNAVAILABLE, "No fue posible conectarse a la base de datos.", req.getRequestURI(), state);
    }

    /**
     * Violaciones de constraint detectadas por Hibernate.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> onHibernateConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        String state = sqlStateOf(ex);
        return build(HttpStatus.CONFLICT, "Violación de restricción en la base de datos.", req.getRequestURI(), state);
    }

    /**
     * Operaciones sin resultado (p. ej., update/delete que no encontró filas).
     */
    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ApiError> onEmptyResult(EmptyResultDataAccessException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado para la operación solicitada.", req.getRequestURI(), null);
    }

    /**
     * Errores de validación en el body (si marcas el DTO con @Valid).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> onInvalidBody(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst().orElse("Body inválido.");
        return build(HttpStatus.BAD_REQUEST, msg, req.getRequestURI(), null);
    }

    /**
     * Passthrough para ResponseStatusException 
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> onRSE(ResponseStatusException ex, HttpServletRequest req) {
        return build(HttpStatus.valueOf(ex.getStatusCode().value()),
                Optional.ofNullable(ex.getReason()).orElse("Error de negocio."),
                req.getRequestURI(),
                sqlStateOf(ex));
    }

    /**
     * Cualquier otro error no mapeado.
     */
    @ExceptionHandler({ TransactionSystemException.class, DataAccessException.class, Exception.class })
    public ResponseEntity<ApiError> onGeneric(Exception ex, HttpServletRequest req) {
        String state = sqlStateOf(ex);
        String msg = Optional.ofNullable(ex.getMessage()).orElse("Error interno del servidor.");
        return build(HttpStatus.INTERNAL_SERVER_ERROR, msg, req.getRequestURI(), state);
    }
}
