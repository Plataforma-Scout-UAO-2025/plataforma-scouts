package uao.edu.co.scouts_project.medical.record.dto;

import java.time.OffsetDateTime;
import java.util.List;

/** DTO expuesto al frontend. */
public record MedicalRecordDTO(
        String id,                      // medical_record_id como String
        String tenantId,                // viene del header/token
        String memberId,
        String bloodType,
        String eps,
        String allergies,
        String chronicDiseases,
        String physicalRestrictions,
        String surgicalHistory,
        Boolean active,
        List<MedicationDTO> medicationsDetail,
        List<VaccineDTO> vaccinesDetail,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
