package uao.edu.co.scouts_project.statistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estadísticas de grupos dentro de un tenant")
public record GroupStatisticsDTO(
    @Schema(description = "Número de grupos activos en el tenant", example = "5")
    @JsonProperty("active_groups_count")
    Long activeGroupsCount
) {}