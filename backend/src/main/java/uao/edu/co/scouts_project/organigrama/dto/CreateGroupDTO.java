package uao.edu.co.scouts_project.organigrama.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("slug")
    @NotBlank
    public String slug;

    @JsonProperty("name")
    @NotBlank
    public String name;

    @JsonProperty("district")
    public String district;

    @JsonProperty("identifier_number")
    public String identifierNumber;

    @JsonProperty("address")
    public String address;
    @JsonProperty("phone")
    public String phone;

    @JsonProperty("email")
    @Email
    public String email;
    
    @JsonProperty("is_active")
    public Boolean isActive;
    @JsonProperty("status")
    public String status;

}
