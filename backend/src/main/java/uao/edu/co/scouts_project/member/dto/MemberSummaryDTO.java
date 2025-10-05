package uao.edu.co.scouts_project.member.dto;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigram.Subgroup;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberSummaryDTO {
    private String userId;
    private String tenantId;
    private Subgroup subgroup;
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
    private List<Integer> inChargeOf;
    private List<EmergencyContactDTO> emergencyContacts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}