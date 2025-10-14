package uao.edu.co.scouts_project.medical.record.dto;

import jakarta.validation.constraints.NotBlank;

public record VaccineDTO(
        @NotBlank(message = "Vaccine name is required")
        String name,
        @NotBlank(message = "appliedAt is required (yyyy-MM-dd)")
        String appliedAt // ISO date (yyyy-MM-dd) o datetime
) {}
