package uao.edu.co.scouts_project.guardian.dto.in;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianCreateDTO {
    private String userId;
    private SubgroupDTO subgroup;
    private String rol;
    private String tenantId;
    private String subgroupId;
    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
    @Positive(message = "Age must be positive")
    private Integer age;
    @Size(max = 10, message = "Identification must not exceed 10 characters")
    private String identification;
    private DocumentType documentType;
    @Size(max = 10, message = "Phone must not exceed 10 characters")
@Size(max = 10, message = "Phone must not exceed 10 characters")
    private String phone;
    private String relationship;
    private Boolean isActive;
    private Status status;
    private LocalDate acceptanceDate;
}