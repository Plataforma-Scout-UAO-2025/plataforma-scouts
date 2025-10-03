package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public record SubgroupDTO(
    Long subgroupId,
    Long tenantId,
    Long groupId,
    Long sectionId,
    @NotBlank String name,
    String description,
    UUID photoPrincipal,
    UUID[] galleryObjectIds,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}
