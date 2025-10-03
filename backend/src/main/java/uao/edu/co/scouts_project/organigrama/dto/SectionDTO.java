package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public record SectionDTO(
    Long sectionId,
    Long tenantId,
    Long groupId,
    @NotBlank String name,
    String description,
    UUID iconObjectId,
    UUID photoPrincipal,
    UUID[] galleryObjectIds,
    Instant createdAt,
    Instant updatedAt
) {}
