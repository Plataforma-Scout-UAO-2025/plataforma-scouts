package uao.edu.co.scouts_project.domain.dto.auth0;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "Comando para crear un usuario con un rol específico")
public class CreateUserWithRoleCommandDTO {

    @Schema(description = "Correo electrónico del usuario", example = "usuario@example.com")
    @Email(message = "email debe ser un correo válido")
    @NotBlank(message = "email es obligatorio")
    private String email;

    @Schema(description = "Contraseña del usuario", example = "P4ssw0rd!", minLength = 8, maxLength = 64)
    @NotBlank(message = "password es obligatorio")
    @Size(min = 8, max = 64, message = "password debe tener entre 8 y 64 caracteres")
    private String password;

    @Schema(description = "Nombre de usuario", example = "juan.perez", minLength = 3, maxLength = 50)
    @NotBlank(message = "username es obligatorio")
    @Size(min = 3, max = 50, message = "username debe tener entre 3 y 50 caracteres")
    private String username;

    @Schema(
        description = "Rol a asignar al usuario. El servicio validará si el rol es permitido para este endpoint.",
        example = "SCOUT"
    )
    @NotNull(message = "role es obligatorio")
    private String role;
}
