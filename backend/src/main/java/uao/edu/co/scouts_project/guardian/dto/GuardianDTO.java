package uao.edu.co.scouts_project.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianDTO {
    private String userId;
    private String tenantId;
    private String subgroupId;
    private String firstName;
    private String lastName;
    private Integer age;
    private String identification;
    private DocumentType documentType;
    private String phone;
    private Boolean isActive;
    private String relationship;
    private Status status;
    private LocalDate acceptanceDate;
    private List<MemberSummaryDTO> membersInCharge;
}