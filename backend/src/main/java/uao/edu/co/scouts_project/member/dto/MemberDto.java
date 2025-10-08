package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    @JsonProperty("memberId")
    private Long memberId;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("guardianId")
    private Integer guardianId;

    @JsonProperty("subgroup")
    private SubgroupDTO subgroup;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    private Integer age;

    private String role;

    private String identification;

    @JsonProperty("documentType")
    private String documentType;  // Se convierte a/desde enum en el mapper

    private String email;

    private String gender;

    @JsonProperty("birthDate")
    private LocalDate birthDate;

    private String address;

    private String phone;

    private String weight;

    private String height;

    private String hobbies;

    private String sports;

    private String instruments;

    @JsonProperty("isActive")
    private Boolean isActive;

    private String relationship;

    private String status;

    @JsonProperty("acceptanceDate")
    private LocalDate acceptanceDate;

    @JsonProperty("emergencyContacts")
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