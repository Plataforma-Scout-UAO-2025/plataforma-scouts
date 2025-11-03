package uao.edu.co.scouts_project.organigrama.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultado de creación del admin de grupo")
public record GroupAdminCreatedResponseDTO(
    Long groupId,
    String tenantId,
    String userId,
    String email,
    String assignedRole
) {}
