package uao.edu.co.scouts_project.medical.record.repository.jpa;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;

import uao.edu.co.scouts_project.medical.record.dto.MedicationDTO;
import uao.edu.co.scouts_project.medical.record.dto.VaccineDTO;
import uao.edu.co.scouts_project.medical.record.repository.jpa.converter.MedicationListConverter;
import uao.edu.co.scouts_project.medical.record.repository.jpa.converter.VaccineListConverter;

@Entity
@Table(
    name = "medical_record",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_medical_record_tenant_member",
        columnNames = {"tenant_id","member_id"}
    )
)
public class MedicalRecordEntity {

    @Id
    @Column(name = "medical_record_id", nullable = false)
    private Long medicalRecordId;

    @Column(name = "tenant_id", nullable = false) // <-- String en DB (text/varchar)
    private String tenantId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "blood_type", nullable = false)
    private String bloodType;

    @Column(name = "eps")
    private String eps;

    @Column(name = "allergies")
    private String allergies;

    @Column(name = "chronic_diseases")
    private String chronicDiseases;

    @Column(name = "physical_restrictions")
    private String physicalRestrictions;

    @Column(name = "surgical_history")
    private String surgicalHistory;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Convert(converter = VaccineListConverter.class)
    @Column(name = "vaccines_detail", columnDefinition = "jsonb")
    private List<VaccineDTO> vaccinesDetail;

    @Convert(converter = MedicationListConverter.class)
    @Column(name = "medications_detail", columnDefinition = "jsonb")
    private List<MedicationDTO> medicationsDetail;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        var now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (active == null) active = Boolean.TRUE;
    }

    @PreUpdate
    void onUpdate() { updatedAt = OffsetDateTime.now(); }

    // getters/setters
    public Long getMedicalRecordId() { return medicalRecordId; }
    public void setMedicalRecordId(Long v) { this.medicalRecordId = v; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String v) { this.tenantId = v; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long v) { this.memberId = v; }
    public String getBloodType() { return bloodType; }
    public void setBloodType(String v) { this.bloodType = v; }
    public String getEps() { return eps; }
    public void setEps(String v) { this.eps = v; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String v) { this.allergies = v; }
    public String getChronicDiseases() { return chronicDiseases; }
    public void setChronicDiseases(String v) { this.chronicDiseases = v; }
    public String getPhysicalRestrictions() { return physicalRestrictions; }
    public void setPhysicalRestrictions(String v) { this.physicalRestrictions = v; }
    public String getSurgicalHistory() { return surgicalHistory; }
    public void setSurgicalHistory(String v) { this.surgicalHistory = v; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean v) { this.active = v; }
    public List<VaccineDTO> getVaccinesDetail() { return vaccinesDetail; }
    public void setVaccinesDetail(List<VaccineDTO> v) { this.vaccinesDetail = v; }
    public List<MedicationDTO> getMedicationsDetail() { return medicationsDetail; }
    public void setMedicationsDetail(List<MedicationDTO> v) { this.medicationsDetail = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
}
