package uao.edu.co.scouts_project.guardian.dto.out;

import java.time.LocalDate;
import java.util.List;
import java.util.StringTokenizer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;
import uao.edu.co.scouts_project.infrastructure.security.Role;


/**
 * Represents a DTO response for Guardian with associated Members.
 *
 * <p>
 * This class only deals with serving responses from the database to show
 * guardian with members and members with emergency contacts
 * 
 * This DTO can also be used for update in batch members associated 
 * </p>
 *
 */
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianWIthMemberDTO {

    private String userId;
    private SubgroupDTO subgroup;
    private List<Role> roles;
    private String tenantId;
    private SubgroupDTO subgroupId;
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
    private Boolean isActive;
    private String relationship;
    private Status status;
    private LocalDate acceptanceDate;
    private List<MemberDTO> members;

}
