package uao.edu.co.scouts_project.organigrama.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public record GroupResponseDTO(
    Long groupId,
    String tenantId,
    String slug,
    String name,
    String district,
    String identifierNumber,
    String address,
    String phone,
    String email,
    LocalDate foundedIn,
    String motto,
    String mission,
    String vision,
    String history,
    String logoObjectUrl,   
    String scarfObjectUrl,  
    Map<String, Object> socialLinks,
    Map<String, Object> config,
    Boolean isActive,
    String status,
    LocalDateTime createdAt,    
    LocalDateTime updatedAt  
) {}