package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el rol de un miembro.
 * Se utiliza cuando el rol de un usuario cambia en Auth0 o sistema externo
 * y necesita sincronizarse con la base de datos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleDto {

    /**
     * ID del usuario (userId) cuyo rol se va a actualizar.
     * Debe coincidir con el userId almacenado en la tabla de miembros.
     */
    @JsonProperty("memberId")
    private Long memberId;

    /**
     * Nuevo rol del usuario.
     * Este valor proviene típicamente de Auth0 o del sistema de autenticación.
     * Ejemplos: "ADMIN", "LEADER", "MEMBER", "COORDINATOR", etc.
     */
    @JsonProperty("newRole")
    private String newRole;
}