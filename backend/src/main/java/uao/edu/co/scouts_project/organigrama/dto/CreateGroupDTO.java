package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
// DTO needed to create a Group, Tenant on Own System and Auth0
public class CreateGroupDTO {
    @NotBlank
    private String slug;

    @NotBlank
    private String name;

    private String district;
    private String identifierNumber;
    private String address;
    private String phone;

    @Email
    private String email;
    private Boolean isActive;
    private String status;

}
