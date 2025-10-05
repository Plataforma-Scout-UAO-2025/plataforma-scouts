package uao.edu.co.scouts_project.medical.record.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/** Payload para crear ficha médica. tenantId se toma del header X-Tenant-Id. */
public record CreateMedicalRecordDTO(
        Long id, // medical_record_id (BIGINT) provisto por el cliente
        @NotBlank(message = "bloodType is required")
        String bloodType,        // A+, A-, B+, B-, AB+, AB-, O+, O-
        String eps,
        String allergies,
        String chronicDiseases,
        String physicalRestrictions,
        String surgicalHistory,
        Boolean active,          // por defecto true si viene null
        List<MedicationDTO> medicationsDetail,
        List<VaccineDTO> vaccinesDetail
) {}
