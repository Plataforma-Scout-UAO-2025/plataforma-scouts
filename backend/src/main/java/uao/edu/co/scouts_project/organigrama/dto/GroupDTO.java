package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record GroupDTO(
    Long groupId,
    String tenantId,
    @NotBlank String slug,
    @NotBlank String name,
    String district,
    String identifierNumber,
    String address,
    String phone,
    @Email String email,
    LocalDate foundedIn,
    String motto,
    String mission,
    String vision,
    String history,
    UUID logoObjectId,
    UUID scarfObjectId,
    Map<String, Object> socialLinks,
    Map<String, Object> config,
    Boolean isActive,
    String status,
    LocalDateTime createdAt,    
    LocalDateTime updatedAt  
) {}