package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import uao.edu.co.scouts_project.member.dto.CreateMemberDTO;
import uao.edu.co.scouts_project.member.model.Member;

@Schema(description = "Datos para crear un usuario con rol ADMIN_GRUPO en el grupo")
public record CreateGroupAdminRequestDTO(

                @NotBlank @Email @Schema(example = "admin.grupo@example.com") String email,

                @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") @Schema(example = "Str0ngP4ss!") String password,

                @NotBlank @Size(min = 3, max = 50) @Schema(example = "admin.grupo") String username,

                @Schema(description = "Miembro asociado al admin del grupo") CreateMemberDTO member

) {
}
