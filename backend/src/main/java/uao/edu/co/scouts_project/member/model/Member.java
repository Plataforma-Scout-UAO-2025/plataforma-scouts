package uao.edu.co.scouts_project.member.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.Type;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

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
    private String documentType;
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

    @Column(nullable = false)
    private String status;

    private LocalDate acceptanceDate;

    @Column(name = "in_charge_of", nullable = false)
    private List<Integer> inChargeOf;

    @Type(JsonType.class)
    @Column(name = "emergencyContact")
    private Map<String, Object> emergencyContact;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

}

