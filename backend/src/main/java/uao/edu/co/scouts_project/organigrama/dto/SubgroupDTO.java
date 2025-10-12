package uao.edu.co.scouts_project.organigrama.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public record SubgroupDTO(
        @JsonProperty("subgroupId") Long subgroupId,
        @JsonProperty("tenantId") String tenantId,
        @JsonProperty("groupId") Long groupId,
        @JsonProperty("sectionId") Long sectionId,
        @JsonProperty("name") @NotBlank String name,
        @JsonProperty("description") String description,
        @JsonProperty("photoPrincipal") UUID photoPrincipal,
        // TODO: GALERÍA DE FOTOS - Campo temporalmente deshabilitado
        // UUID[] galleryObjectIds,
        @JsonProperty("isActive") Boolean isActive,
        @JsonProperty("createdAt") Instant createdAt,
        @JsonProperty("updatedAt") Instant updatedAt
) {}