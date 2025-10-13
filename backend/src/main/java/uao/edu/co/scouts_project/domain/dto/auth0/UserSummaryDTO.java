package uao.edu.co.scouts_project.domain.dto.auth0;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDTO {
    private String id;
    private String email;
    private String username;
}
