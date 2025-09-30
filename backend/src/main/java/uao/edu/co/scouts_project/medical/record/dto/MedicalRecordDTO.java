package uao.edu.co.scouts_project.medical.record.dto;

import java.time.OffsetDateTime;
import java.util.List;

/** DTO expuesto al frontend (alineado con tu estilo de records). */
public record MedicalRecordDTO(
        String id,                      // toString() para simetría con otros módulos
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
