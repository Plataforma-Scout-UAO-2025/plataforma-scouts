package uao.edu.co.scouts_project.organigrama.dto;

import java.time.Instant;
import java.util.UUID;
// TODO: GALERÍA DE FOTOS - Import temporalmente comentado
// import java.util.List;

public record SubgroupResponseDTO(
    Long subgroupId,
    String tenantId,
    Long groupId,
    Long sectionId,
    String name,
    String description,
    UUID photoPrincipalId,
    String photoPrincipalUrl,
    // TODO: GALERÍA DE FOTOS - Campo temporalmente deshabilitado
    // List<String> galleryObjectUrls, 
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}