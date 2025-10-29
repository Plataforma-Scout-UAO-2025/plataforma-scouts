package uao.edu.co.scouts_project.domain.dto.auth0;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserAuth0ChangeRoleDTO {
    @JsonProperty("user_id")
    private String user_id;

    @JsonProperty("newRole")
    private String newRole;

    // Optional: for ADMIN_GLOBAL to validate membership against a specific organization
    @JsonProperty("organizationId")
    private String organizationId;
}
