package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    @JsonProperty("member_id")
    private Long memberId;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("guardian_id")
    private Integer guardianId;

    @JsonProperty("subgroup_id")
    private Long subgroupId;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private Integer age;

    private String role;

    private String identification;

    @JsonProperty("document_type")
    private String documentType;  // Se convierte a/desde enum en el mapper

    private String email;

    private String gender;

    @JsonProperty("birth_date")
    private LocalDate birthDate;

    private String address;

    private String phone;

    private String weight;

    private String height;

    private String hobbies;

    private String sports;

    private String instruments;

    @JsonProperty("is_active")
    private Boolean isActive;

    private String relationship;

    private String status;  // Se convierte a/desde enum en el mapper

    @JsonProperty("acceptance_date")
    private LocalDate acceptanceDate;

    @JsonProperty("emergency_contacts")
    private List<EmergencyContactDto> emergencyContacts;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmergencyContactDto {
        private String name;
        private String relationship;
        private String phone;
    }
}