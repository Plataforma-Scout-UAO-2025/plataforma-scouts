package uao.edu.co.scouts_project.statistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Número total de miembros en la base de datos")
public record TotalMembersDTO(
    @JsonProperty("total_members_count")
    Long totalMembersCount
) {}
