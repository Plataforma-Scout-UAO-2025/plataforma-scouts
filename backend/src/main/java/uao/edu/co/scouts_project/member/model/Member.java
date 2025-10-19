package uao.edu.co.scouts_project.member.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;

@Builder
@Entity
@Getter
@Setter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    private Integer guardianId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subgroup_id")
    private Subgroup subgroup;

    @NotNull
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotNull
    @Column(name = "last_name", nullable = false)
    private String lastName;

    private Integer age;

    @NotNull
    @Column(nullable = false)
    private String role;

    @NotNull
    @Column(nullable = false)
    private String identification;

    @Column(name = "document_type")
    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    @Email
    private String email;

    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;

    @Column(name = "is_active")
    private Boolean isActive;

    private String relationship;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "acceptance_date")
    private LocalDate acceptanceDate;


    @Type(JsonType.class)
    @Column(name = "emergency_contacts", columnDefinition = "jsonb")
    private List<EmergencyContact> emergencyContacts;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @EqualsAndHashCode
    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmergencyContact {

        @NotNull
        private String name;
        @NotNull
        private String relationship;
        @NotNull
        private String phone;
    }

}