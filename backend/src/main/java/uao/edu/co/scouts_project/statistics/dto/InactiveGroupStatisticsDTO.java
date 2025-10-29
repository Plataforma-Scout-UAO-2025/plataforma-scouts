package uao.edu.co.scouts_project.statistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estadísticas de grupos inactivos dentro de un tenant")
public record InactiveGroupStatisticsDTO(
    @Schema(description = "Número de grupos inactivos en el tenant", example = "2")
    @JsonProperty("inactive_groups_count")
    Long inactiveGroupsCount
) {}
