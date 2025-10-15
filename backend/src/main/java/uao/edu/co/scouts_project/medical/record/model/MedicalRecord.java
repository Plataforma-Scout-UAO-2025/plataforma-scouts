package uao.edu.co.scouts_project.medical.record.model;

import uao.edu.co.scouts_project.medical.record.dto.MedicationDTO;
import uao.edu.co.scouts_project.medical.record.dto.VaccineDTO;

import java.time.OffsetDateTime;
import java.util.List;

public class MedicalRecord {
    private final Long id;                       // medical_record_id (BIGINT)
    private final String tenantId;               // <-- String multi-tenant
    private final Long memberId;                 // 1:1 dentro del tenant
    private final String bloodType;              // obligatorio
    private final String eps;
    private final String allergies;
    private final String chronicDiseases;
    private final String physicalRestrictions;
    private final String surgicalHistory;
    private final Boolean active;
    private final List<MedicationDTO> medicationsDetail; // JSONB
    private final List<VaccineDTO> vaccinesDetail;       // JSONB
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;

    public MedicalRecord(Long id, String tenantId, Long memberId, String bloodType,
                         String eps, String allergies, String chronicDiseases,
                         String physicalRestrictions, String surgicalHistory,
                         Boolean active,
                         List<MedicationDTO> medicationsDetail,
                         List<VaccineDTO> vaccinesDetail,
                         OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.memberId = memberId;
        this.bloodType = bloodType;
        this.eps = eps;
        this.allergies = allergies;
        this.chronicDiseases = chronicDiseases;
        this.physicalRestrictions = physicalRestrictions;
        this.surgicalHistory = surgicalHistory;
        this.active = active;
        this.medicationsDetail = medicationsDetail;
        this.vaccinesDetail = vaccinesDetail;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getTenantId() { return tenantId; }
    public Long getMemberId() { return memberId; }
    public String getBloodType() { return bloodType; }
    public String getEps() { return eps; }
    public String getAllergies() { return allergies; }
    public String getChronicDiseases() { return chronicDiseases; }
    public String getPhysicalRestrictions() { return physicalRestrictions; }
    public String getSurgicalHistory() { return surgicalHistory; }
    public Boolean getActive() { return active; }
    public List<MedicationDTO> getMedicationsDetail() { return medicationsDetail; }
    public List<VaccineDTO> getVaccinesDetail() { return vaccinesDetail; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
