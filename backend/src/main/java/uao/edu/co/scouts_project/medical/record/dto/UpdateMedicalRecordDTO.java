package uao.edu.co.scouts_project.medical.record.dto;

import java.util.List;

/** PUT = reemplazo completo (member_id del path NO cambia). */
public record UpdateMedicalRecordDTO(
        Long tenantId,
        String bloodType,        // obligatorio
        String eps,
        String allergies,
        String chronicDiseases,
        String physicalRestrictions,
        String surgicalHistory,
        Boolean active,
        List<MedicationDTO> medicationsDetail,
        List<VaccineDTO> vaccinesDetail
) {}
