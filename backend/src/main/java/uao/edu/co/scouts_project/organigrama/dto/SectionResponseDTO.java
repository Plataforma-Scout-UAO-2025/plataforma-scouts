package uao.edu.co.scouts_project.organigrama.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SectionResponseDTO(
    Long sectionId,
    String tenantId,
    Long groupId,
    String name,
    String description,
    UUID iconObjectId,
    String iconObjectUrl,
    UUID photoPrincipalId,
    String photoPrincipalUrl,

    // (Legacy) — se mantiene por compatibilidad temporal con el FE antiguo
    List<String> galleryObjectUrls,

    // (Nuevo) — contrato estable para galería
    List<GalleryItemDTO> gallery,

    Instant createdAt,
    Instant updatedAt
) {
    public record GalleryItemDTO(UUID id, String url) {}
}