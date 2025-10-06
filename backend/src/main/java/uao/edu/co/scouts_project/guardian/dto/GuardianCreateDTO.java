package uao.edu.co.scouts_project.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianCreateDTO {
    @NotNull
    private String tenantId;

    @NotNull
    private Long subgroupId;

    @NotNull
    private String firstName;

    @NotNull
    private String lastName;

    private Integer age;

    @NotNull
    private String identification;

    private DocumentType documentType;

    @Email
    private String email;

    private String gender;
    private LocalDate birthDate;
    private String address;
    private String phone;
    private Boolean isActive;

    @NotNull
    private String relationship;

    private Status status;
    private LocalDate acceptanceDate;
    private List<String> memberIdsInCharge;
    private List<EmergencyContactDTO> emergencyContacts;
}