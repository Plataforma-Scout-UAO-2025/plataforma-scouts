package uao.edu.co.scouts_project.member.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
import uao.edu.co.scouts_project.member.shared.DocumentType;

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
    private Long memberId;

    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subgroup_id", referencedColumnName = "subgroup_id", nullable = false)
    private Subgroup subgroup;

    private String firstName;
    private String lastName;
    
    @NotNull
    private Integer age;
    private String role;
    
    @NotNull
    private String identification;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    @Email
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


    @Column(nullable = false)
    private String status;

    private LocalDate acceptanceDate;

    @Column(name = "in_charge_of", nullable = false)
    private List<Integer> inChargeOf;

    @Type(JsonType.class)
    @Column(name = "emergencyContact")
    private Map<String, Object> emergencyContact;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, updatable = true)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Entity
    public static class Subgroup {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long subgroupId;

    }

}
