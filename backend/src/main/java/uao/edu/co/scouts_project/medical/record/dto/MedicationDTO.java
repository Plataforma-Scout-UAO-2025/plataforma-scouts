package uao.edu.co.scouts_project.medical.record.dto;

import jakarta.validation.constraints.NotBlank;

public record MedicationDTO(
        @NotBlank(message = "Medication name is required")
        String name,
        @NotBlank(message = "Medication dose is required")
        String dose,
        @NotBlank(message = "Medication frequency is required")
        String frequency
) {}
