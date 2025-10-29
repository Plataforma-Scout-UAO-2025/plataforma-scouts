package uao.edu.co.scouts_project.domain.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder; // ¡Añadido! Útil para crear respuestas de manera fluida
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.io.Serializable;

/**
 * DTO genérico para estandarizar todas las respuestas del API.
 * Usa Lombok y Generics (<T>) para la máxima limpieza.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseDTO<T> implements Serializable {
    private int status;
    private String message;
    private T data;
    private String errorCode;

}