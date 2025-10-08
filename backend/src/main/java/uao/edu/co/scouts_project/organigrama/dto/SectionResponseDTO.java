package uao.edu.co.scouts_project.organigrama.dto;

import java.time.Instant;
import java.util.List;

public record SectionResponseDTO(
    Long sectionId,
    String tenantId,
    Long groupId,
    String name,
    String description,
    String iconObjectUrl,
    String photoPrincipalUrl,
    List<String> galleryObjectUrls, 
    Instant createdAt,
    Instant updatedAt
) {}