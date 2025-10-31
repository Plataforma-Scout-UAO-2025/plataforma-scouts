package uao.edu.co.scouts_project.statistics.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Información de miembros por grupo")
public record GroupMembersDTO(
    @JsonProperty("group_id") 
    Long groupId,
    
    @JsonProperty("group_name") 
    String groupName,
    
    @JsonProperty("status")
    String status,

    @JsonProperty("member_count") 
    Long memberCount
) { }
