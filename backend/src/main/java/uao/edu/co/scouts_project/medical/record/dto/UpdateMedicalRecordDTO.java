package uao.edu.co.scouts_project.medical.record.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/** PUT = reemplazo completo. tenantId se toma del header X-Tenant-Id. */
public record UpdateMedicalRecordDTO(
        @NotBlank(message = "bloodType is required")
        String bloodType,
        String eps,
        String allergies,
        String chronicDiseases,
        String physicalRestrictions,
        String surgicalHistory,
        Boolean active,
        List<MedicationDTO> medicationsDetail,
        List<VaccineDTO> vaccinesDetail
) {}
