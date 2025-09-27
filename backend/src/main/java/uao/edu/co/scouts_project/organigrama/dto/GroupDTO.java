package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public record GroupDTO(
    Long groupId,
    Long tenantId,
    @NotBlank String slug,
    @NotBlank String name,
    String district,
    String identifierNumber,
    String address,
    String phone,
    @Email String email,
    LocalDate foundedOn,
    String motto,
    String mission,
    String vision,
    String history,
    UUID logoObjectId,
    UUID scarfObjectId,
    Map<String, Object> socialLinks,
    Map<String, Object> config,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}