package uao.edu.co.scouts_project.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponseDTO {
    private String userId;
    private String firstName;
    private String lastName;
    private Integer age;
    private String role;
    private String email;
    private String gender;
    private LocalDate birthDate;
    private String phone;
    private Boolean isActive;
    private Status status;
    private LocalDate acceptanceDate;
    private String subgroupName;
}