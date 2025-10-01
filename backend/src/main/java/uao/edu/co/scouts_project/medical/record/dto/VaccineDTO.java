package uao.edu.co.scouts_project.medical.record.dto;

public record VaccineDTO(
        String name,
        String appliedAt // ISO date (yyyy-MM-dd) o datetime
) {}
