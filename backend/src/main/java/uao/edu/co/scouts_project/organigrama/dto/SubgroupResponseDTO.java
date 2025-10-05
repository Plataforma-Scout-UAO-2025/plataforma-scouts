package uao.edu.co.scouts_project.organigrama.dto;

import java.time.Instant;
import java.util.List;

public record SubgroupResponseDTO(
    Long subgroupId,
    String tenantId,
    Long groupId,
    Long sectionId,
    String name,
    String description,
    String photoPrincipalUrl,
    List<String> galleryObjectUrls, 
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}