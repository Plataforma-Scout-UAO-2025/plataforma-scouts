package uao.edu.co.scouts_project.guardian.dto.shared;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class MemberDTO {
    private String userId;
    private String tenantId;
    private SubgroupDTO subgroup;
    private String firstName;
    private String lastName;
    private Integer age;
    private String role;
    private String identification;
    private DocumentType documentType;
    private String email;
    private String gender;
    private LocalDate birthDate;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;
    private Boolean isActive;
    private String relationship;
    private Status status;
    private LocalDate acceptanceDate;
    private Integer guardianId;
    private List<EmergencyContactDTO> emergencyContacts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}