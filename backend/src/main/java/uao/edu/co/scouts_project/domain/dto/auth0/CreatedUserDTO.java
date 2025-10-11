package uao.edu.co.scouts_project.domain.dto.auth0;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class CreatedUserDTO {
   private String id;
   private String email;
   private String username;
   private boolean emailVerified;
}
