package uao.edu.co.scouts_project.medical.record.dto;

import java.util.List;

/** Payload para crear ficha médica (member_id viene en el path). */
public record CreateMedicalRecordDTO(
        Long id,                 // medical_record_id (BIGINT) provisto por el cliente
        Long tenantId,           // opcional
        String bloodType,        // obligatorio: A+, A-, B+, B-, AB+, AB-, O+, O-
        String eps,
        String allergies,
        String chronicDiseases,
        String physicalRestrictions,
        String surgicalHistory,
        Boolean active,          // por defecto true si viene null
        List<MedicationDTO> medicationsDetail,
        List<VaccineDTO> vaccinesDetail
) {}
