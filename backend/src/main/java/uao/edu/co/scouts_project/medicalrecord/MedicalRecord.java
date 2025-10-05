package uao.edu.co.scouts_project.medicalrecord;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.validation.constraints.NotNull;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medical_record_id")
    private Long medicalRecordId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "blood_type")
    private String bloodType;

    private String eps;
    private String allergies;

    @Column(name = "chronic_diseases")
    private String chronicDiseases;

    @Column(name = "physical_restrictions")
    private String physicalRestrictions;

    @Column(name = "surgical_history")
    private String surgicalHistory;

    private Boolean active;

    @Type(JsonType.class)
    @Column(name = "medication_details", columnDefinition = "jsonb")
    private List<MedicationDetail> medicationDetails;

    @Type(JsonType.class)
    @Column(name = "vaccine_details", columnDefinition = "jsonb")
    private List<VaccineDetail> vaccineDetails;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @EqualsAndHashCode
    public static class MedicationDetail {
        private String name;
        private String intakeFrequency;
    }

    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @EqualsAndHashCode
    public static class VaccineDetail {
        private String name;
        private LocalDate date;
    }

}
