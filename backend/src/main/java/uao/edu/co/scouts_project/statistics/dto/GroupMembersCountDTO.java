package uao.edu.co.scouts_project.statistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Conteo de miembros por grupo")
public record GroupMembersCountDTO(
    @JsonProperty("group_id") Long groupId,
    @JsonProperty("group_name") String groupName,
    @JsonProperty("status") String status,
    @JsonProperty("members_count") Long membersCount
) {}
