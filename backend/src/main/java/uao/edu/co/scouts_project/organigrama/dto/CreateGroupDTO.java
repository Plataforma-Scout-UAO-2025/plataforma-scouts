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
    public String slug;

    @NotBlank
    public String name;

    public String district;
    public String identifierNumber;
    public String address;
    public String phone;

    @Email
    public String email;
    public Boolean isActive;
    public String status;

}
