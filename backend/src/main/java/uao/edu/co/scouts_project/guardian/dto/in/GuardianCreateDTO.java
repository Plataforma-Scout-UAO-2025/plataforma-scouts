package uao.edu.co.scouts_project.guardian.dto.in;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;


/**
 * Represents a DTO of inputs for Guardian with associated Members.
 *
 * <p>
 * This class only deals with serving inputs validate types and then map to an entity for persistence
 * 
 * Writings of type save and update (when only updating guardian info)
 * </p>
 *
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianCreateDTO {
    private String userId;
    private SubgroupDTO subgroup;
    private Role rol;
    private String tenantId;
    private String subgroupId;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @Positive
    private Integer age;
    @Size(max = 10)
    private String identification;
    private DocumentType documentType;
    @Size(max = 10)
    private String phone;
    private String relationship;
    private Boolean isActive;
    private Status status;
    private LocalDate acceptanceDate;
}